import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCart();
  const navigate = useNavigate();

  const handleProceed = () => {
    closeCart();
    navigate({ to: "/order" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={closeCart}
          />
          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
            data-ocid="cart.panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-bold text-lg text-foreground">
                Your Cart ({items.length})
              </h2>
              <button
                type="button"
                onClick={closeCart}
                className="p-1 hover:bg-secondary rounded-lg"
                data-ocid="cart.close_button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground"
                  data-ocid="cart.empty_state"
                >
                  <ShoppingBag className="w-12 h-12 opacity-40" />
                  <p>Your cart is empty</p>
                  <Button variant="outline" onClick={closeCart}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item, idx) => (
                    <li
                      key={item.productId}
                      className="flex gap-3"
                      data-ocid={`cart.item.${idx + 1}`}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-green-600 font-semibold text-sm">
                          ₹{item.price}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-secondary"
                            data-ocid={`cart.toggle.${idx + 1}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-secondary"
                            data-ocid={`cart.toggle.${idx + 1}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-destructive hover:opacity-70 transition-opacity self-start mt-1"
                        data-ocid={`cart.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t bg-secondary/30">
                <div className="flex justify-between mb-3">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-foreground">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full bg-navy-700 hover:bg-navy-800 text-white"
                  onClick={handleProceed}
                  data-ocid="cart.primary_button"
                >
                  Proceed to Order
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
