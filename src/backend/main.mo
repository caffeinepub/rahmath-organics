import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // === STABLE STORAGE for kvStore (survives upgrades/redeployments) ===
  stable var stableKv : [(Text, Text)] = [];
  let kvStore = Map.empty<Text, Text>();

  system func preupgrade() {
    stableKv := kvStore.toArray();
  };

  system func postupgrade() {
    for ((k, v) in stableKv.vals()) {
      kvStore.add(k, v);
    };
    stableKv := [];
  };

  // No authorization required - any caller can read/write products
  public shared func kvSet(key : Text, value : Text) : async () {
    kvStore.add(key, value);
  };

  public shared func kvDelete(key : Text) : async () {
    kvStore.remove(key);
  };

  public query func kvGet(key : Text) : async ?Text {
    kvStore.get(key);
  };

  public query func kvGetAll() : async [(Text, Text)] {
    kvStore.toArray();
  };

  // === Legacy types (kept for compatibility) ===

  type Vendor = {
    id : Text;
    company : Text;
    contact : Text;
    revenue : Nat;
    productsCount : Nat;
  };

  type Product = {
    id : Text;
    name : Text;
    price : Nat;
    description : Text;
    image : Storage.ExternalBlob;
    stock : Nat;
    vendorId : Text;
  };

  type Order = {
    id : Text;
    customerId : Principal;
    itemId : Text;
    quantity : Nat;
    totalPrice : Nat;
    orderTime : Int;
    paid : Bool;
  };

  type Cart = {
    customerId : Principal;
    items : [(Text, Nat)];
  };

  type TrendingProduct = {
    productId : Text;
    purchaseCount : Nat;
  };

  let trendingProducts = Map.empty<Text, Nat>();
  let products = Map.empty<Text, Product>();
  let vendors = Map.empty<Text, Vendor>();
  let orders = Map.empty<Text, Order>();
  let carts = Map.empty<Principal, Cart>();

  func incrementTrendingProduct(productId : Text, incrementAmount : Nat) {
    let newCount = switch (trendingProducts.get(productId)) {
      case (null) { incrementAmount };
      case (?count) { count + incrementAmount };
    };
    trendingProducts.add(productId, newCount);
  };

  module TrendingProduct {
    public func compare(t1 : TrendingProduct, t2 : TrendingProduct) : Order.Order {
      Nat.compare(t1.purchaseCount, t2.purchaseCount);
    };
  };

  public query func getTrendingProducts() : async [TrendingProduct] {
    trendingProducts.toArray().map(
      func((productId, purchaseCount)) {
        { productId; purchaseCount };
      }
    ).sort().reverse();
  };

  public shared ({ caller }) func checkOut(cartId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check out");
    };
    let cart = switch (carts.get(cartId)) {
      case (null) { Runtime.trap("Cart does not exist") };
      case (?cart) { cart };
    };
    let orderId = cartId.toText();
    let itemId = cart.items[0].0;
    let order = {
      id = orderId;
      customerId = caller;
      itemId;
      quantity = 1;
      totalPrice = 1;
      orderTime = 0;
      paid = true;
    };
    orders.add(orderId, order);
    carts.remove(cartId);
    for (i in cart.items.keys()) {
      incrementTrendingProduct(cart.items[i].0, cart.items[i].1);
    };
  };

  public query func getProduct(productId : Text) : async (?Product) {
    products.get(productId);
  };

  public query func getVendor(vendorId : Text) : async (?Vendor) {
    vendors.get(vendorId);
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Text, vendorId : Text) : async () {
    products.remove(productId);
  };

  public query func getProductsByVendorId(vendorId : Text) : async [Product] {
    products.values().toArray().filter(func(product) { product.vendorId == vendorId });
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public shared ({ caller }) func getProductsFromAdmin() : async [Product] {
    products.values().toArray();
  };

  public query func getOrder(orderId : Text) : async (?Order) {
    orders.get(orderId);
  };

  public type ProductInput = {
    name : Text;
    description : Text;
    image : ?Storage.ExternalBlob;
  };

  public shared ({ caller }) func addProductWithoutVendor(input : ProductInput) : async () {
    let productId = input.name # "-" # caller.toText();
    let placeholderImage : Storage.ExternalBlob = "" : Blob;
    let newProduct = {
      id = productId;
      name = input.name;
      description = input.description;
      image = switch (input.image) {
        case (null) { placeholderImage };
        case (?blob) { blob };
      };
      price = 0;
      stock = 1;
      vendorId = "";
    };
    products.add(productId, newProduct);
  };
};
