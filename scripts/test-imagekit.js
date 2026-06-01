#!/usr/bin/env node
/**
 * Test script to verify ImageKit configuration and upload functionality
 */

async function testImageKitSetup() {
  console.log('🧪 Testing ImageKit Setup...\n');

  // Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const requiredVars = [
    'NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT',
    'NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY',
    'IMAGEKIT_PRIVATE_KEY'
  ];

  const missing = [];
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      console.log(`   ❌ ${varName}: MISSING`);
      missing.push(varName);
    } else {
      const displayValue = value.substring(0, 10) + '...' + value.substring(value.length - 5);
      console.log(`   ✅ ${varName}: ${displayValue}`);
    }
  }

  if (missing.length > 0) {
    console.error('\n❌ Missing environment variables:', missing);
    process.exit(1);
  }

  console.log('\n2️⃣ Testing API auth endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/imagekit-auth');
    
    if (!response.ok) {
      console.error(`   ❌ Auth endpoint returned ${response.status}`);
      const text = await response.text();
      console.error(`   Error: ${text}`);
      process.exit(1);
    }

    const auth = await response.json();

    console.log(`   ✅ Auth endpoint working`);
    console.log(`      Token: ${auth.token.substring(0, 8)}...`);
    console.log(`      Signature: ${auth.signature.substring(0, 8)}...`);
    console.log(`      Expires: ${new Date(auth.expire * 1000).toISOString()}`);

    console.log('\n✅ ImageKit setup looks good!');
    console.log('\nTo test actual file uploads:');
    console.log('1. Visit http://localhost:3000/verify-student');
    console.log('2. Try uploading an ID card image');
    console.log('3. Check browser console for detailed logs');

  } catch (error) {
    console.error(`   ❌ Failed to reach auth endpoint:`, error);
    console.error('   Make sure the dev server is running on port 3000');
    process.exit(1);
  }
}

testImageKitSetup();
