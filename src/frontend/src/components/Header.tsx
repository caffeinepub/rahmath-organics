import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { totalItems, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-nav sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo + Brand Name */}
        <Link
          to="/"
          search={{ mode: undefined }}
          className="flex items-center gap-2"
          data-ocid="nav.link"
        >
          <img
            src="/assets/uploads/logo-019d2a55-dc4d-77d7-a037-2e6570260456-1.jpeg"
            alt="Rahmath Organics"
            className="h-10 w-auto"
          />
          <span className="text-green-700 font-bold text-lg leading-tight tracking-wide hidden sm:block">
            Rahmath Organics
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link
            to="/"
            search={{ mode: undefined }}
            className="hover:text-foreground transition-colors"
            data-ocid="nav.link"
          >
            Shop
          </Link>
          <Link
            to="/"
            search={{ mode: "wholesale" }}
            className="hover:text-foreground transition-colors"
            data-ocid="nav.link"
          >
            Wholesale
          </Link>
          <Link
            to="/track"
            search={{ orderId: undefined }}
            className="hover:text-foreground transition-colors"
            data-ocid="nav.link"
          >
            Track Order
          </Link>
          <Link
            to="/admin"
            className="hover:text-foreground transition-colors"
            data-ocid="nav.link"
          >
            Admin
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCart}
            className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
            data-ocid="cart.button"
          >
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-green-600 hover:bg-green-600">
                {totalItems}
              </Badge>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 hover:bg-secondary rounded-lg"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden bg-white border-t px-4 py-3 flex flex-col gap-3 text-sm font-medium">
          <Link
            to="/"
            search={{ mode: undefined }}
            onClick={() => setMobileOpen(false)}
            data-ocid="nav.link"
          >
            Shop
          </Link>
          <Link
            to="/"
            search={{ mode: "wholesale" }}
            onClick={() => setMobileOpen(false)}
            data-ocid="nav.link"
          >
            Wholesale
          </Link>
          <Link
            to="/track"
            search={{ orderId: undefined }}
            onClick={() => setMobileOpen(false)}
            data-ocid="nav.link"
          >
            Track Order
          </Link>
          <Link
            to="/admin"
            onClick={() => {
              setMobileOpen(false);
              navigate({ to: "/admin" });
            }}
            data-ocid="nav.link"
          >
            Admin
          </Link>
        </nav>
      )}
    </header>
  );
}
