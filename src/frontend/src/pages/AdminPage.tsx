import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { SAMPLE_PRODUCTS } from "@/data/sampleProducts";
import {
  useAddProduct,
  useDeleteProduct,
  useGetProductsFromAdmin,
} from "@/hooks/useQueries";
import {
  LayoutDashboard,
  Loader2,
  Lock,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type Tab = "dashboard" | "products" | "orders";

interface LocalOrder {
  orderId: string;
  trackingId: string;
  customer: { fullName: string; mobile: string; city: string };
  status: string;
  placedAt: string;
  totalPrice: number;
  paymentMethod: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("rahmath_admin_auth") === "true",
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const { data: backendProducts, isLoading: loadingProducts } =
    useGetProductsFromAdmin();
  const addProduct = useAddProduct();
  const deleteProduct = useDeleteProduct();

  const [addOpen, setAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
  });

  const [orders, setOrders] = useState<LocalOrder[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("rahmath_orders") || "[]");
    } catch {
      return [];
    }
  });

  const products =
    backendProducts && backendProducts.length > 0
      ? backendProducts
      : SAMPLE_PRODUCTS;

  const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);

  const updateOrderStatus = (orderId: string, status: string) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.orderId === orderId ? { ...o, status } : o,
      );
      localStorage.setItem("rahmath_orders", JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogin = () => {
    if (username === "admin" && password === "rahmath@2024") {
      localStorage.setItem("rahmath_admin_auth", "true");
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      toast.error("Product name required");
      return;
    }
    try {
      await addProduct.mutateAsync({
        name: newProduct.name,
        description: newProduct.description,
      });
      toast.success("Product added!");
      setAddOpen(false);
      setNewProduct({ name: "", description: "", price: "" });
    } catch {
      toast.error("Failed to add product");
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync({ productId, vendorId: "" });
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (!isLoggedIn) {
    return (
      <main
        className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-muted/30 px-4"
        data-ocid="admin.card"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-lg p-8"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-green-700" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-1">
              RAHMATH ORGANICS
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="mt-1"
                data-ocid="admin.input"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="mt-1"
                data-ocid="admin.input"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {loginError && (
              <p
                className="text-sm text-red-600 text-center"
                data-ocid="admin.error_state"
              >
                {loginError}
              </p>
            )}

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white mt-2"
              onClick={handleLogin}
              data-ocid="admin.primary_button"
            >
              Login
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-120px)]" data-ocid="admin.panel">
      {/* Sidebar */}
      <aside className="w-56 bg-sidebar text-sidebar-foreground flex-shrink-0 flex flex-col">
        <div className="px-5 py-6 border-b border-sidebar-border">
          <p className="font-bold text-sm text-white">RAHMATH ORGANICS</p>
          <p className="text-xs text-sidebar-foreground/60 mt-0.5">
            Admin Dashboard
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {(
            [
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "products", label: "Products", icon: Package },
              { id: "orders", label: "Orders", icon: ShoppingBag },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === id
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
              }`}
              data-ocid="admin.tab"
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/50"
            onClick={() => {
              localStorage.removeItem("rahmath_admin_auth");
              setIsLoggedIn(false);
            }}
            data-ocid="admin.secondary_button"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 bg-background p-6 overflow-auto">
        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  label: "Total Orders",
                  value: orders.length,
                  color: "text-navy-700",
                  bg: "bg-navy-50",
                },
                {
                  label: "Total Products",
                  value: products.length,
                  color: "text-green-700",
                  bg: "bg-green-50",
                },
                {
                  label: "Total Revenue",
                  value: `₹${totalRevenue.toFixed(0)}`,
                  color: "text-amber-700",
                  bg: "bg-amber-50",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`${stat.bg} border border-border rounded-xl p-5`}
                >
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-4">Recent Orders</h3>
              {orders.length === 0 ? (
                <p
                  className="text-muted-foreground text-sm"
                  data-ocid="admin.empty_state"
                >
                  No orders yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map((order, idx) => (
                      <TableRow
                        key={order.orderId}
                        data-ocid={`admin.row.${idx + 1}`}
                      >
                        <TableCell className="font-mono text-xs">
                          {order.orderId}
                        </TableCell>
                        <TableCell>{order.customer.fullName}</TableCell>
                        <TableCell>₹{order.totalPrice.toFixed(0)}</TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${STATUS_COLORS[order.status] || ""}`}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "products" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Products</h2>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    data-ocid="admin.open_modal_button"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent data-ocid="admin.dialog">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div>
                      <Label>Product Name *</Label>
                      <Input
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="e.g. Organic Ashwagandha Powder"
                        className="mt-1"
                        data-ocid="admin.input"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) =>
                          setNewProduct((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Product description"
                        rows={3}
                        className="mt-1"
                        data-ocid="admin.textarea"
                      />
                    </div>
                    <div>
                      <Label>Price (₹)</Label>
                      <Input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct((p) => ({
                            ...p,
                            price: e.target.value,
                          }))
                        }
                        placeholder="e.g. 299"
                        className="mt-1"
                        data-ocid="admin.input"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleAddProduct}
                        disabled={addProduct.isPending}
                        data-ocid="admin.confirm_button"
                      >
                        {addProduct.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Add Product
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setAddOpen(false)}
                        data-ocid="admin.cancel_button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loadingProducts ? (
              <div
                className="text-center py-12"
                data-ocid="admin.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-navy-700" />
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p, idx) => {
                      const isBackend = "vendorId" in p;
                      const name = p.name;
                      const price = isBackend
                        ? Number((p as any).price) / 100
                        : (p as any).retailPrice;
                      const stock = isBackend
                        ? Number((p as any).stock)
                        : (p as any).stock;
                      const id = p.id;
                      return (
                        <TableRow key={id} data-ocid={`admin.row.${idx + 1}`}>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell>₹{price}</TableCell>
                          <TableCell>{stock}</TableCell>
                          <TableCell>
                            {isBackend && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(id)}
                                disabled={deleteProduct.isPending}
                                data-ocid={`admin.delete_button.${idx + 1}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold mb-6">Orders ({orders.length})</h2>
            {orders.length === 0 ? (
              <div
                className="text-center py-20 text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No orders have been placed yet</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, idx) => (
                      <TableRow
                        key={order.orderId}
                        data-ocid={`admin.row.${idx + 1}`}
                      >
                        <TableCell className="font-mono text-xs">
                          {order.orderId}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">
                            {order.customer.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.customer.mobile}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.items?.length || 0} item(s)
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{order.totalPrice.toFixed(0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {order.paymentMethod === "qr" ? "QR/UPI" : "COD"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${STATUS_COLORS[order.status] || ""}`}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order.orderId, e.target.value)
                            }
                            className="text-xs border border-border rounded px-2 py-1 bg-background"
                            data-ocid="admin.select"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
