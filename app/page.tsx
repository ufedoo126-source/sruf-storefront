"use client";

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Globe, 
  ArrowUpRight 
} from "lucide-react";
import { client } from "@/sanity/lib/client";
import { usePaystackPayment } from "react-paystack";

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

// Paystack Button Component
const PaystackButton = ({ amountNGN, email, onSuccess }: { amountNGN: number; email: string; onSuccess: () => void }) => {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY || "pk_test_sample_key";

  const config = {
    reference: new Date().getTime().toString(),
    email: email || "customer@sruf.com",
    amount: amountNGN * 100, // Paystack expects amount in Kobo
    publicKey,
    currency: "NGN",
  };

  const initializePayment = usePaystackPayment(config);

  return (
    <button
      onClick={() => {
        if (!email) {
          alert("Please enter your email address to proceed with checkout.");
          return;
        }
        initializePayment({
          onSuccess: (reference: any) => {
            alert(`Payment Successful! Reference: ${reference.reference}`);
            onSuccess();
          },
          onClose: () => {
            console.log("Payment canceled");
          },
        });
      }}
      className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 text-white py-4 text-xs font-extrabold uppercase tracking-widest rounded-xl hover:opacity-90 transition shadow-lg shadow-pink-500/20"
    >
      PAY NOW WITH PAYSTACK
    </button>
  );
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [cart, setCart] = useState<{ product: Product; size: string; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [customerEmail, setCustomerEmail] = useState("");

  const categories = ["All", "New Arrivals", "T-Shirts", "Polo", "Outerwear", "Accessories"];

  useEffect(() => {
    async function fetchSanityProducts() {
      try {
        const query = `*[_type == "product"]{
          "_id": _id,
          "name": name,
          "category": select(defined(category) => category, "New Arrivals"),
          "priceNGN": priceNGN,
          "priceUSD": priceUSD,
          "image": images[0].asset->url,
          "badge": badge,
          "isOut": isOut
        }`;
        
        const data = await client.fetch(query);
        
        const formattedProducts: Product[] = data.map((item: any) => ({
          id: item._id,
          name: item.name || "SRUF Item",
          category: item.category || "New Arrivals",
          priceNGN: item.priceNGN || 0,
          priceUSD: item.priceUSD || 0,
          image: item.image || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop",
          badge: item.badge,
          isOut: item.isOut || false,
          colors: ["#D92323", "#000000"]
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

  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product, size: string = "M") => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size === size);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const formatPrice = (ngn: number, usd: number) => {
    return currency === "NGN" 
      ? `₦${(ngn || 0).toLocaleString()}` 
      : `$${(usd || 0).toLocaleString()}`;
  };

  const totalAmountNGN = cart.reduce((sum, item) => sum + (item.product.priceNGN || 0) * item.quantity, 0);
  const totalAmountUSD = cart.reduce((sum, item) => sum + (item.product.priceUSD || 0) * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 text-white text-xs py-2.5 px-4 font-bold tracking-widest uppercase flex justify-between items-center shadow-lg">
        <span className="hidden sm:inline">SRUF '26 — EXPRESSION, COLOR & CULTURE</span>
        <span className="w-full sm:w-auto text-center">WORLDWIDE SHIPPING AVAILABLE</span>
        <button 
          onClick={() => setCurrency(c => c === "NGN" ? "USD" : "NGN")} 
          className="bg-black/30 hover:bg-black/50 px-2 py-1 rounded text-white flex items-center gap-1 font-mono transition"
        >
          <Globe className="w-3 h-3" /> {currency}
        </button>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-[#0a0a0c]/90 backdrop-blur-md border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button className="lg:hidden p-1 text-neutral-300 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          
          <a href="#" className="relative group text-2xl font-black tracking-tighter uppercase text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-500 to-amber-400">
              SRUF
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {categories.slice(0, 5).map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`hover:text-pink-400 transition ${selectedCategory === cat ? "text-pink-500 font-bold underline underline-offset-8 decoration-2" : ""}`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <button className="text-neutral-300 hover:text-pink-400 transition">
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative bg-gradient-to-r from-violet-600 to-pink-600 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full hover:opacity-90 shadow-md shadow-pink-500/20 transition flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>BAG</span>
            <span className="bg-white text-black font-extrabold px-1.5 py-0.5 text-[10px] rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[75vh] flex items-end justify-start p-8 md:p-16 border-b border-neutral-800 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-violet-600/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70 hover:scale-105 transition duration-1000"
          style={{ backgroundImage: "url('/background.jpeg')" }}
        />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-block bg-gradient-to-r from-pink-500 to-violet-500 text-white text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full uppercase">
            BECOMING COLLECTION 2026
          </span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none text-white">
            WEAR THE <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400">VIBE.</span>
          </h1>
          <p className="text-neutral-300 text-sm md:text-base max-w-md font-light">
            Vibrant street couture engineered for the bold. Expressing African heritage with modern edge.
          </p>
          <div className="pt-2">
            <button className="bg-white text-black px-8 py-3.5 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-neutral-200 transition flex items-center gap-2 shadow-xl">
              EXPLORE COLLECTION <ArrowUpRight className="w-4 h-4 text-violet-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Product List */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-neutral-800">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">
              FEATURED <span className="text-pink-500">DROPS</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {loading ? "Loading products..." : `Showing ${filteredProducts.length} items`}
            </p>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs tracking-wider uppercase rounded-full transition whitespace-nowrap font-bold ${
                  selectedCategory === cat 
                    ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg shadow-pink-500/20" 
                    : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-20 text-center text-neutral-500 text-sm uppercase tracking-widest">
            Fetching collection from Sanity...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-neutral-500 text-sm uppercase tracking-widest">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="group relative flex flex-col bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1">
                <div className="relative aspect-[3/4] bg-neutral-950 overflow-hidden">
                  {product.badge && (
                    <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-pink-500 to-violet-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase shadow-md">
                      {product.badge}
                    </span>
                  )}
                  {product.isOut && (
                    <span className="absolute top-3 right-3 z-10 bg-neutral-900 text-neutral-400 border border-neutral-700 text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                      SOLD OUT
                    </span>
                  )}
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className={`w-full h-full object-cover transition duration-700 group-hover:scale-105 ${product.isOut ? "opacity-40 grayscale" : ""}`}
                  />
                  
                  {!product.isOut && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-full bg-white text-black text-xs font-extrabold py-3.5 uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition shadow-lg"
                      >
                        ADD TO BAG
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm tracking-wide text-neutral-100 group-hover:text-pink-400 transition">
                        {product.name}
                      </h3>
                      <span className="text-xs font-mono font-extrabold text-neutral-200">
                        {formatPrice(product.priceNGN, product.priceUSD)}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 uppercase mt-1">{product.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer with Paystack */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0f0f12] h-full border-l border-neutral-800 p-6 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <h3 className="text-lg font-black tracking-tight uppercase text-white">YOUR BAG ({cart.length})</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-20 text-center text-neutral-500 text-xs uppercase tracking-widest">
                  YOUR BAG IS CURRENTLY EMPTY.
                </div>
              ) : (
                <div className="mt-6 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 border-b border-neutral-800/80 pb-4">
                      <img src={item.product.image} className="w-16 h-20 object-cover bg-neutral-900 rounded-md" alt="" />
                      <div className="flex-1 text-xs space-y-1">
                        <p className="font-bold text-white">{item.product.name}</p>
                        <p className="text-neutral-400">SIZE: {item.size}</p>
                        <p className="font-mono text-pink-400 font-bold">{formatPrice(item.product.priceNGN, item.product.priceUSD)} x {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 uppercase font-bold mb-1">
                    Email Address for Receipt
                  </label>
                  <input
                    type="email"
                    placeholder="your-email@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="flex justify-between text-sm font-bold tracking-tight text-white">
                  <span>SUBTOTAL</span>
                  <span className="font-mono text-pink-400">
                    {currency === "NGN" ? `₦${totalAmountNGN.toLocaleString()}` : `$${totalAmountUSD.toLocaleString()}`}
                  </span>
                </div>

                <PaystackButton
                  amountNGN={totalAmountNGN}
                  email={customerEmail}
                  onSuccess={() => {
                    setCart([]);
                    setIsCartOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}