export interface SampleProduct {
  id: string;
  name: string;
  description: string;
  retailPrice: number;
  wholesalePrice: number;
  rating: number;
  reviews: number;
  image: string;
  stock: number;
  category: string;
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: "sp-1",
    name: "Wild Forest Honey",
    description:
      "Raw, unfiltered honey collected from wild forest hives. Rich in antioxidants, enzymes, and natural nutrients.",
    retailPrice: 349,
    wholesalePrice: 261,
    rating: 4.8,
    reviews: 124,
    image: "/assets/generated/product-honey.dim_400x400.jpg",
    stock: 50,
    category: "Sweeteners",
  },
  {
    id: "sp-2",
    name: "Cold-Pressed Coconut Oil",
    description:
      "Extra virgin coconut oil cold-pressed within 4 hours of cracking. No heat, no chemicals — pure goodness.",
    retailPrice: 299,
    wholesalePrice: 224,
    rating: 4.7,
    reviews: 98,
    image: "/assets/generated/product-coconut-oil.dim_400x400.jpg",
    stock: 75,
    category: "Oils",
  },
  {
    id: "sp-3",
    name: "Organic Turmeric Powder",
    description:
      "Single-origin turmeric from certified organic farms. High curcumin content, sun-dried and stone-ground.",
    retailPrice: 189,
    wholesalePrice: 141,
    rating: 4.9,
    reviews: 213,
    image: "/assets/generated/product-turmeric.dim_400x400.jpg",
    stock: 100,
    category: "Spices",
  },
  {
    id: "sp-4",
    name: "Raw Whole Cashews",
    description:
      "Premium grade W320 cashews, sun-dried and minimally processed. Crisp, creamy, and naturally delicious.",
    retailPrice: 499,
    wholesalePrice: 374,
    rating: 4.6,
    reviews: 87,
    image: "/assets/generated/product-cashews.dim_400x400.jpg",
    stock: 40,
    category: "Dry Fruits",
  },
  {
    id: "sp-5",
    name: "Organic Green Tea",
    description:
      "First-flush Darjeeling green tea with a delicate grassy flavor. Rich in EGCG antioxidants and L-theanine.",
    retailPrice: 249,
    wholesalePrice: 186,
    rating: 4.5,
    reviews: 156,
    image: "/assets/generated/product-green-tea.dim_400x400.jpg",
    stock: 60,
    category: "Teas",
  },
  {
    id: "sp-6",
    name: "Moringa Leaf Powder",
    description:
      "Nutrient-dense moringa from organically grown trees. Called the 'miracle tree' — packed with 92 nutrients.",
    retailPrice: 279,
    wholesalePrice: 209,
    rating: 4.7,
    reviews: 72,
    image: "/assets/generated/product-moringa.dim_400x400.jpg",
    stock: 80,
    category: "Superfoods",
  },
];
