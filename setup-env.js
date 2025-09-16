#!/usr/bin/env node

/**
 * Environment Setup Script for BlockBeats
 * This script helps you set up your environment variables correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 BlockBeats Environment Setup');
console.log('================================\n');

// Check if .env.local already exists
const envLocalPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, 'env.example');

if (fs.existsSync(envLocalPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('If you want to recreate it, please delete the existing file first.\n');
  process.exit(0);
}

// Read env.example
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ env.example file not found!');
  process.exit(1);
}

const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');

// Create .env.local with instructions
const envLocalContent = `# ===========================================
# BLOCKBEATS LOCAL ENVIRONMENT VARIABLES
# ===========================================
# This file is for local development only
# DO NOT commit this file to version control

# ===========================================
# FIREBASE CONFIGURATION (REQUIRED)
# ===========================================
FIREBASE_API_KEY=AIzaSyDLzTaGe_WCw9RVdutz4Mqx-ViQrL_to9Y
FIREBASE_AUTH_DOMAIN=blockbeats-ee6d3.firebaseapp.com
FIREBASE_PROJECT_ID=blockbeats-ee6d3
FIREBASE_STORAGE_BUCKET=blockbeats-ee6d3.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=380764586846
FIREBASE_APP_ID=1:380764586846:web:7285f377aa1d29103d85cf

# ===========================================
# ANALYTICS CONFIGURATION (OPTIONAL)
# ===========================================
# Analytics Measurement ID (serves both Firebase Analytics and Google Analytics)
ANALYTICS_MEASUREMENT_ID=G-018RENMEBY

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
BLOCKBEATS_DEVELOPMENT_MODE=true
`;

// Write .env.local
fs.writeFileSync(envLocalPath, envLocalContent);

console.log('✅ Created .env.local file successfully!');
console.log('\n📋 Next Steps:');
console.log('1. Update the analytics IDs in .env.local if you have them');
console.log('2. Run "npm run dev" to test locally');
console.log('3. Check the browser console for Firebase configuration status');
console.log('\n🌐 For Production Deployment:');
console.log('1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables');
console.log('2. Add all the variables from .env.local');
console.log('3. Set BLOCKBEATS_DEVELOPMENT_MODE=false for production');
console.log('4. Redeploy your application');
console.log('\n🔍 To verify Firebase configuration:');
console.log('- Check browser console for "Firebase Configuration Status"');
console.log('- All items should show ✅');
console.log('\n✨ Setup complete! Happy coding!');
