import { Button } from "@/components/ui/button";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Clock, MapPin, Package } from "lucide-react";
import { motion } from "motion/react";

export function ConfirmationPage() {
  const search = useSearch({ from: "/confirmation" });
  const navigate = useNavigate();
  const { orderId, trackingId } = search as {
    orderId?: string;
    trackingId?: string;
  };

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + 5);
  const dateStr = estimatedDate.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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

        <div className="bg-card border border-border rounded-xl p-6 text-left space-y-4 mb-8">
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
