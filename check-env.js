#!/usr/bin/env node

/**
 * Environment Check Script for BlockBeats
 * Checks if all required environment variables are properly set
 */

console.log('\n🔍 BlockBeats Environment Check');
console.log('================================');

// Required Firebase variables
const requiredFirebaseVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
];

const missingVars = [];
const warnings = [];

// Check required Firebase variables
console.log('\n🔥 Firebase Configuration:');
requiredFirebaseVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    missingVars.push(varName);
    console.log(`  ${varName}: ❌ Missing`);
  } else {
    console.log(`  ${varName}: ✅ Set`);
  }
});

// Check optional Analytics variable
console.log('\n📊 Analytics Configuration:');
if (process.env.ANALYTICS_MEASUREMENT_ID) {
  console.log('  Analytics Measurement ID: ✅ Set');
} else {
  console.log('  Analytics Measurement ID: ⚠️  Not set (optional)');
  warnings.push('ANALYTICS_MEASUREMENT_ID is not set (optional)');
}

// Check app configuration
console.log('\n⚙️  App Configuration:');
const devMode = process.env.BLOCKBEATS_DEVELOPMENT_MODE === 'true';
console.log(`  Development Mode: ${devMode ? '✅' : '❌'} (${process.env.BLOCKBEATS_DEVELOPMENT_MODE || 'not set'})`);

// Summary
console.log('\n📋 Summary:');
if (missingVars.length > 0) {
  console.log('❌ Missing Required Variables:');
  missingVars.forEach((varName) => {
    console.log(`  - ${varName}`);
  });
  console.log('\n💡 To fix: Copy env.example to .env.local and fill in the values');
} else {
  console.log('✅ All required environment variables are set!');
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach((warning) => {
    console.log(`  - ${warning}`);
  });
}

console.log('\n================================');
console.log(`${missingVars.length === 0 ? '✅' : '❌'} Environment Status: ${missingVars.length === 0 ? 'Valid' : 'Invalid'}`);
console.log('================================\n');
