export type ProductCondition = "New" | "Like New" | "Good" | "Fair" | "Used";

export type ProductCategory =
  | "Books"
  | "Electronics"
  | "Calculators"
  | "Lab Coats"
  | "Lab Equipment"
  | "Hostel Essentials"
  | "Notes"
  | "Cycles"
  | "Mobile Accessories"
  | "Furniture"
  | "Gaming"
  | "Others";

export type Product = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  condition: ProductCondition;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  collegeName: string;
  location: string;
  contactNumber: string;
  whatsappNumber: string;
  images: string[];
  createdAt: string;
  updatedAt?: string;
  savedCount: number;
  views: number;
  status?: "pending" | "approved" | "rejected" | "sold";
  isTrending?: boolean;
  isCampusDeal?: boolean;
};

export type CategoryItem = {
  name: ProductCategory;
  icon: string;
  accent: string;
};

export type UserProfile = {
  uid: string;
  fullName: string;
  collegeName: string;
  email: string;
  phoneNumber?: string;
  year?: string;
  usn?: string;
  department?: string;
  idCardUrl?: string;
  verificationStatus?: "needs_id" | "pending" | "approved" | "rejected";
  avatarUrl: string;
  role: "student" | "admin";
  online: boolean;
  savedProductIds: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type MessageThread = {
  id: string;
  participantName: string;
  participantAvatar: string;
  productName: string;
  lastMessage: string;
  unread: number;
  online: boolean;
  typing: boolean;
  read: boolean;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  unread: boolean;
};

export type DeliveryPartnerStatus = "pending" | "approved" | "rejected";

export type DeliveryPartnerApplication = {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  usn: string;
  collegeName: string;
  year: string;
  department: string;
  address: string;
  emergencyContact: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  idCardFront: string;
  idCardBack: string;
  profilePhoto: string;
  status: DeliveryPartnerStatus;
  rating: number;
  completedDeliveries: number;
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  price: number;
  deliveryCharge: number;
  totalAmount: number;
  collegeName: string;
  pickupLocation: string;
  dropLocation: string;
  paymentMethod: "online" | "cod";
  codHandlingCharge: number;
  deliveryMethod: "meet" | "delivery";
  status: "available" | "accepted" | "picked_up" | "on_way" | "delivered" | "completed";
  createdAt: string;
  updatedAt: string;
};

export type Review = {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewerName: string;
  deliveryPartnerId: string;
  rating: number;
  text: string;
  createdAt: string;
};
