// Script to update environment variables for production
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate a random debug token if needed
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

// Main function
function updateEnvFile() {
  console.log('🔧 Updating environment variables for production...');
  
  // Paths
  const envPath = path.join(__dirname, '..', '.env');
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  
  try {
    // Check if .env exists
    if (!fs.existsSync(envPath)) {
      console.log('📝 Creating new .env file');
      fs.writeFileSync(envPath, '# Environment variables for production\n');
    }
    
    // Read existing .env contents
    let envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    const existingVars = {};
    
    // Parse existing variables
    envLines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        existingVars[key.trim()] = value ? value.trim() : '';
      }
    });
    
    // Add debug token if not exists
    if (!existingVars.DEBUG_AUTH_TOKEN) {
      const debugToken = generateToken();
      existingVars.DEBUG_AUTH_TOKEN = debugToken;
      console.log(`🔑 Added DEBUG_AUTH_TOKEN: ${debugToken}`);
    } else {
      console.log(`🔑 Using existing DEBUG_AUTH_TOKEN: ${existingVars.DEBUG_AUTH_TOKEN}`);
    }
    
    // Fix DATABASE_URL if it's using Prisma Accelerate without directUrl
    if (existingVars.DATABASE_URL && existingVars.DATABASE_URL.startsWith('prisma+postgres://') && !existingVars.DIRECT_URL) {
      console.log('⚠️ Detected Prisma Accelerate URL without DIRECT_URL configuration');
      
      // Extract the actual connection details from DATABASE_URL if possible
      const accelerateUrl = existingVars.DATABASE_URL;
      console.log(`🔍 Current DATABASE_URL: ${accelerateUrl.replace(/:([^:@]+)@/, ':***@')}`);
      
      // Prompt or use environment variables to set the direct URL
      if (process.env.POSTGRES_URL || process.env.DIRECT_POSTGRES_URL) {
        const directUrl = process.env.DIRECT_POSTGRES_URL || process.env.POSTGRES_URL;
        existingVars.DIRECT_URL = directUrl;
        console.log(`✅ Added DIRECT_URL from environment variables`);
      } else {
        console.log(`❌ Missing DIRECT_URL - you need to add this manually in your .env file`);
        console.log(`Example: DIRECT_URL=postgresql://username:password@hostname:port/database`);
      }
    }
    
    // Generate new .env content
    let newEnvContent = '# Environment variables for production\n';
    for (const [key, value] of Object.entries(existingVars)) {
      newEnvContent += `${key}=${value}\n`;
    }
    
    // Write back to .env
    fs.writeFileSync(envPath, newEnvContent);
    console.log('✅ Updated .env file');
    
    // Copy to .env.local if it doesn't exist and we're in development
    if (process.env.NODE_ENV !== 'production' && !fs.existsSync(envLocalPath)) {
      fs.writeFileSync(envLocalPath, newEnvContent);
      console.log('📋 Created .env.local for development');
    }
    
    return {
      success: true,
      debugToken: existingVars.DEBUG_AUTH_TOKEN,
    };
  } catch (error) {
    console.error('❌ Error updating environment variables:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run if called directly
if (require.main === module) {
  const result = updateEnvFile();
  console.log('\n🚀 Environment setup complete!');
  console.log('---------------------------------');
  console.log(`Debug URL: https://your-domain.com/api/debug/prisma`);
  console.log(`Debug Token: ${result.debugToken}`);
  console.log('\nUsage with curl:');
  console.log(`curl -H "Authorization: Bearer ${result.debugToken}" https://your-domain.com/api/debug/prisma`);
  console.log('---------------------------------');
}

module.exports = updateEnvFile; 