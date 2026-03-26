import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type PaymentMethod = "cod" | "qr";

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export function OrderPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!/^[6-9]\d{9}$/.test(form.mobile))
      e.mobile = "Enter a valid 10-digit mobile number";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!/^\d{6}$/.test(form.pincode))
      e.pincode = "Enter a valid 6-digit pincode";
    if (paymentMethod === "qr" && !uploadedFile)
      e.screenshot = "Please upload payment screenshot";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));

    const orderId = generateId("ORD");
    const trackingId = generateId("TRK");

    const order = {
      orderId,
      trackingId,
      customer: form,
      items,
      totalPrice,
      paymentMethod,
      status: "Pending",
      placedAt: new Date().toISOString(),
    };
    const stored = JSON.parse(localStorage.getItem("rahmath_orders") || "[]");
    stored.push(order);
    localStorage.setItem("rahmath_orders", JSON.stringify(stored));

    clearCart();
    setIsSubmitting(false);
    toast.success("Order placed successfully!");
    navigate({ to: "/confirmation", search: { orderId, trackingId } });
  };

  if (items.length === 0) {
    return (
      <main
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="order.empty_state"
      >
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Add some products before placing an order
        </p>
        <Button
          onClick={() => navigate({ to: "/", search: { mode: undefined } })}
          data-ocid="order.primary_button"
        >
          Browse Products
        </Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-foreground">
        Place Your Order
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Customer details + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-bold text-lg mb-5">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                    placeholder="Your full name"
                    className="mt-1"
                    data-ocid="order.input"
                  />
                  {errors.fullName && (
                    <p
                      className="text-destructive text-xs mt-1"
                      data-ocid="order.error_state"
                    >
                      {errors.fullName}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    value={form.mobile}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mobile: e.target.value }))
                    }
                    placeholder="10-digit mobile number"
                    className="mt-1"
                    data-ocid="order.input"
                  />
                  {errors.mobile && (
                    <p
                      className="text-destructive text-xs mt-1"
                      data-ocid="order.error_state"
                    >
                      {errors.mobile}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                    placeholder="House/flat number, street, area"
                    rows={3}
                    className="mt-1"
                    data-ocid="order.textarea"
                  />
                  {errors.address && (
                    <p
                      className="text-destructive text-xs mt-1"
                      data-ocid="order.error_state"
                    >
                      {errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                    placeholder="City"
                    className="mt-1"
                    data-ocid="order.input"
                  />
                  {errors.city && (
                    <p
                      className="text-destructive text-xs mt-1"
                      data-ocid="order.error_state"
                    >
                      {errors.city}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={form.pincode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, pincode: e.target.value }))
                    }
                    placeholder="6-digit pincode"
                    className="mt-1"
                    data-ocid="order.input"
                  />
                  {errors.pincode && (
                    <p
                      className="text-destructive text-xs mt-1"
                      data-ocid="order.error_state"
                    >
                      {errors.pincode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-bold text-lg mb-5">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(
                  [
                    {
                      id: "cod",
                      label: "Cash on Delivery",
                      icon: "💵",
                      desc: "Pay when your order arrives",
                    },
                    {
                      id: "qr",
                      label: "QR Code / UPI",
                      icon: "📱",
                      desc: "Scan & pay instantly",
                    },
                  ] as const
                ).map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                      paymentMethod === method.id
                        ? "border-navy-700 bg-navy-50"
                        : "border-border hover:border-navy-600/40"
                    }`}
                    data-ocid="order.radio"
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{method.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {method.desc}
                      </p>
                    </div>
                    {paymentMethod === method.id && (
                      <CheckCircle2 className="w-5 h-5 text-navy-700 ml-auto mt-0.5 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {paymentMethod === "qr" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-5 border border-border rounded-lg p-4 text-center bg-secondary/30"
                >
                  <p className="text-sm font-semibold mb-3">Scan to Pay</p>
                  <div className="w-40 h-40 mx-auto border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-white mb-3">
                    <div className="text-center text-muted-foreground text-xs">
                      <div className="text-4xl">📲</div>
                      <p>UPI QR Code</p>
                      <p className="font-semibold mt-1">rahmath@upi</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Pay to <strong>rahmath@upi</strong> and upload screenshot
                    below
                  </p>
                  <label
                    htmlFor="screenshot-upload"
                    className={`block border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
                      uploadedFile
                        ? "border-green-600 bg-green-50"
                        : "border-border hover:border-navy-600/50"
                    }`}
                    data-ocid="order.upload_button"
                  >
                    <input
                      id="screenshot-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setUploadedFile(e.target.files?.[0] || null)
                      }
                    />
                    {uploadedFile ? (
                      <div className="flex items-center gap-2 justify-center text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {uploadedFile.name}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Upload Payment Screenshot</p>
                        <p className="text-xs mt-1">JPG, PNG up to 5MB</p>
                      </div>
                    )}
                  </label>
                  {errors.screenshot && (
                    <p
                      className="text-destructive text-xs mt-2"
                      data-ocid="order.error_state"
                    >
                      {errors.screenshot}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-card border border-border rounded-lg p-5 sticky top-24">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>
              <ul className="space-y-3 mb-4">
                {items.map((item, idx) => (
                  <li
                    key={item.productId}
                    className="flex items-center gap-3"
                    data-ocid={`order.item.${idx + 1}`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-green-600">
                    {totalPrice >= 500 ? "FREE" : "₹50"}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span>
                    ₹{(totalPrice + (totalPrice >= 500 ? 0 : 50)).toFixed(2)}
                  </span>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
                disabled={isSubmitting}
                data-ocid="order.submit_button"
              >
                {isSubmitting ? "Placing Order…" : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
