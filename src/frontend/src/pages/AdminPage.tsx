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
import { useActor } from "@/hooks/useActor";
import { useKvGetAll } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import {
  ImageIcon,
  LayoutDashboard,
  Loader2,
  Lock,
  Package,
  Pencil,
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

interface LocalProduct {
  id: string;
  name: string;
  description: string;
  retailPrice: number;
  wholesalePrice: number;
  rating: number;
  reviews: number;
  image: string;
  stock: number;
  category: string;
}

type FormState = {
  name: string;
  description: string;
  price: string;
  category: string;
};

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

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  category: "",
};

function compressAndResizeImage(
  file: File,
  maxSize = 200,
  quality = 0.5,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readCancelledOrders(): string[] {
  try {
    return JSON.parse(localStorage.getItem("rahmath_cancelled_orders") || "[]");
  } catch {
    return [];
  }
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("rahmath_admin_auth") === "true",
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [orders, setOrders] = useState<LocalOrder[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("rahmath_orders") || "[]");
    } catch {
      return [];
    }
  });

  const [seenCount, setSeenCount] = useState<number>(() =>
    Number(localStorage.getItem("rahmath_orders_seen_count") || "0"),
  );
  const [unseenCancelled, setUnseenCancelled] =
    useState<string[]>(readCancelledOrders);

  const newOrdersBadge = Math.max(0, orders.length - seenCount);
  const totalBadge = newOrdersBadge + unseenCancelled.length;

  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: kvData, isLoading: kvLoading } = useKvGetAll();

  // Parse products from kv store
  const localProducts: LocalProduct[] = kvData
    ? (kvData
        .filter(([k]) => k.startsWith("p:"))
        .map(([, v]) => {
          try {
            return JSON.parse(v) as LocalProduct;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as LocalProduct[])
    : [];

  const deletedSampleIds: string[] = kvData
    ? (() => {
        const entry = kvData.find(([k]) => k === "deleted-samples");
        if (!entry) return [];
        try {
          return JSON.parse(entry[1]) as string[];
        } catch {
          return [];
        }
      })()
    : [];

  const sampleOverrides: Record<string, Partial<LocalProduct>> = kvData
    ? Object.fromEntries(
        kvData
          .filter(([k]) => k.startsWith("override:"))
          .map(([k, v]) => {
            try {
              return [k.replace("override:", ""), JSON.parse(v)];
            } catch {
              return null;
            }
          })
          .filter(Boolean) as [string, Partial<LocalProduct>][],
      )
    : {};

  // Merge sample products with overrides and filter deleted
  const visibleSampleProducts = SAMPLE_PRODUCTS.filter(
    (p) => !deletedSampleIds.includes(p.id),
  ).map((p) => ({ ...p, ...(sampleOverrides[p.id] || {}) }));

  const allProducts = [...visibleSampleProducts, ...localProducts];

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

  const handleOrdersTabClick = () => {
    setActiveTab("orders");
    const newSeen = orders.length;
    setSeenCount(newSeen);
    localStorage.setItem("rahmath_orders_seen_count", String(newSeen));
    setUnseenCancelled([]);
    localStorage.setItem("rahmath_cancelled_orders", "[]");
  };

  const openAddDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setDialogOpen(true);
  };

  const openEditDialog = (p: LocalProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.retailPrice),
      category: p.category,
    });
    setImageFile(null);
    setImagePreview(p.image);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
  };

  const handleSaveProduct = async () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!actor) {
      toast.error("Not connected to backend. Please wait and try again.");
      return;
    }
    setSaving(true);
    try {
      const price = Number(form.price) || 0;

      let finalImage = imagePreview;
      if (imageFile) {
        finalImage = await compressAndResizeImage(imageFile);
      }
      if (!finalImage) {
        finalImage = "/assets/generated/hero-organic-new.dim_1400x500.jpg";
      }

      if (editingId) {
        const isSample = editingId.startsWith("sp-");
        if (isSample) {
          const overrideData = {
            name: form.name,
            description: form.description,
            retailPrice: price,
            wholesalePrice: Math.round(price * 0.8),
            image: finalImage,
            category: form.category,
          };
          await actor.kvSet(
            `override:${editingId}`,
            JSON.stringify(overrideData),
          );
          await queryClient.refetchQueries({ queryKey: ["kv-store"] });
        } else {
          const existing = localProducts.find((p) => p.id === editingId);
          if (existing) {
            const updated = {
              ...existing,
              name: form.name,
              description: form.description,
              retailPrice: price,
              wholesalePrice: Math.round(price * 0.8),
              image: finalImage,
              category: form.category || existing.category,
            };
            await actor.kvSet(`p:${editingId}`, JSON.stringify(updated));
            await queryClient.refetchQueries({ queryKey: ["kv-store"] });
          }
        }
        toast.success("Product updated!");
      } else {
        const newId = `local-${Date.now()}`;
        const lp: LocalProduct = {
          id: newId,
          name: form.name,
          description: form.description,
          retailPrice: price,
          wholesalePrice: Math.round(price * 0.8),
          rating: 5,
          reviews: 0,
          image: finalImage,
          stock: 100,
          category: form.category || "Organic",
        };
        await actor.kvSet(`p:${newId}`, JSON.stringify(lp));
        await queryClient.refetchQueries({ queryKey: ["kv-store"] });
        toast.success("Product added!");
      }
      closeDialog();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save product: ${errMsg.slice(0, 80)}`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!actor) {
      toast.error("Not connected to backend.");
      return;
    }
    try {
      if (productId.startsWith("sp-")) {
        const updated = [...deletedSampleIds, productId];
        await actor.kvSet("deleted-samples", JSON.stringify(updated));
        await queryClient.refetchQueries({ queryKey: ["kv-store"] });
      } else {
        await actor.kvDelete(`p:${productId}`);
        await queryClient.refetchQueries({ queryKey: ["kv-store"] });
      }
      toast.success("Product deleted");
    } catch (err) {
      toast.error("Failed to delete product.");
      console.error(err);
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
              RAHAMATH ORGANICS
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
          <p className="font-bold text-sm text-white">RAHAMATH ORGANICS</p>
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
              onClick={() => {
                if (id === "orders") {
                  handleOrdersTabClick();
                } else {
                  setActiveTab(id);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === id
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
              }`}
              data-ocid="admin.tab"
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{label}</span>
              {id === "orders" && totalBadge > 0 && (
                <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {totalBadge > 9 ? "9+" : totalBadge}
                </span>
              )}
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
                  value: allProducts.length,
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
              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  if (!open) closeDialog();
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    onClick={openAddDialog}
                    data-ocid="admin.open_modal_button"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent data-ocid="admin.dialog">
                  <DialogHeader>
                    <DialogTitle>
                      {editingId ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div>
                      <Label>Product Name *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="e.g. Organic Ashwagandha Powder"
                        className="mt-1"
                        data-ocid="admin.input"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
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
                      <Label>Product Image</Label>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-1">
                        Images are automatically compressed for fast saving
                      </p>
                      <label
                        htmlFor="product-image-upload"
                        className={`mt-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
                          imagePreview
                            ? "border-green-500 bg-green-50"
                            : "border-border hover:border-green-500/50"
                        }`}
                      >
                        <input
                          id="product-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          data-ocid="admin.upload_button"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImageFile(file);
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                        {imagePreview ? (
                          <div className="flex flex-col items-center gap-2">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-24 h-24 object-cover rounded-lg border"
                            />
                            <span className="text-xs text-green-600 font-medium">
                              Image selected — click to change
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ImageIcon className="w-8 h-8 opacity-40" />
                            <span className="text-sm">
                              Click to upload image
                            </span>
                            <span className="text-xs">JPG, PNG — any size</span>
                          </div>
                        )}
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Price (₹)</Label>
                        <Input
                          type="number"
                          value={form.price}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              price: e.target.value,
                            }))
                          }
                          placeholder="e.g. 299"
                          className="mt-1"
                          data-ocid="admin.input"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <select
                          value={form.category}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              category: e.target.value,
                            }))
                          }
                          className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          data-ocid="admin.select"
                        >
                          <option value="">Select Category</option>
                          <option value="Henna">Henna</option>
                          <option value="Sweeteners">Sweeteners</option>
                          <option value="Oils">Oils</option>
                          <option value="Spices">Spices</option>
                          <option value="Packs">Packs</option>
                          <option value="Toys">Toys</option>
                          <option value="Jewels">Jewels</option>
                          <option value="Gift Hamper">Gift Hamper</option>
                          <option value="Dry Fruits">Dry Fruits</option>
                          <option value="Teas">Teas</option>
                          <option value="Superfoods">Superfoods</option>
                        </select>
                      </div>
                    </div>
                    {form.price && Number(form.price) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Wholesale price (20% off):{" "}
                        <span className="font-semibold text-green-700">
                          ₹{Math.round(Number(form.price) * 0.8)}
                        </span>
                      </p>
                    )}
                    <div className="flex gap-3 pt-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleSaveProduct}
                        disabled={saving}
                        data-ocid="admin.confirm_button"
                      >
                        {saving ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </span>
                        ) : editingId ? (
                          "Save Changes"
                        ) : (
                          "Add Product"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={closeDialog}
                        data-ocid="admin.cancel_button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {kvLoading ? (
              <div
                className="flex items-center justify-center py-20 text-muted-foreground gap-3"
                data-ocid="admin.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading products from backend…</span>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Retail</TableHead>
                      <TableHead>Wholesale</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allProducts.map((p, idx) => (
                      <TableRow key={p.id} data-ocid={`admin.row.${idx + 1}`}>
                        <TableCell>
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-md border"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {p.category}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{p.retailPrice}</TableCell>
                        <TableCell className="text-green-700">
                          ₹{p.wholesalePrice}
                        </TableCell>
                        <TableCell>{p.stock}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => openEditDialog(p as LocalProduct)}
                              data-ocid={`admin.edit_button.${idx + 1}`}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDelete(p.id)}
                              data-ocid={`admin.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
                    {orders.map((order, idx) => {
                      const isCancelled = order.status === "Cancelled";
                      return (
                        <TableRow
                          key={order.orderId}
                          className={isCancelled ? "bg-red-50/50" : ""}
                          data-ocid={`admin.row.${idx + 1}`}
                        >
                          <TableCell
                            className={`font-mono text-xs ${
                              isCancelled ? "text-red-500" : ""
                            }`}
                          >
                            {order.orderId}
                          </TableCell>
                          <TableCell>
                            <p
                              className={`font-medium text-sm ${
                                isCancelled
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {order.customer.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.customer.mobile}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm">
                            {order.items?.length || 0} item(s)
                          </TableCell>
                          <TableCell
                            className={`font-semibold ${
                              isCancelled
                                ? "text-muted-foreground line-through"
                                : ""
                            }`}
                          >
                            ₹{order.totalPrice.toFixed(0)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {order.paymentMethod === "qr" ? "QR/UPI" : "COD"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-xs font-semibold ${
                                STATUS_COLORS[order.status] || ""
                              } ${isCancelled ? "border border-red-300" : ""}`}
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
                      );
                    })}
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
