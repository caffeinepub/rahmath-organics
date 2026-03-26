import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useSearch } from "@/contexts/SearchContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, Settings, ShoppingCart, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function Header() {
  const { totalItems, openCart } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  function handleSearchToggle() {
    if (searchOpen && searchQuery === "") {
      setSearchOpen(false);
    } else if (!searchOpen) {
      setSearchOpen(true);
    }
  }

  function handleSearchChange(val: string) {
    setSearchQuery(val);
    navigate({ to: "/", search: { mode: undefined }, replace: true });
  }

  function handleClearSearch() {
    setSearchQuery("");
    searchInputRef.current?.focus();
  }

  return (
    <header className="bg-white shadow-nav sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo + Brand Name */}
        <Link
          to="/"
          search={{ mode: undefined }}
          className="flex items-center gap-2 flex-shrink-0"
          data-ocid="nav.link"
        >
          <img
            src="/assets/uploads/logo-019d2a55-dc4d-77d7-a037-2e6570260456-1.jpeg"
            alt="Rahamath Organics"
            className="h-10 w-auto"
          />
          <span className="text-green-700 font-bold text-lg leading-tight tracking-wide">
            Rahamath Organics
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
            to="/my-orders"
            className="hover:text-foreground transition-colors"
            data-ocid="nav.link"
          >
            My Orders
          </Link>
          <Link
            to="/settings"
            className="hover:text-foreground transition-colors"
            data-ocid="nav.link"
          >
            Settings
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
        <div className="flex items-center gap-1">
          {/* Inline search bar */}
          <div
            className="flex items-center overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              width: searchOpen ? "220px" : "0px",
              opacity: searchOpen ? 1 : 0,
            }}
          >
            <div className="relative flex items-center w-full">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-3 pr-8 py-1.5 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                data-ocid="search.input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-ocid="search.close_button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Search icon button */}
          <button
            type="button"
            onClick={handleSearchToggle}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Search"
            data-ocid="search.button"
          >
            {searchOpen && searchQuery === "" ? (
              <X
                className="w-5 h-5 text-foreground"
                onClick={() => setSearchOpen(false)}
              />
            ) : (
              <Search className="w-5 h-5 text-foreground" />
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: "/settings" })}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            data-ocid="nav.link"
          >
            <Settings className="w-5 h-5 text-foreground" />
          </button>
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

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              data-ocid="search.input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

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
            to="/my-orders"
            onClick={() => setMobileOpen(false)}
            data-ocid="nav.link"
          >
            My Orders
          </Link>
          <Link
            to="/settings"
            onClick={() => setMobileOpen(false)}
            data-ocid="nav.link"
          >
            Settings
          </Link>
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            data-ocid="nav.link"
          >
            Admin
          </Link>
        </nav>
      )}
    </header>
  );
}
