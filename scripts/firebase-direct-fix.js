/**
 * Direct Firebase Collection Manager
 * Use this to directly view and fix products in your Firebase Firestore
 * 
 * How to use:
 * 1. Go to https://firebase.google.com/docs/firestore/manage-data/add-data
 * 2. Open Firestore -> products collection
 * 3. Copy-paste these commands in Firestore Shell or use Firebase CLI
 */

// ==========================================
// 🔍 VIEW ALL PRODUCTS (Check what's wrong)
// ==========================================

db.collection("products").get().then(snapshot => {
  console.log(`\n📊 TOTAL PRODUCTS: ${snapshot.size}\n`);
  let index = 1;
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`${index}. ID: ${doc.id}`);
    console.log(`   Name: "${data.name || '❌ EMPTY'}"`);
    console.log(`   Seller: ${data.sellerName}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Has updatedAt: ${data.updatedAt ? '✅' : '❌'}`);
    console.log('');
    index++;
  });
});

// ==========================================
// ✅ FIX ALL PRODUCTS (Auto-fix everything)
// ==========================================

db.collection("products").get().then(async snapshot => {
  let fixed = 0;
  let errors = 0;
  console.log(`\n🔧 Starting to fix ${snapshot.size} products...\n`);
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    let needsUpdate = false;
    
    // FIX 1: Empty or missing name
    if (!data.name || data.name.trim() === "") {
      updates.name = data.sellerName ? `Item by ${data.sellerName}` : "Unnamed Product";
      needsUpdate = true;
      console.log(`❌ ${doc.id}: Fixed empty name → "${updates.name}"`);
    }
    
    // FIX 2: Missing updatedAt
    if (!data.updatedAt) {
      updates.updatedAt = new Date().toISOString();
      needsUpdate = true;
      console.log(`❌ ${doc.id}: Added missing updatedAt`);
    }
    
    // FIX 3: Invalid or missing status
    if (!data.status || !["pending", "approved", "rejected", "sold"].includes(data.status)) {
      updates.status = "pending";
      needsUpdate = true;
      console.log(`❌ ${doc.id}: Fixed invalid status → "pending"`);
    }
    
    // FIX 4: Missing sellerName (fallback)
    if (!data.sellerName) {
      updates.sellerName = "Anonymous Seller";
      needsUpdate = true;
      console.log(`❌ ${doc.id}: Fixed missing sellerName`);
    }
    
    if (needsUpdate) {
      try {
        await db.collection("products").doc(doc.id).update(updates);
        fixed++;
        console.log(`✅ ${doc.id}: FIXED\n`);
      } catch (err) {
        errors++;
        console.log(`⚠️ ${doc.id}: ERROR - ${err.message}\n`);
      }
    }
  }
  
  console.log(`\n🎉 DONE! Fixed: ${fixed}, Errors: ${errors}, Total: ${snapshot.size}`);
});

// ==========================================
// 🧹 DELETE ALL PENDING PRODUCTS
// ==========================================

db.collection("products")
  .where("status", "==", "pending")
  .get()
  .then(async snapshot => {
    console.log(`Found ${snapshot.size} pending products. Deleting...`);
    let deleted = 0;
    for (const doc of snapshot.docs) {
      await db.collection("products").doc(doc.id).delete();
      deleted++;
      console.log(`✅ Deleted: ${doc.id}`);
    }
    console.log(`\n🎉 Deleted ${deleted} products`);
  });

// ==========================================
// 🧹 DELETE ALL PRODUCTS
// ==========================================

db.collection("products")
  .get()
  .then(async snapshot => {
    console.log(`⚠️ WARNING: Deleting ALL ${snapshot.size} products...`);
    let deleted = 0;
    for (const doc of snapshot.docs) {
      await db.collection("products").doc(doc.id).delete();
      deleted++;
    }
    console.log(`✅ Deleted ${deleted} products`);
  });

// ==========================================
// 👥 VIEW ALL USERS (Check admin status)
// ==========================================

db.collection("users").get().then(snapshot => {
  console.log(`\n👥 TOTAL USERS: ${snapshot.size}\n`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`${data.fullName} (${data.email})`);
    console.log(`  Role: ${data.role}`);
    console.log(`  Verified: ${data.verificationStatus}`);
    console.log('');
  });
});

// ==========================================
// ✅ MAKE YOURSELF ADMIN (Change your email)
// ==========================================

db.collection("users")
  .where("email", "==", "your.email@gmail.com")  // CHANGE THIS TO YOUR EMAIL
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      db.collection("users").doc(doc.id).update({
        role: "admin",
        verificationStatus: "approved"
      }).then(() => {
        console.log("✅ You are now an admin!");
      });
    });
  });
