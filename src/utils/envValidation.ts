/**
 * Environment Variable Validation Utility
 * Helps ensure all required environment variables are properly set
 */

export interface EnvValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
  config: {
    firebase: {
      apiKey: boolean;
      authDomain: boolean;
      projectId: boolean;
      storageBucket: boolean;
      messagingSenderId: boolean;
      appId: boolean;
      measurementId: boolean;
    };
    analytics: {
      measurementId: boolean;
    };
    app: {
      developmentMode: boolean;
    };
  };
}

/**
 * Validates all environment variables used in the application
 */
export function validateEnvironment(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    missingVars: [],
    warnings: [],
    config: {
      firebase: {
        apiKey: false,
        authDomain: false,
        projectId: false,
        storageBucket: false,
        messagingSenderId: false,
        appId: false,
        measurementId: false,
      },
      analytics: {
        measurementId: false,
      },
      app: {
        developmentMode: false,
      },
    },
  };

  // Required Firebase variables
  const requiredFirebaseVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
  ];

  // Check required Firebase variables
  requiredFirebaseVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      result.missingVars.push(varName);
      result.isValid = false;
    } else {
      // Update config status
      const key = varName.replace('FIREBASE_', '').toLowerCase();
      if (key === 'api_key') result.config.firebase.apiKey = true;
      if (key === 'auth_domain') result.config.firebase.authDomain = true;
      if (key === 'project_id') result.config.firebase.projectId = true;
      if (key === 'storage_bucket') result.config.firebase.storageBucket = true;
      if (key === 'messaging_sender_id') result.config.firebase.messagingSenderId = true;
      if (key === 'app_id') result.config.firebase.appId = true;
    }
  });

  // Optional Analytics variable
  if (process.env.ANALYTICS_MEASUREMENT_ID) {
    result.config.firebase.measurementId = true;
    result.config.analytics.measurementId = true;
  } else {
    result.warnings.push('ANALYTICS_MEASUREMENT_ID is not set (optional)');
  }

  // App configuration
  result.config.app.developmentMode = process.env.BLOCKBEATS_DEVELOPMENT_MODE === 'true';

  return result;
}

/**
 * Logs environment validation results to console
 */
export function logEnvironmentStatus(): void {
  const validation = validateEnvironment();

  console.log('\n🔍 Environment Variables Status');
  console.log('================================');

  // Firebase Configuration
  console.log('\n🔥 Firebase Configuration:');
  console.log(`  API Key: ${validation.config.firebase.apiKey ? '✅' : '❌'}`);
  console.log(`  Auth Domain: ${validation.config.firebase.authDomain ? '✅' : '❌'}`);
  console.log(`  Project ID: ${validation.config.firebase.projectId ? '✅' : '❌'}`);
  console.log(`  Storage Bucket: ${validation.config.firebase.storageBucket ? '✅' : '❌'}`);
  console.log(`  Messaging Sender ID: ${validation.config.firebase.messagingSenderId ? '✅' : '❌'}`);
  console.log(`  App ID: ${validation.config.firebase.appId ? '✅' : '❌'}`);
  console.log(`  Measurement ID: ${validation.config.firebase.measurementId ? '✅' : '⚠️  (optional)'}`);

  // Analytics Configuration
  console.log('\n📊 Analytics Configuration:');
  console.log(`  Analytics Measurement ID: ${validation.config.analytics.measurementId ? '✅' : '⚠️  (optional)'}`);

  // App Configuration
  console.log('\n⚙️  App Configuration:');
  console.log(`  Development Mode: ${validation.config.app.developmentMode ? '✅' : '❌'}`);

  // Missing variables
  if (validation.missingVars.length > 0) {
    console.log('\n❌ Missing Required Variables:');
    validation.missingVars.forEach((varName) => {
      console.log(`  - ${varName}`);
    });
  }

  // Warnings
  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validation.warnings.forEach((warning) => {
      console.log(`  - ${warning}`);
    });
  }

  // Overall status
  console.log(`\n${validation.isValid ? '✅' : '❌'} Environment Status: ${validation.isValid ? 'Valid' : 'Invalid'}`);
  console.log('================================\n');
}

/**
 * Validates environment variables and throws error if invalid
 */
export function validateEnvironmentOrThrow(): void {
  const validation = validateEnvironment();
  
  if (!validation.isValid) {
    console.error('❌ Environment validation failed!');
    console.error('Missing required variables:', validation.missingVars);
    throw new Error(`Missing required environment variables: ${validation.missingVars.join(', ')}`);
  }
}
