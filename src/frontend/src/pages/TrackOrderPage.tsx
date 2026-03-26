import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useGetOrder } from "@/hooks/useQueries";
import { useSearch } from "@tanstack/react-router";
import {
  CheckCircle2,
  Circle,
  Home,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"];

interface LocalOrder {
  orderId: string;
  trackingId: string;
  customer: {
    fullName: string;
    mobile: string;
    address: string;
    city: string;
    pincode: string;
  };
  status: string;
  placedAt: string;
  totalPrice: number;
  paymentMethod: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
}

function readAllOrders(): LocalOrder[] {
  try {
    return JSON.parse(localStorage.getItem("rahmath_orders") || "[]");
  } catch {
    return [];
  }
}

function getLocalOrder(orderId: string): LocalOrder | null {
  return readAllOrders().find((o) => o.orderId === orderId) || null;
}

function pushCancelledOrderId(orderId: string) {
  try {
    const existing: string[] = JSON.parse(
      localStorage.getItem("rahmath_cancelled_orders") || "[]",
    );
    if (!existing.includes(orderId)) {
      existing.push(orderId);
      localStorage.setItem(
        "rahmath_cancelled_orders",
        JSON.stringify(existing),
      );
    }
  } catch {
    localStorage.setItem("rahmath_cancelled_orders", JSON.stringify([orderId]));
  }
}

export function TrackOrderPage() {
  const search = useSearch({ from: "/track" });
  const initial = (search as { orderId?: string }).orderId || "";
  const [orderId, setOrderId] = useState(initial);
  const [submitted, setSubmitted] = useState(!!initial);
  const [displayedOrder, setDisplayedOrder] = useState<LocalOrder | null>(
    initial ? getLocalOrder(initial) : null,
  );

  const { data: backendOrder, isLoading } = useGetOrder(
    submitted ? orderId : "",
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      setSubmitted(true);
      setDisplayedOrder(getLocalOrder(orderId.trim()));
    }
  };

  const handleCancelOrder = () => {
    const all = readAllOrders();
    const updated = all.map((o) =>
      o.orderId === orderId ? { ...o, status: "Cancelled" } : o,
    );
    localStorage.setItem("rahmath_orders", JSON.stringify(updated));
    pushCancelledOrderId(orderId);
    const fresh = updated.find((o) => o.orderId === orderId) || null;
    setDisplayedOrder(fresh);
    toast.success("Order cancelled successfully.");
  };

  const localOrder = displayedOrder;
  const found = !!(localOrder || backendOrder);
  const status =
    localOrder?.status || (backendOrder?.paid ? "Delivered" : "Pending");
  const isCancelled = status === "Cancelled";
  const canCancel = status === "Pending" || status === "Processing";
  const stepIndex = isCancelled ? -1 : STATUS_STEPS.indexOf(status);

  const stepIcons = [Package, Circle, Truck, Home];

  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Track Your Order</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <Input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter your Order ID (e.g. ORD-XXXXX)"
          className="flex-1"
          data-ocid="track.search_input"
        />
        <Button
          type="submit"
          className="bg-navy-700 hover:bg-navy-800 text-white"
          data-ocid="track.primary_button"
        >
          Track
        </Button>
      </form>

      {submitted && isLoading && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="track.loading_state"
        >
          <div className="animate-spin w-8 h-8 border-2 border-navy-700 border-t-transparent rounded-full mx-auto mb-3" />
          Searching for your order…
        </div>
      )}

      {submitted && !isLoading && !found && (
        <div className="text-center py-12" data-ocid="track.error_state">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="font-semibold text-lg">Order Not Found</h2>
          <p className="text-muted-foreground mt-2">
            No order found with ID <strong>{orderId}</strong>. Please check and
            try again.
          </p>
        </div>
      )}

      {submitted && found && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6"
          data-ocid="track.card"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="font-bold text-navy-700 font-mono">{orderId}</p>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isCancelled
                  ? "bg-red-100 text-red-700"
                  : status === "Delivered"
                    ? "bg-green-100 text-green-700"
                    : status === "Shipped"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {status}
            </span>
          </div>

          {/* Timeline */}
          {isCancelled ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg mb-4">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-700 text-sm">
                  Order Cancelled
                </p>
                <p className="text-xs text-red-500">
                  This order has been cancelled.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
              <div className="space-y-6">
                {STATUS_STEPS.map((step, i) => {
                  const Icon = stepIcons[i];
                  const done = i <= stepIndex;
                  const current = i === stepIndex;
                  return (
                    <div
                      key={step}
                      className="flex items-center gap-4 relative"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 ${
                          done
                            ? "bg-green-600 border-green-600 text-white"
                            : "bg-card border-border text-muted-foreground"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-medium text-sm ${
                            done ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step}
                          {current && (
                            <span className="ml-2 text-xs text-green-600 font-semibold">
                              ● Current
                            </span>
                          )}
                        </p>
                        {done && i === 0 && localOrder && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(localOrder.placedAt).toLocaleString(
                              "en-IN",
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {localOrder && (
            <div className="mt-6 pt-5 border-t">
              <p className="text-sm font-semibold mb-2">Shipping to</p>
              <p className="text-sm text-muted-foreground">
                {localOrder.customer.fullName}, {localOrder.customer.city}
              </p>
            </div>
          )}

          {/* Ordered Items */}
          {localOrder?.items && localOrder.items.length > 0 && (
            <div className="mt-5 pt-5 border-t">
              <p className="text-sm font-semibold mb-3">Ordered Items</p>
              <div className="space-y-3">
                {localOrder.items.map((item) => (
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
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-sm font-bold">
                <span>Total</span>
                <span className="text-navy-700">
                  ₹{localOrder.totalPrice.toFixed(0)}
                </span>
              </div>
            </div>
          )}

          {/* Cancel Order Button */}
          {canCancel && (
            <div className="mt-5 pt-5 border-t">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleCancelOrder}
                data-ocid="track.delete_button"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Order
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                You can cancel orders that are Pending or Processing.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </main>
  );
}
