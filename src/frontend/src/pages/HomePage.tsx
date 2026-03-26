import type { Product } from "@/backend";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SAMPLE_PRODUCTS, type SampleProduct } from "@/data/sampleProducts";
import { useGetAllProducts } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Filter } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

function backendToSampleProduct(p: Product): SampleProduct {
  const retailPrice = Number(p.price) / 100;
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    retailPrice,
    wholesalePrice: Math.round(retailPrice * 0.75),
    rating: 4.5,
    reviews: 0,
    image: p.image.getDirectURL(),
    stock: Number(p.stock),
    category: "Organic",
  };
}

export function HomePage() {
  const [isWholesale, setIsWholesale] = useState(false);
  const { data: backendProducts, isLoading } = useGetAllProducts();
  const navigate = useNavigate();

  const products: SampleProduct[] =
    backendProducts && backendProducts.length > 0
      ? backendProducts.map(backendToSampleProduct)
      : SAMPLE_PRODUCTS;

  return (
    <main>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "420px" }}
      >
        <img
          src="/assets/generated/hero-organic.dim_1400x500.jpg"
          alt="Rahmath Organics Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/85 via-navy-800/60 to-transparent" />
        <div
          className="relative container mx-auto px-4 py-20 flex flex-col justify-center"
          style={{ minHeight: "420px" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-lg"
          >
            <span className="inline-block bg-green-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
              100% Certified Organic
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Pure. Natural.
              <br />
              <span className="text-green-300">Organic.</span>
            </h1>
            <p className="text-white/80 text-lg mb-6">
              From farm to your table — ethically sourced, zero chemicals,
              maximum nutrition.
            </p>
            <div className="flex gap-3">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-6 gap-2"
                onClick={() =>
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                data-ocid="hero.primary_button"
              >
                Shop Now <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => navigate({ to: "/order" })}
                data-ocid="hero.secondary_button"
              >
                Place Order
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products section */}
      <section id="products" className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Our Products</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Premium organic products, straight from nature
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Retail/Wholesale toggle */}
            <div
              className="flex rounded-lg border border-border bg-secondary overflow-hidden"
              data-ocid="product.toggle"
            >
              <button
                type="button"
                onClick={() => setIsWholesale(false)}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  !isWholesale
                    ? "bg-navy-700 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid="product.tab"
              >
                Retail
              </button>
              <button
                type="button"
                onClick={() => setIsWholesale(true)}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  isWholesale
                    ? "bg-navy-700 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid="product.tab"
              >
                Wholesale
              </button>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        {isWholesale && (
          <div className="bg-navy-50 border border-navy-100 rounded-lg px-4 py-3 mb-6 text-sm text-navy-700">
            🏪 <strong>Wholesale Pricing Active</strong> — Prices shown at 25%
            discount. Minimum order quantity may apply.
          </div>
        )}

        {isLoading ? (
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            data-ocid="product.loading_state"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-lg border animate-pulse">
                <div className="aspect-square bg-secondary/50" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-secondary rounded" />
                  <div className="h-3 bg-secondary rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                isWholesale={isWholesale}
                index={i + 1}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* Features strip */}
      <section className="bg-navy-700 text-white py-10 mt-8">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            {
              icon: "🌿",
              title: "100% Organic",
              desc: "Certified organic farms",
            },
            { icon: "🚚", title: "Free Delivery", desc: "Orders above ₹500" },
            {
              icon: "🔒",
              title: "Secure Payment",
              desc: "COD & UPI supported",
            },
            { icon: "⭐", title: "Premium Quality", desc: "Tested & verified" },
          ].map((f) => (
            <div key={f.title}>
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-xs text-white/70 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
