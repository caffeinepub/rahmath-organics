import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/contexts/SearchContext";
import { SAMPLE_PRODUCTS, type SampleProduct } from "@/data/sampleProducts";
import { useKvGetAll } from "@/hooks/useQueries";
import {
  useNavigate,
  useSearch as useRouterSearch,
} from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Filter, SearchX } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const CATEGORIES = [
  { label: "All", emoji: "🛒" },
  { label: "Henna", emoji: "🌿" },
  { label: "Sweeteners", emoji: "🍯" },
  { label: "Oils", emoji: "🫙" },
  { label: "Spices", emoji: "🌶️" },
  { label: "Packs", emoji: "📦" },
  { label: "Toys", emoji: "🧸" },
  { label: "Jewels", emoji: "💎" },
  { label: "Gift Hamper", emoji: "🎁" },
];

const SLIDES = [
  {
    bg: "from-purple-700 to-purple-500",
    emoji: "🎁",
    title: "Festival Gift Hampers Available",
    subtitle: "Curated organic gift boxes for every occasion",
  },
  {
    bg: "from-green-700 to-green-500",
    emoji: "🌿",
    title: "100% Organic & Natural",
    subtitle: "Ethically sourced, zero chemicals, maximum nutrition",
  },
  {
    bg: "from-amber-600 to-amber-400",
    emoji: "🍯",
    title: "Pure Wild Forest Honey",
    subtitle: "Raw, unfiltered — straight from nature",
  },
  {
    bg: "from-teal-700 to-teal-500",
    emoji: "🚚",
    title: "Free Delivery on Orders Above ₹500",
    subtitle: "Pan-India delivery, COD & UPI supported",
  },
];

const FEATURES = [
  { icon: "🚚", title: "Free Shipping", desc: "On orders above ₹499" },
  { icon: "🛡️", title: "100% Authentic", desc: "Certified organic products" },
  { icon: "🌱", title: "Eco-Friendly", desc: "Sustainable packaging" },
];

export function HomePage() {
  const routerSearch = useRouterSearch({ strict: false }) as { mode?: string };
  const mode = routerSearch?.mode;
  const [isWholesale, setIsWholesale] = useState(mode === "wholesale");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    setIsWholesale(mode === "wholesale");
  }, [mode]);

  const { data: kvData } = useKvGetAll();

  // Parse products, overrides, and deleted IDs from kv store
  const localProducts: SampleProduct[] = kvData
    ? (kvData
        .filter(([k]) => k.startsWith("p:"))
        .map(([, v]) => {
          try {
            return JSON.parse(v) as SampleProduct;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as SampleProduct[])
    : [];

  const deletedSampleIds: string[] = kvData
    ? (() => {
        const entry = kvData.find(([k]) => k === "deleted-samples");
        if (!entry) return [];
        try {
          return JSON.parse(entry[1]) as string[];
        } catch {
          return [];
        }
      })()
    : [];

  const sampleOverrides: Record<string, Partial<SampleProduct>> = kvData
    ? Object.fromEntries(
        kvData
          .filter(([k]) => k.startsWith("override:"))
          .map(([k, v]) => {
            try {
              return [k.replace("override:", ""), JSON.parse(v)];
            } catch {
              return null;
            }
          })
          .filter(Boolean) as [string, Partial<SampleProduct>][],
      )
    : {};

  const visibleSamples = SAMPLE_PRODUCTS.filter(
    (p) => !deletedSampleIds.includes(p.id),
  ).map((p) => ({ ...p, ...(sampleOverrides[p.id] || {}) }));

  const allProducts: SampleProduct[] = [...visibleSamples, ...localProducts];

  const categoryFiltered =
    activeCategory === "All"
      ? allProducts
      : allProducts.filter(
          (p) => p.category?.toLowerCase() === activeCategory.toLowerCase(),
        );

  const filteredProducts = searchQuery.trim()
    ? categoryFiltered.filter((p) => {
        const q = searchQuery.trim().toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
        );
      })
    : categoryFiltered;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <main>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "420px" }}
      >
        <img
          src="/assets/generated/hero-organic-new.dim_1400x500.jpg"
          alt="Rahamath Organics Hero"
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
            <p className="text-white font-bold text-lg mb-6">
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

      {/* Promotional Banner Slider */}
      <section className="py-4 px-4">
        <div className="container mx-auto max-w-5xl">
          <div
            className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${slide.bg} text-white text-center py-10 px-6`}
          >
            {/* Left arrow */}
            <button
              type="button"
              onClick={() =>
                setCurrentSlide(
                  (prev) => (prev - 1 + SLIDES.length) % SLIDES.length,
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              data-ocid="slider.button"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            {/* Slide content */}
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-5xl mb-3">{slide.emoji}</div>
              <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
              <p className="text-sm opacity-90 mb-4">{slide.subtitle}</p>
            </motion.div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-2">
              {SLIDES.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  className={`rounded-full transition-all ${
                    i === currentSlide
                      ? "w-6 h-2 bg-white"
                      : "w-2 h-2 bg-white/40"
                  }`}
                  data-ocid="slider.toggle"
                />
              ))}
            </div>

            {/* Right arrow */}
            <button
              type="button"
              onClick={() =>
                setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              data-ocid="slider.button"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm border border-border"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-xl">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {f.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products section */}
      <section id="products" className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Our Products</h2>
            {searchQuery.trim() ? (
              <p className="text-muted-foreground text-sm mt-1">
                Search results for:{" "}
                <span className="font-semibold text-green-700">
                  &ldquo;{searchQuery}&rdquo;
                </span>{" "}
                — {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""} found
              </p>
            ) : (
              <p className="text-muted-foreground text-sm mt-1">
                Premium organic products, straight from nature
              </p>
            )}
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

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => setActiveCategory(cat.label)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.label
                  ? "bg-green-700 text-white shadow-md"
                  : "bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100"
              }`}
              data-ocid="product.tab"
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {isWholesale && (
          <div className="bg-navy-50 border border-navy-100 rounded-lg px-4 py-3 mb-6 text-sm text-navy-700">
            🏪 <strong>Wholesale Pricing Active</strong> — Prices shown at 20%
            discount. Minimum order quantity may apply.
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="product.empty_state"
          >
            {searchQuery.trim() ? (
              <>
                <SearchX className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-lg font-medium">
                  No products found for &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-sm mt-1">
                  Try a different search term or browse by category.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                  data-ocid="search.button"
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <p className="text-4xl mb-4">📦</p>
                <p className="text-lg font-medium">
                  No products in this category yet.
                </p>
                <p className="text-sm mt-1">
                  Check back soon or explore other categories.
                </p>
              </>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filteredProducts.map((product, i) => (
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
