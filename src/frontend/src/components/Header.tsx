import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Link, useNavigate } from "@tanstack/react-router";
import { Leaf, Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { totalItems, openCart } = useCart();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = loginStatus === "success" && !!identity;

  return (
    <header className="bg-white shadow-nav sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link
          to="/"
          search={{ mode: undefined }}
          className="flex items-center gap-2 font-bold text-xl text-navy-700"
          data-ocid="nav.link"
        >
          <div className="bg-green-600 rounded-full p-1.5">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="hidden sm:block">RAHMATH ORGANICS</span>
          <span className="sm:hidden">RO</span>
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

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[100px]">
                {identity.getPrincipal().toString().slice(0, 8)}…
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                data-ocid="nav.button"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="bg-navy-700 hover:bg-navy-800 text-white"
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              data-ocid="nav.button"
            >
              {loginStatus === "logging-in" ? "Connecting…" : "Login"}
            </Button>
          )}

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
