"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  BookOpen,
  Calculator,
  Headphones,
  MapPin,
  NotebookTabs,
  Package,
  Phone,
  Shirt,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Utensils,
  WalletCards
} from "lucide-react";
import { bangaloreColleges } from "@/lib/bangalore-colleges";
import { COLLEGECART_WHATSAPP_NUMBER } from "@/lib/contact";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { useMarketplaceStore } from "@/stores/marketplace-store";

const categoryTiles = [
  { name: "Books", icon: BookOpen, color: "bg-ocean/10 text-ocean" },
  { name: "Calculators", icon: Calculator, color: "bg-sun/20 text-amber-700" },
  { name: "Lab Coats", icon: Shirt, color: "bg-coral/10 text-coral" },
  { name: "Electronics", icon: Headphones, color: "bg-mint/12 text-emerald-700" },
  { name: "Cycles", icon: Bike, color: "bg-cyan-100 text-cyan-700" },
  { name: "Hostel Essentials", icon: Utensils, color: "bg-indigo-100 text-indigo-700" },
  { name: "Notes", icon: NotebookTabs, color: "bg-pink-100 text-pink-700" },
  { name: "Mobile Accessories", icon: Smartphone, color: "bg-orange-100 text-orange-700" },
  { name: "Others", icon: Package, color: "bg-slate-100 text-slate-700" }
];

const trustItems = [
  { title: "Verified Students", body: "Profiles are built around college identity and safe campus trade.", icon: BadgeCheck },
  { title: "Safe Marketplace", body: "Verified student profiles and reporting tools help keep campus trading trusted.", icon: ShieldCheck },
  { title: "Meet Locally", body: "Buy and sell near hostels, libraries, departments, and campus gates.", icon: MapPin },
  { title: "Affordable Student Deals", body: "Used books, calculators, cycles, and hostel items at student prices.", icon: WalletCards }
];

export function PublicHomepage() {
  const marketplaceProducts = useMarketplaceStore((state) => state.products);
  const approvedProducts = marketplaceProducts.filter((product) => product.status === "approved");

  const featured = approvedProducts.slice(0, 4);
  const recent = approvedProducts.slice(0, 4);

  return (
    <div className="space-y-12">
      <Hero products={featured.slice(0, 3)} />
      <CollegeShowcase />
      <Categories />
      {featured.length > 0 && <ProductSection eyebrow="Featured products" title="Student essentials ready to buy" products={featured} />}
      <WhyCollegeCart />
      {recent.length > 0 && <ProductSection eyebrow="Recent listings" title="Freshly added near Bangalore campuses" products={recent} />}
    </div>
  );
}

function Hero({ products }: { products: Product[] }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-ink shadow-premium">
      <Image
        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1800&q=80"
        alt="Students using CollegeCart marketplace"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-42"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/86 to-ink/20" />
      <div className={`relative grid min-h-[560px] gap-10 p-6 sm:p-8 lg:items-center lg:p-12 ${products.length ? "lg:grid-cols-[1fr_440px]" : "lg:grid-cols-1"}`}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/[0.12] px-4 py-2 text-sm font-black text-mint backdrop-blur">
            <Sparkles className="size-4" />
            Built for Bangalore college students
          </div>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl">
            Buy & Sell Student Essentials Across Bangalore Colleges
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/[0.78] sm:text-lg">
            Books, Calculators, Lab Coats, Electronics, Cycles, Hostel Essentials and More.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/search" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-ink shadow-premium transition hover:-translate-y-1">
              Browse Products
              <ArrowRight className="size-4" />
            </Link>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSe5G3l8WdYPI9DLH7fWN2SLWseY2ZtFxSiL8JN_QU3voCAXIA/viewform?usp=publish-editor" target="_blank" rel="noopener noreferrer" className="rounded-full bg-ocean px-5 py-3 text-sm font-black text-white shadow-glow transition hover:-translate-y-1">
              Sell Product
            </a>
          </div>
        </motion.div>

        {products.length ? (
          <div className="relative hidden h-[420px] lg:block">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3 + index, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-72 rounded-2xl border border-white/[0.14] bg-white/[0.14] p-3 shadow-premium backdrop-blur-xl"
                style={{ right: index * 38, top: 28 + index * 102, zIndex: 4 - index }}
              >
                <div className="flex items-center gap-3">
                  <Image src={product.images[0]} alt="" width={76} height={76} className="size-19 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{product.name}</p>
                    <p className="text-sm font-black text-mint">{formatPrice(product.price)}</p>
                    <p className="truncate text-xs font-semibold text-white/[0.62]">{product.collegeName}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CollegeShowcase() {
  return (
    <section>
      <SectionHeading eyebrow="Top Bangalore colleges" title="Student marketplace available across major campuses" />
      <div className="premium-scrollbar mt-5 flex gap-4 overflow-x-auto pb-4">
        {bangaloreColleges.map((college) => (
          <motion.article
            key={college.name}
            whileHover={{ y: -7, scale: 1.02 }}
            className="min-w-[245px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-premium dark:border-white/10 dark:bg-white/[0.08]"
          >
            <div className="relative h-36">
              <Image src={college.image} alt={college.name} fill sizes="245px" unoptimized={college.image.includes("commons.wikimedia.org")} className="object-cover" />
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 min-h-10 text-sm font-black text-ink dark:text-white">{college.name}</h3>
              <p className="mt-3 rounded-full bg-mint/12 px-3 py-1 text-xs font-black text-emerald-700 dark:text-mint">
                Student Marketplace Available
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section>
      <SectionHeading eyebrow="Categories" title="Browse campus categories" />
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
        {categoryTiles.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.name}
              href="/search"
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-ocean/30 hover:shadow-md dark:border-white/10 dark:bg-white/[0.08]"
            >
              <span className={`mx-auto grid size-12 place-items-center rounded-2xl ${category.color}`}>
                <Icon className="size-6" />
              </span>
              <span className="mt-3 block text-xs font-black text-ink dark:text-white">{category.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ProductSection({ eyebrow, title, products }: { eyebrow: string; title: string; products: Product[] }) {
  function openWhatsApp(product: Product) {
    const message = `Hello CollegeCart,

I am interested in this product.

Product Name: ${product.name}
Price: ₹${product.price}

Please share availability, payment details and delivery information.

Thank you.`;
    
    const whatsappUrl = `https://wa.me/${COLLEGECART_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  return (
    <section>
      <SectionHeading eyebrow={eyebrow} title={title} action />
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/[0.08]">
            <Link href={`/product/${product.id}`} className="block" aria-label={`Open details for ${product.name}`}>
              <div className="relative aspect-[4/3] bg-slate-100">
                <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-ink">{product.condition}</span>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <h3 className="line-clamp-2 min-h-10 text-sm font-black text-ink dark:text-white">{product.name}</h3>
                  <p className="mt-1 text-xl font-black text-ink dark:text-white">{formatPrice(product.price)}</p>
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                  <p className="truncate">{product.collegeName}</p>
                  <p className="mt-1 inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {product.location}
                  </p>
                </div>
              </div>
            </Link>
            <div className="p-4 pt-0">
              <button 
                onClick={() => openWhatsApp(product)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-3 py-2.5 text-xs font-black text-ink transition hover:bg-emerald-300"
              >
                <Phone className="size-4" />
                Buy Now
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WhyCollegeCart() {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-white/[0.08] dark:ring-white/10 sm:p-8">
      <SectionHeading eyebrow="Why CollegeCart" title="Professional, safe, and made for student deals" />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {trustItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl bg-cloud p-5 dark:bg-white/[0.08]">
              <span className="grid size-12 place-items-center rounded-2xl bg-ocean/10 text-ocean">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 font-black text-ink dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-ocean">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-ink dark:text-white sm:text-3xl">{title}</h2>
      </div>
      {action ? (
        <Link href="/search" className="hidden rounded-full bg-white px-4 py-2 text-sm font-black text-ink shadow-sm ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/10 sm:block">
          View all
        </Link>
      ) : null}
    </div>
  );
}
