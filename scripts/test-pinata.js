#!/usr/bin/env node

// Test script to verify Pinata configuration
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

console.log('🔍 Testing Pinata Configuration...\n');

if (!PINATA_JWT) {
  console.log('❌ NEXT_PUBLIC_PINATA_JWT not found in environment variables');
  console.log('\n📋 To fix this:');
  console.log('1. Go to https://pinata.cloud/');
  console.log('2. Sign up/login and go to API Keys');
  console.log('3. Create a new API key');
  console.log('4. Copy the JWT token');
  console.log('5. Add it to your .env.local file:');
  console.log('   NEXT_PUBLIC_PINATA_JWT=your_jwt_token_here');
  process.exit(1);
}

console.log('✅ PINATA_JWT found in environment');
console.log(`📝 Token preview: ${PINATA_JWT.substring(0, 20)}...`);

// Test the token by making a simple API call
async function testPinataToken() {
  try {
    console.log('\n🔄 Testing Pinata API connection...');
    
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Pinata API connection successful!');
      console.log('📊 Account info:', data);
    } else {
      console.log('❌ Pinata API authentication failed');
      console.log('Status:', response.status);
      console.log('Response:', await response.text());
    }
  } catch (error) {
    console.log('❌ Error testing Pinata API:', error.message);
  }
}

testPinataToken();
