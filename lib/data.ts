import type { CategoryItem, MessageThread, NotificationItem, Product, UserProfile } from "@/lib/types";

export const categories: CategoryItem[] = [
  { name: "Books", icon: "BookOpen", accent: "bg-ocean/10 text-ocean" },
  { name: "Calculators", icon: "Calculator", accent: "bg-sun/20 text-amber-600" },
  { name: "Lab Coats", icon: "Shirt", accent: "bg-coral/10 text-coral" },
  { name: "Electronics", icon: "Headphones", accent: "bg-mint/10 text-emerald-600" },
  { name: "Cycles", icon: "Bike", accent: "bg-cyan-100 text-cyan-700" },
  { name: "Hostel Essentials", icon: "Utensils", accent: "bg-indigo-100 text-indigo-600" },
  { name: "Notes", icon: "NotebookTabs", accent: "bg-pink-100 text-pink-600" },
  { name: "Mobile Accessories", icon: "Smartphone", accent: "bg-orange-100 text-orange-700" },
  { name: "Others", icon: "Package", accent: "bg-slate-100 text-slate-700" }
];

export const demoUser: UserProfile = {
  uid: "demo-student",
  fullName: "Aarav Mehta",
  collegeName: "MS Ramaiah Institute of Technology (MSRIT)",
  email: "aarav@collegecart.app",
  phoneNumber: "+91 98765 43210",
  year: "3rd Year",
  usn: "1MS23CS044",
  department: "Computer Science",
  avatarUrl:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
  role: "admin",
  verificationStatus: "approved",
  online: true,
  savedProductIds: ["ipad-air", "cycle-pro"]
};

export const products: Product[] = [
  {
    id: "ipad-air",
    name: "iPad Air M1 with Apple Pencil",
    description:
      "Lightly used iPad Air M1 with original Apple Pencil, paperlike screen protector, and a magnetic folio. Perfect for notes, design work, and lectures.",
    category: "Electronics",
    price: 45999,
    condition: "Like New",
    sellerId: "seller-1",
    sellerName: "Nisha Rao",
    sellerAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    collegeName: "PES University",
    location: "Electronic City",
    contactNumber: "+91 98765 43210",
    whatsappNumber: "+919876543210",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=1000&q=80"
    ],
    createdAt: "2026-05-28T09:00:00.000Z",
    savedCount: 42,
    views: 318,
    isTrending: true,
    isCampusDeal: true
  },
  {
    id: "engineering-books",
    name: "Engineering Mechanics Book Set",
    description:
      "Semester 2 mechanics books with neat highlights and solved PYQs. Includes printed formula sheets.",
    category: "Books",
    price: 900,
    condition: "Good",
    sellerId: "seller-2",
    sellerName: "Kabir Sethi",
    sellerAvatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80",
    collegeName: "BMS College of Engineering",
    location: "Basavanagudi",
    contactNumber: "+91 99887 77665",
    whatsappNumber: "+919988777665",
    images: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80"
    ],
    createdAt: "2026-05-27T15:30:00.000Z",
    savedCount: 18,
    views: 141,
    isCampusDeal: true
  },
  {
    id: "cycle-pro",
    name: "BTwin Campus Cycle",
    description:
      "Well maintained 21-speed cycle with lock, mudguard, and phone holder. Ideal for campus commute.",
    category: "Cycles",
    price: 3500,
    condition: "Used",
    sellerId: "seller-3",
    sellerName: "Rhea John",
    sellerAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    collegeName: "RV College of Engineering",
    location: "Mysore Road",
    contactNumber: "+91 91234 56780",
    whatsappNumber: "+919123456780",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80"
    ],
    createdAt: "2026-05-26T11:00:00.000Z",
    savedCount: 67,
    views: 505,
    isTrending: true
  },
  {
    id: "scientific-calculator",
    name: "Casio FX-991ES",
    description:
      "Original scientific calculator, exam allowed, with cover. Battery is strong and all keys work perfectly.",
    category: "Calculators",
    price: 500,
    condition: "Used",
    sellerId: "seller-4",
    sellerName: "Dev Patel",
    sellerAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80",
    collegeName: "MS Ramaiah Institute of Technology (MSRIT)",
    location: "Mathikere",
    contactNumber: "+91 90000 11122",
    whatsappNumber: "+919000011122",
    images: [
      "https://images.unsplash.com/photo-1611532736580-0c4cecf6e12d?auto=format&fit=crop&w=1000&q=80"
    ],
    createdAt: "2026-05-25T08:45:00.000Z",
    savedCount: 24,
    views: 188
  },
  {
    id: "gaming-keyboard",
    name: "boAt Rockerz Bluetooth Headphones",
    description:
      "Blue switch keyboard with extra keycaps. Great for coding, gaming nights, and desk setups.",
    category: "Electronics",
    price: 2400,
    condition: "Good",
    sellerId: "seller-5",
    sellerName: "Meera Shah",
    sellerAvatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80",
    collegeName: "Dayananda Sagar College of Engineering",
    location: "Kumaraswamy Layout",
    contactNumber: "+91 97777 44455",
    whatsappNumber: "+919777744455",
    images: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80"
    ],
    createdAt: "2026-05-24T18:10:00.000Z",
    savedCount: 31,
    views: 231,
    isTrending: true
  },
  {
    id: "study-chair",
    name: "Hostel Study Chair",
    description:
      "Compact chair with adjustable height and lumbar support. Pickup from hostel lobby.",
    category: "Hostel Essentials",
    price: 3100,
    condition: "Fair",
    sellerId: "seller-6",
    sellerName: "Aditya Iyer",
    sellerAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    collegeName: "NMIT",
    location: "Hostel A",
    contactNumber: "+91 96666 12345",
    whatsappNumber: "+919666612345",
    images: [
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1000&q=80"
    ],
    createdAt: "2026-05-23T12:20:00.000Z",
    savedCount: 12,
    views: 96
  }
];

export const messages: MessageThread[] = [];

export const notifications: NotificationItem[] = [];

export const heroSlides = [
  {
    eyebrow: "Campus deal",
    title: "Upgrade your semester setup",
    body: "Verified student listings, fast chats, and pickup points inside your campus.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    icon: "Sparkles"
  },
  {
    eyebrow: "Move-out week",
    title: "Sell hostel essentials in minutes",
    body: "Post photos, set a fair price, and meet buyers before checkout week.",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80",
    icon: "Bell"
  }
];
