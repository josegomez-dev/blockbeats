#!/usr/bin/env node

// Test script to verify Pinata API Key configuration
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

console.log('🔍 Testing Pinata API Key Configuration...\n');

if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  console.log('❌ Pinata API keys not found in environment variables');
  console.log('\n📋 To fix this:');
  console.log('1. Go to https://pinata.cloud/');
  console.log('2. Sign up/login and go to API Keys');
  console.log('3. Create a new API key');
  console.log('4. Copy both the API Key and Secret API Key');
  console.log('5. Add them to your .env.local file:');
  console.log('   NEXT_PUBLIC_PINATA_API_KEY=your_api_key_here');
  console.log('   NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_secret_api_key_here');
  process.exit(1);
}

console.log('✅ Pinata API keys found in environment');
console.log(`📝 API Key preview: ${PINATA_API_KEY.substring(0, 10)}...`);
console.log(`📝 Secret Key preview: ${PINATA_SECRET_API_KEY.substring(0, 10)}...`);

// Test the API keys by making a simple API call
async function testPinataAPIKeys() {
  try {
    console.log('\n🔄 Testing Pinata API connection...');
    
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
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

testPinataAPIKeys();
