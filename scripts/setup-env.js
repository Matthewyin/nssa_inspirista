#!/usr/bin/env node

/**
 * Environment Setup Script
 * 环境设置脚本
 * 
 * Usage:
 * npm run env:dev    - Setup development environment
 * npm run env:prod   - Setup production environment
 */

const fs = require('fs');
const path = require('path');

const environments = {
  development: '.env.development',
  production: '.env.production'
};

function setupEnvironment(env) {
  const envFile = environments[env];
  
  if (!envFile) {
    console.error(`❌ Unknown environment: ${env}`);
    console.log('Available environments:', Object.keys(environments).join(', '));
    process.exit(1);
  }

  const sourcePath = path.join(process.cwd(), envFile);
  const targetPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Environment file not found: ${envFile}`);
    process.exit(1);
  }

  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Environment set to: ${env}`);
    console.log(`📁 Copied ${envFile} to .env`);
    
    // Read and display current configuration
    const envContent = fs.readFileSync(targetPath, 'utf8');
    const projectId = envContent.match(/NEXT_PUBLIC_FIREBASE_PROJECT_ID=(.+)/)?.[1];
    const appEnv = envContent.match(/NEXT_PUBLIC_APP_ENV=(.+)/)?.[1];
    
    console.log(`🔧 Firebase Project: ${projectId || 'Not set'}`);
    console.log(`🌍 App Environment: ${appEnv || 'Not set'}`);
    
    if (env === 'production' && projectId === 'n8n-project-460516') {
      console.warn('⚠️  WARNING: Production environment is using development Firebase project!');
      console.warn('   Please create a separate Firebase project for production.');
    }
    
  } catch (error) {
    console.error(`❌ Failed to setup environment: ${error.message}`);
    process.exit(1);
  }
}

// Get environment from command line argument
const env = process.argv[2];

if (!env) {
  console.log('🔧 Environment Setup Script');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/setup-env.js development');
  console.log('  node scripts/setup-env.js production');
  console.log('');
  console.log('Or use npm scripts:');
  console.log('  npm run env:dev');
  console.log('  npm run env:prod');
  process.exit(1);
}

setupEnvironment(env);
