# Firestore Schema

## users

```ts
{
  uid: string;
  fullName: string;
  collegeName: string;
  email: string;
  avatarUrl: string;
  role: "student" | "admin";
  online: boolean;
  banned?: boolean;
  savedProductIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## products

```ts
{
  name: string;
  description: string;
  category: string;
  price: number;
  condition: "New" | "Like New" | "Good" | "Fair";
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  collegeName: string;
  location: string;
  contactNumber: string;
  whatsappNumber: string;
  images: string[];
  status: "active" | "sold" | "removed";
  reportCount: number;
  savedCount: number;
  views: number;
  createdAt: Timestamp;
}
```

## messages

```ts
{
  participants: string[];
  productId: string;
  lastMessage: string;
  unread: Record<string, number>;
  typing: Record<string, boolean>;
  updatedAt: Timestamp;
}
```

Each thread has `messages/{threadId}/items/{messageId}`:

```ts
{
  senderId: string;
  text: string;
  attachments?: string[];
  readBy: string[];
  createdAt: Timestamp;
}
```

## notifications

```ts
{
  userId: string;
  title: string;
  body: string;
  type: "message" | "wishlist" | "sold" | "moderation";
  unread: boolean;
  createdAt: Timestamp;
}
```

## wishlists

```ts
{
  userId: string;
  productId: string;
  createdAt: Timestamp;
}
```

Recommended indexes:

- `products`: `category ASC`, `createdAt DESC`
- `products`: `sellerId ASC`, `createdAt DESC`
- `notifications`: `userId ASC`, `createdAt DESC`
- `messages`: `participants ARRAY_CONTAINS`, `updatedAt DESC`
