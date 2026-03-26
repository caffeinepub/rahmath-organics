import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, ChevronUp, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

const STATUS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"];

function statusColor(status: string) {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-700 border-green-300";
    case "Shipped":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "Processing":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "Cancelled":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
  }
}

function TrackingBar({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        Order Tracking
      </p>
      <div className="flex items-center gap-1">
        {STATUS_STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  i <= currentIdx && status !== "Cancelled"
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {i <= currentIdx && status !== "Cancelled" ? "✓" : i + 1}
              </div>
              <p className="text-xs mt-1 text-center text-muted-foreground">
                {step}
              </p>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mb-5 ${
                  i < currentIdx && status !== "Cancelled"
                    ? "bg-green-600"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onCancel,
}: { order: LocalOrder; onCancel: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const canCancel = order.status === "Pending" || order.status === "Processing";

  return (
    <div
      className={`border rounded-xl overflow-hidden shadow-sm mb-4 ${
        order.status === "Cancelled"
          ? "border-red-200 bg-red-50"
          : "bg-white border-border"
      }`}
      data-ocid="orders.item.1"
    >
      {/* Card header */}
      <button
        type="button"
        className="w-full text-left p-4 flex items-center gap-4"
        onClick={() => setExpanded((v) => !v)}
        data-ocid="orders.panel"
      >
        {/* Item thumbnails */}
        <div className="flex -space-x-2 flex-shrink-0">
          {order.items.slice(0, 3).map((item, i) => (
            <img
              key={item.productId || i}
              src={
                item.image ||
                "/assets/uploads/logo-019d2a55-dc4d-77d7-a037-2e6570260456-1.jpeg"
              }
              alt={item.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">
              {order.orderId}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor(order.status)}`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground mt-0.5">
            ₹{order.totalPrice.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.placedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          {/* Items list */}
          <div className="mt-3 space-y-2">
            {order.items.map((item, i) => (
              <div
                key={item.productId || i}
                className="flex items-center gap-3"
              >
                <img
                  src={
                    item.image ||
                    "/assets/uploads/logo-019d2a55-dc4d-77d7-a037-2e6570260456-1.jpeg"
                  }
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover border border-border"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  ₹{item.quantity * item.price}
                </p>
              </div>
            ))}
          </div>

          {/* Shipping + Payment */}
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Shipping To
              </p>
              <p className="text-foreground">{order.customer.fullName}</p>
              <p className="text-muted-foreground text-xs">
                {order.customer.address}, {order.customer.city} —{" "}
                {order.customer.pincode}
              </p>
              <p className="text-muted-foreground text-xs">
                {order.customer.mobile}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Payment
              </p>
              <p className="text-foreground">{order.paymentMethod}</p>
              <p className="font-semibold text-green-700">
                Total: ₹{order.totalPrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Tracking bar */}
          {order.status !== "Cancelled" && (
            <TrackingBar status={order.status} />
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                navigate({ to: "/track", search: { orderId: order.orderId } })
              }
              data-ocid="orders.button"
            >
              Track Order
            </Button>
            {canCancel && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onCancel(order.orderId)}
                data-ocid="orders.delete_button"
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<LocalOrder[]>(() =>
    readAllOrders().sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    ),
  );

  const handleCancel = (orderId: string) => {
    const all = readAllOrders();
    const updated = all.map((o) =>
      o.orderId === orderId ? { ...o, status: "Cancelled" } : o,
    );
    localStorage.setItem("rahmath_orders", JSON.stringify(updated));
    pushCancelledOrderId(orderId);
    setOrders(
      updated.sort(
        (a, b) =>
          new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
      ),
    );
    toast.success("Order cancelled. Admin has been notified.");
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/", search: { mode: undefined } })}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          data-ocid="orders.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground text-sm">
            View and manage your orders
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20" data-ocid="orders.empty_state">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No orders yet
          </h2>
          <p className="text-muted-foreground mb-6">
            Start shopping to see your orders here.
          </p>
          <Button
            onClick={() => navigate({ to: "/", search: { mode: undefined } })}
            data-ocid="orders.primary_button"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {orders.length} order{orders.length !== 1 ? "s" : ""} found
          </p>
          {orders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </main>
  );
}
