import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetOrder } from "@/hooks/useQueries";
import { useSearch } from "@tanstack/react-router";
import { CheckCircle2, Circle, Home, Package, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const STATUS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"];

interface LocalOrder {
  orderId: string;
  trackingId: string;
  customer: { fullName: string; city: string };
  status: string;
  placedAt: string;
  totalPrice: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

function getLocalOrder(orderId: string): LocalOrder | null {
  try {
    const stored: LocalOrder[] = JSON.parse(
      localStorage.getItem("rahmath_orders") || "[]",
    );
    return stored.find((o) => o.orderId === orderId) || null;
  } catch {
    return null;
  }
}

export function TrackOrderPage() {
  const search = useSearch({ from: "/track" });
  const initial = (search as { orderId?: string }).orderId || "";
  const [orderId, setOrderId] = useState(initial);
  const [submitted, setSubmitted] = useState(!!initial);

  const { data: backendOrder, isLoading } = useGetOrder(
    submitted ? orderId : "",
  );
  const localOrder = submitted ? getLocalOrder(orderId) : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) setSubmitted(true);
  };

  const found = !!(localOrder || backendOrder);
  const status =
    localOrder?.status || (backendOrder?.paid ? "Delivered" : "Pending");
  const stepIndex = STATUS_STEPS.indexOf(status);

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
                status === "Delivered"
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
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
            <div className="space-y-6">
              {STATUS_STEPS.map((step, i) => {
                const Icon = stepIcons[i];
                const done = i <= stepIndex;
                const current = i === stepIndex;
                return (
                  <div key={step} className="flex items-center gap-4 relative">
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
                        className={`font-medium text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}
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

          {localOrder && (
            <div className="mt-6 pt-5 border-t">
              <p className="text-sm font-semibold mb-2">Shipping to</p>
              <p className="text-sm text-muted-foreground">
                {localOrder.customer.fullName}, {localOrder.customer.city}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </main>
  );
}
