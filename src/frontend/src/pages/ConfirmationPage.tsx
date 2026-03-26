import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  ShoppingBag,
} from "lucide-react";
import { motion } from "motion/react";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface StoredOrder {
  orderId: string;
  trackingId: string;
  customer: {
    fullName: string;
    mobile: string;
    address: string;
    city: string;
    pincode: string;
  };
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: "cod" | "qr";
  status: string;
  placedAt: string;
}

function getOrderFromStorage(orderId: string): StoredOrder | null {
  try {
    const stored: StoredOrder[] = JSON.parse(
      localStorage.getItem("rahmath_orders") || "[]",
    );
    return stored.find((o) => o.orderId === orderId) || null;
  } catch {
    return null;
  }
}

export function ConfirmationPage() {
  const search = useSearch({ from: "/confirmation" });
  const navigate = useNavigate();
  const { orderId, trackingId } = search as {
    orderId?: string;
    trackingId?: string;
  };

  const order = orderId ? getOrderFromStorage(orderId) : null;

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + 5);
  const dateStr = estimatedDate.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const deliveryCharge = order && order.totalPrice >= 500 ? 0 : 50;
  const subtotal = order
    ? order.totalPrice - (order.totalPrice >= 500 ? 0 : 50)
    : 0;

  return (
    <main className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center"
        data-ocid="confirmation.card"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-muted-foreground mb-8">
          Thank you for shopping with RAHMATH ORGANICS
        </p>

        <div className="bg-card border border-border rounded-xl p-6 text-left space-y-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Package className="w-5 h-5 text-navy-700" />
            <div>
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="font-bold font-mono text-navy-700">
                {orderId || "ORD-XXXXXX"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <MapPin className="w-5 h-5 text-navy-700" />
            <div>
              <p className="text-xs text-muted-foreground">Tracking ID</p>
              <p className="font-bold font-mono text-navy-700">
                {trackingId || "TRK-XXXXXX"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Clock className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">
                Estimated Delivery
              </p>
              <p className="font-semibold">{dateStr}</p>
            </div>
          </div>
        </div>

        {/* Order Details Section */}
        {order?.items && order.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6 text-left mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-4 h-4 text-navy-700" />
              <h2 className="font-semibold text-base">Order Details</h2>
            </div>

            <div className="space-y-3 mb-4">
              {order.items.map((item) => (
                <div
                  key={item.productId || item.name}
                  className="flex items-center gap-3"
                >
                  <img
                    src={
                      item.image ||
                      "/assets/generated/hero-organic-new.dim_1400x500.jpg"
                    }
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-navy-700">
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>
                  ₹
                  {subtotal > 0
                    ? subtotal.toFixed(0)
                    : order.totalPrice.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Charge</span>
                <span
                  className={
                    deliveryCharge === 0 ? "text-green-600 font-medium" : ""
                  }
                >
                  {deliveryCharge === 0 ? "Free" : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
                <span>Grand Total</span>
                <span className="text-navy-700">
                  ₹{order.totalPrice.toFixed(0)}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                Payment:{" "}
                <span className="font-semibold text-foreground">
                  {order.paymentMethod === "qr"
                    ? "QR / UPI"
                    : "Cash on Delivery"}
                </span>
              </p>
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            className="bg-navy-700 hover:bg-navy-800 text-white"
            onClick={() =>
              navigate({ to: "/track", search: { orderId: orderId || "" } })
            }
            data-ocid="confirmation.primary_button"
          >
            Track Your Order
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/", search: { mode: undefined } })}
            data-ocid="confirmation.secondary_button"
          >
            Continue Shopping
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
