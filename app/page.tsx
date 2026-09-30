"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Globe,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { client } from "../sanity/lib/client";

interface Product {
  id: string;
  name: string;
  category: string;
  priceNGN: number;
  priceUSD: number;
  image: string;
  badge?: string;
  isOut?: boolean;
  colors: string[];
}

const categories = ["All", "New Arrivals", "T-Shirts", "Polo", "Outerwear", "Accessories"];
const SIZES = ["S", "M", "L", "XL"] as const;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [cart, setCart] = useState<{ product: Product; size: string; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchSanityProducts() {
      try {
        if (!client) {
          setProducts([]);
          return;
        }

        const query = `*[_type == "product"]{
          _id,
          name,
          category,
          priceNGN,
          priceUSD,
          "image": images[0].asset->url,
          badge,
          isOut
        }`;

        const data = (await client.fetch(query)) as Array<Record<string, unknown>>;

        const formattedProducts: Product[] = data.map((item) => ({
          id: String(item._id ?? "sruf-item"),
          name: String(item.name ?? "SRUF Item"),
          category: String(item.category ?? "New Arrivals"),
          priceNGN: Number(item.priceNGN ?? 0),
          priceUSD: Number(item.priceUSD ?? 0),
          image:
            String(item.image) ||
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop",
          badge: typeof item.badge === "string" ? item.badge : undefined,
          isOut: Boolean(item.isOut),
          colors: ["#D92323", "#0f172a"],
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching Sanity products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSanityProducts();
  }, []);

  const filteredProducts = useMemo(
    () =>
      selectedCategory === "All"
        ? products
        : products.filter((product) => product.category === selectedCategory),
    [products, selectedCategory],
  );

  const addToCart = (product: Product, size: string = "M") => {
    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) => item.product.id === product.id && item.size === size,
      );

      if (existing) {
        return previousCart.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...previousCart, { product, size, quantity: 1 }];
    });

    setIsCartOpen(true);
  };

  const formatPrice = (ngn: number, usd: number) =>
    currency === "NGN" ? `₦${(ngn || 0).toLocaleString()}` : `$${(usd || 0).toLocaleString()}`;

  const totalAmount = cart.reduce((sum, item) => {
    const price = currency === "NGN" ? item.product.priceNGN : item.product.priceUSD;
    return sum + (price || 0) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <span className="hidden sm:inline">SRUF '26 — EXPRESSION, COLOR & CULTURE</span>
          <span className="w-full text-center sm:w-auto">Worldwide shipping available</span>
          <button
            type="button"
            aria-label="Toggle currency"
            onClick={() => setCurrency((current) => (current === "NGN" ? "USD" : "NGN"))}
            className="flex items-center gap-1 rounded bg-black/30 px-2 py-1 font-mono text-white transition hover:bg-black/50"
          >
            <Globe className="h-3 w-3" /> {currency}
          </button>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-neutral-800 bg-[#0a0a0c]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-8">
            <button type="button" className="p-1 text-neutral-300 transition hover:text-white lg:hidden" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </button>

            <a href="#" className="group relative text-2xl font-black uppercase tracking-tighter text-white">
              <span className="bg-gradient-to-r from-violet-400 via-pink-500 to-amber-400 bg-clip-text text-transparent">
                SRUF
              </span>
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-300 group-hover:w-full" />
            </a>

            <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 lg:flex">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`transition hover:text-pink-400 ${
                    selectedCategory === category
                      ? "font-bold text-pink-500 underline decoration-2 underline-offset-8"
                      : ""
                  }`}
                >
                  {category}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <button type="button" className="text-neutral-300 transition hover:text-pink-400" aria-label="Search products">
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-md shadow-pink-500/20 transition hover:opacity-90"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>BAG</span>
              <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-black">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </button>
          </div>
        </div>
      </header>

      <section className="relative flex h-[75vh] items-end overflow-hidden border-b border-neutral-800 p-8 md:p-16">
        <div className="absolute left-10 top-1/4 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-pink-600/20 blur-3xl" />
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center opacity-30 transition duration-1000 hover:scale-100 mix-blend-luminosity"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600&auto=format&fit=crop')",
          }}
        />

        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-block rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.25em] text-white">
            SRUF Collection 2026
          </span>
          <h1 className="text-5xl font-black uppercase leading-none tracking-tight text-white md:text-7xl">
            Wear the <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">vibe.</span>
          </h1>
          <p className="max-w-xl text-lg text-neutral-300">
            Premium essentials for culture, movement, and self-expression. Curated streetwear with bold silhouettes and everyday comfort.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">Featured drops</p>
            <h2 className="mt-2 text-3xl font-black uppercase text-white">Fresh fits</h2>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-neutral-200 transition hover:border-pink-500 hover:text-pink-400"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-8 text-center text-neutral-300">
            Loading collection...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-950/40 p-12 text-center text-neutral-400">
            No products available yet. Add items in your Sanity dashboard.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const selectedSize = selectedSizes[product.id] ?? "M";

              return (
                <article key={product.id} className="group overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/70 shadow-2xl shadow-black/20">
                  <div className="relative overflow-hidden bg-neutral-900">
                    {product.badge ? (
                      <span className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900">
                        {product.badge}
                      </span>
                    ) : null}
                    {product.isOut ? (
                      <span className="absolute right-4 top-4 z-10 rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        Sold out
                      </span>
                    ) : null}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-80 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{product.category}</p>
                        <h3 className="mt-2 text-xl font-bold text-white">{product.name}</h3>
                      </div>
                      <span className="text-lg font-black text-pink-400">{formatPrice(product.priceNGN, product.priceUSD)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() =>
                            setSelectedSizes((current) => ({
                              ...current,
                              [product.id]: size,
                            }))
                          }
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] transition ${
                            selectedSize === size
                              ? "border-pink-500 bg-pink-500/10 text-pink-300"
                              : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(product, selectedSize)}
                      disabled={product.isOut}
                      className="w-full rounded-full bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-neutral-950 transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
                    >
                      {product.isOut ? "Sold out" : "Add to bag"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {isCartOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
          <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-[#111114] p-6 shadow-2xl shadow-black/40">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400">Your bag</p>
                <h3 className="mt-2 text-2xl font-black uppercase text-white">Cart</h3>
              </div>
              <button type="button" onClick={() => setIsCartOpen(false)} className="rounded-full border border-neutral-700 p-2 text-neutral-300 hover:text-white" aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-neutral-700 p-6 text-sm text-neutral-400">
                  Your bag is empty. Add a few pieces to get started.
                </p>
              ) : (
                cart.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-4 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-3">
                    <img src={item.product.image} alt={item.product.name} className="h-20 w-20 rounded-xl object-cover" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-white">{item.product.name}</p>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Size {item.size}</p>
                        </div>
                        <span className="text-sm font-bold text-pink-400">
                          {formatPrice(item.product.priceNGN, item.product.priceUSD)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-neutral-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-neutral-950 p-4">
              <div className="flex items-center justify-between text-sm text-neutral-300">
                <span>Subtotal</span>
                <span className="font-bold text-white">{formatPrice(totalAmount, totalAmount)}</span>
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white"
              >
                Checkout
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
