#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * This script validates that all required environment variables are present
 * and properly configured for both development and production environments.
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const optionalEnvVars = [
  'NEXT_PUBLIC_ANALYTICS_MEASUREMENT_ID',
  'BLOCKBEATS_DEVELOPMENT_MODE'
];

function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');
  
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  
  console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
  console.log(`Platform: ${isVercel ? 'Vercel' : 'Local'}\n`);
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check required environment variables
  console.log('📋 Required Environment Variables:');
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (!value) {
      console.log(`❌ ${envVar}: Missing`);
      hasErrors = true;
    } else if (value.length < 10) {
      console.log(`⚠️  ${envVar}: Value seems too short (${value.length} chars)`);
      hasWarnings = true;
    } else {
      console.log(`✅ ${envVar}: Present (${value.length} chars)`);
    }
  });
  
  console.log('\n📋 Optional Environment Variables:');
  optionalEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (!value) {
      console.log(`⚪ ${envVar}: Not set (optional)`);
    } else {
      console.log(`✅ ${envVar}: Present`);
    }
  });
  
  // Production-specific checks
  if (isProduction) {
    console.log('\n🏭 Production Environment Checks:');
    
    if (process.env.BLOCKBEATS_DEVELOPMENT_MODE === 'true') {
      console.log('⚠️  BLOCKBEATS_DEVELOPMENT_MODE is set to true in production');
      hasWarnings = true;
    }
    
    // Check if Firebase config looks like production
    const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (firebaseProjectId && firebaseProjectId.includes('test')) {
      console.log('⚠️  Firebase project ID contains "test" - ensure this is correct for production');
      hasWarnings = true;
    }
  }
  
  // Vercel-specific checks
  if (isVercel) {
    console.log('\n🚀 Vercel Deployment Checks:');
    
    if (!process.env.VERCEL_ENV) {
      console.log('⚠️  VERCEL_ENV not set');
      hasWarnings = true;
    } else {
      console.log(`✅ Vercel Environment: ${process.env.VERCEL_ENV}`);
    }
    
    // Check if all environment variables are properly set in Vercel
    const missingInVercel = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingInVercel.length > 0) {
      console.log('❌ Missing environment variables in Vercel:');
      missingInVercel.forEach(envVar => console.log(`   - ${envVar}`));
      hasErrors = true;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (hasErrors) {
    console.log('❌ Environment validation FAILED');
    console.log('\nTo fix this:');
    console.log('1. For local development: Copy env.example to .env.local and fill in values');
    console.log('2. For Vercel deployment: Add missing variables in Vercel Dashboard > Settings > Environment Variables');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Environment validation completed with warnings');
    console.log('Please review the warnings above and fix if necessary.');
  } else {
    console.log('✅ Environment validation PASSED');
  }
  
  console.log('\n🔧 Next steps:');
  if (isVercel && !hasErrors) {
    console.log('- Your Vercel deployment should work correctly');
    console.log('- Monitor the deployment logs for any runtime issues');
  } else if (!isVercel) {
    console.log('- Run "yarn dev" to start development server');
    console.log('- Run "yarn build" to test production build locally');
  }
}

// Run validation
validateEnvironment();
