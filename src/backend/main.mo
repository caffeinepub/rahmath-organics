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

  // Maintains productId and purchase counts
  let trendingProducts = Map.empty<Text, Nat>();

  let products = Map.empty<Text, Product>();
  let vendors = Map.empty<Text, Vendor>();
  let orders = Map.empty<Text, Order>();
  let carts = Map.empty<Principal, Cart>();

  func addTrendingProduct(productId : Text, purchaseCount : Nat) {
    trendingProducts.add(productId, purchaseCount);
  };

  func incrementTrendingProduct(productId : Text, incrementAmount : Nat) {
    let newCount = switch (trendingProducts.get(productId)) {
      case (null) { incrementAmount };
      case (?count) { count + incrementAmount };
    };
    trendingProducts.add(productId, newCount);
  };

  func clearTrendingProducts() {
    trendingProducts.clear();
  };

  module TrendingProduct {
    public func compare(trendingProduct1 : TrendingProduct, trendingProduct2 : TrendingProduct) : Order.Order {
      Nat.compare(trendingProduct1.purchaseCount, trendingProduct2.purchaseCount);
    };
  };

  public query ({ caller }) func getTrendingProducts() : async [TrendingProduct] {
    trendingProducts.toArray().map(
      func((productId, purchaseCount)) {
        {
          productId;
          purchaseCount;
        };
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
    let itemId = cart.items[0].0; // Must be changed

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
      let currentItemId = cart.items[i].0;
      incrementTrendingProduct(currentItemId, cart.items[i].1);
    };
  };

  func verifyOwnership(productId : Text, vendorId : Text) : () {
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };
    if (product.vendorId != vendorId) {
      Runtime.trap("You cannot modify someone else's product");
    };
  };

  public shared ({ caller }) func getProduct(productId : Text) : async (?Product) {
    products.get(productId);
  };

  public shared ({ caller }) func getVendor(vendorId : Text) : async (?Vendor) {
    vendors.get(vendorId);
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Text, vendorId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete products");
    };
    verifyOwnership(productId, vendorId);
    products.remove(productId);
  };

  func updateProductByVendorId(index : Nat, vendorId : Text, product : Product) : ?Product {
    if (product.vendorId == vendorId) {
      ?product;
    } else { null };
  };

  public query ({ caller }) func getProductsByVendorId(vendorId : Text) : async [Product] {
    products.values().toArray().filter(func(product) { product.vendorId == vendorId });
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public shared ({ caller }) func getProductsFromAdmin() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all products");
    };
    products.values().toArray();
  };

  public shared ({ caller }) func getOrder(orderId : Text) : async (?Order) {
    orders.get(orderId);
  };

  public type ProductInput = {
    name : Text;
    description : Text;
    image : ?Storage.ExternalBlob;
  };

  public shared ({ caller }) func addProductWithoutVendor(input : ProductInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products without a vendor");
    };
    let productId = input.name;
    let newProduct = {
      id = productId;
      name = input.name;
      description = input.description;
      image = switch (input.image) {
        case (null) { Runtime.trap("Image must be provided") };
        case (?blob) { blob };
      };
      price = 0;
      stock = 1;
      vendorId = "";
    };
    products.add(productId, newProduct);
  };
};
