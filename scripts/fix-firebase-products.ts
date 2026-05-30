/**
 * Script to fix Firebase products collection
 * Ensures all products have:
 * - Proper 'name' field (not empty)
 * - 'updatedAt' timestamp
 * - 'status' field set correctly
 * 
 * Run this from Firebase Console → Firestore Shell or as a Cloud Function
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  // Get these from your .env.local file
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixProductsCollection() {
  console.log("🔧 Starting Firebase products collection fix...");
  
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    
    let fixed = 0;
    let errors = 0;
    
    for (const docSnap of snapshot.docs) {
      const product = docSnap.data();
      const updates: Record<string, any> = {};
      let needsUpdate = false;
      
      // Check 1: Ensure name field exists and is not empty
      if (!product.name || product.name.trim() === "") {
        updates.name = product.sellerName ? `Product from ${product.sellerName}` : "Unnamed Product";
        needsUpdate = true;
        console.warn(`⚠️ Product ${docSnap.id}: name was empty, set to "${updates.name}"`);
      }
      
      // Check 2: Ensure updatedAt exists
      if (!product.updatedAt) {
        updates.updatedAt = new Date().toISOString();
        needsUpdate = true;
        console.warn(`⚠️ Product ${docSnap.id}: updatedAt was missing, set to now`);
      }
      
      // Check 3: Ensure status is set
      if (!product.status || !["pending", "approved", "rejected", "sold"].includes(product.status)) {
        updates.status = product.status || "pending";
        needsUpdate = true;
        console.warn(`⚠️ Product ${docSnap.id}: status was invalid, set to "${updates.status}"`);
      }
      
      // Check 4: Ensure sellerId, sellerName, and other required fields exist
      const requiredFields = ["sellerId", "sellerName", "sellerAvatar", "collegeName"];
      for (const field of requiredFields) {
        if (!product[field]) {
          console.warn(`⚠️ Product ${docSnap.id}: missing required field "${field}"`);
          if (field === "sellerAvatar") {
            updates[field] = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80";
          } else if (field === "collegeName") {
            updates[field] = "Campus";
          }
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        try {
          await updateDoc(doc(db, "products", docSnap.id), updates);
          fixed++;
          console.log(`✅ Fixed product ${docSnap.id}`);
        } catch (err) {
          errors++;
          console.error(`❌ Error fixing product ${docSnap.id}:`, err);
        }
      }
    }
    
    console.log(`\n🎉 Fix complete! Fixed: ${fixed}, Errors: ${errors}, Total: ${snapshot.size}`);
    return { fixed, errors, total: snapshot.size };
  } catch (error) {
    console.error("❌ Error fixing products collection:", error);
    throw error;
  }
}

// Run the fix
fixProductsCollection().then((result) => {
  console.log("✅ Result:", result);
  process.exit(0);
}).catch((error) => {
  console.error("❌ Failed to fix products:", error);
  process.exit(1);
});
