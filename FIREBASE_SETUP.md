# Firebase Setup Guide for CollegeCart

## 📋 Step 1: Create Firestore Collections

Go to **Firebase Console** → **Firestore Database** → **Create Collection**

### Collection 1: `products`
```
Document ID: auto-generate
Fields:
- id (string)
- name (string) 
- description (string)
- category (string)
- price (number)
- condition (string)
- location (string)
- contactNumber (string)
- whatsappNumber (string)
- images (array of strings)
- sellerId (string)
- sellerName (string)
- sellerAvatar (string)
- collegeName (string)
- createdAt (timestamp)
- updatedAt (timestamp)
- savedCount (number)
- views (number)
- status (string) - "pending", "approved", "rejected", "sold"
```

### Collection 2: `users`
```
Document ID: uid (from Firebase Auth)
Fields:
- uid (string)
- fullName (string)
- email (string)
- collegeName (string)
- year (string)
- usn (string)
- department (string)
- phoneNumber (string)
- idCardUrl (string)
- avatarUrl (string)
- role (string) - "admin", "student"
- verificationStatus (string) - "needs_id", "pending", "approved", "rejected"
- banned (boolean)
- updatedAt (timestamp)
```

### Collection 3: `wishlists`
```
Document ID: {userId}_{productId}
Fields:
- userId (string)
- productId (string)
- createdAt (timestamp)
```

---

## 🔐 Step 2: Set Firestore Security Rules

Go to **Firestore Database** → **Rules** → Replace everything with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products collection
    match /products/{productId} {
      // Anyone can read products
      allow read: if true;
      
      // Only authenticated users can create
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.sellerId;
      
      // Only seller or admin can update/delete
      allow update, delete: if request.auth != null && 
                               (request.auth.uid == resource.data.sellerId || 
                                get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin");
    }

    // Users collection
    match /users/{userId} {
      // Anyone can read (for display purposes)
      allow read: if true;
      
      // Only own user can write
      allow write: if request.auth.uid == userId;
    }

    // Wishlists collection
    match /wishlists/{wishlistId} {
      // Only authenticated users can read their own wishlists
      allow read: if request.auth != null;
      
      // Only owner can write
      allow write: if request.auth != null && 
                     request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## ✅ Step 3: Verify Setup

1. **Check Products are Saving:**
   - Go to `/sell`
   - Upload a product
   - Go to Firebase Console → Firestore → `products` collection
   - You should see the new product!

2. **Check Admin Panel:**
   - Go to `/admin`
   - You should see "Products waiting for review"
   - Click "Approve" to change status

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Upload a product
   - You should see: `"Saving product to Firestore: [id]"`
   - You should see: `"Product saved successfully: [id]"`

---

## 🐛 Troubleshooting

### "No products showing in admin"
✓ Check if products were created (they show as "local-xxx" in browser storage first)
✓ Check Firestore rules - permission-denied error means rules are blocking

### "Images uploaded but cloud save failed"
✓ Images upload to ImageKit ✓
✓ Product fails to save to Firestore ✗
✓ Check Firestore rules and authentication

### "Collections don't exist"
✓ Firestore auto-creates collections when you write data
✓ Or manually create them with the IDs above

---

## 📱 Admin Email

Make sure your admin email matches:
```
ADMIN_EMAIL = "your-admin-email@gmail.com"
```

Check in: `stores/auth-store.ts` → Search for `ADMIN_EMAIL`

---

## 🎯 Data Flow

```
1. User uploads product with images
   ↓
2. Images upload to ImageKit ✓
   ↓
3. Product data saves to Firestore ("pending" status)
   ↓
4. Admin panel fetches products in real-time
   ↓
5. Admin approves/rejects
   ↓
6. Product status updates to "approved"/"rejected"
```

---

**Once all this is done, products will show in admin panel and you can approve them!** 🚀
