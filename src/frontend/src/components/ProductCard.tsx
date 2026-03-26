import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import type { SampleProduct } from "@/data/sampleProducts";
import { Eye, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardProps {
  product: SampleProduct;
  isWholesale: boolean;
  index: number;
}

export function ProductCard({ product, isWholesale, index }: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const price = isWholesale ? product.wholesalePrice : product.retailPrice;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price,
      quantity: 1,
      image: product.image,
    });
    toast.success(`${product.name} added to cart`);
    openCart();
  };

  return (
    <div
      className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-card transition-shadow group"
      data-ocid={`product.item.${index}`}
    >
      <div className="relative overflow-hidden aspect-square bg-secondary/30">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-4xl">🌿</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          {product.category}
        </div>
      </div>
      <div className="p-3">
        <h3
          className="font-semibold text-sm text-foreground truncate"
          title={product.name}
        >
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i <= Math.floor(product.rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            ({product.reviews})
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="font-bold text-foreground">₹{price}</span>
            {isWholesale && (
              <span className="text-xs text-muted-foreground line-through ml-1">
                ₹{product.retailPrice}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            className="flex-1 bg-navy-700 hover:bg-navy-800 text-white text-xs gap-1"
            onClick={handleAddToCart}
            data-ocid={`product.primary_button.${index}`}
          >
            <ShoppingCart className="w-3 h-3" />
            Add to Cart
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="px-2 border-border"
            data-ocid={`product.secondary_button.${index}`}
          >
            <Eye className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
