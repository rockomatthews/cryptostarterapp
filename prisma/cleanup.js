/**
 * A cleanup script to run before building to ensure a clean state
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting pre-build cleanup for PRODUCTION...');

// Ensure we're in production mode
process.env.NODE_ENV = 'production';
console.log(`✓ Set NODE_ENV=${process.env.NODE_ENV} for build process`);

// Clean up generated Prisma files
try {
  const generatedDir = path.join(__dirname, '..', 'src', 'generated', 'prisma');
  
  if (fs.existsSync(generatedDir)) {
    console.log('🗑️  Removing existing Prisma generated files...');
    execSync(`rm -rf ${generatedDir}`, { stdio: 'inherit' });
  }
  
  console.log('📁 Creating fresh Prisma output directory...');
  fs.mkdirSync(generatedDir, { recursive: true });
  
  // Force generation with node_modules paths
  console.log('🔄 Regenerating Prisma client with absolute paths...');
  
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  const prismaBinPath = path.join(nodeModulesPath, '.bin', 'prisma');
  
  execSync(`${prismaBinPath} generate --schema=${__dirname}/schema.prisma`, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_CLIENT_OUTPUT: generatedDir
    }
  });
  
  // Verify that Prisma client files were actually generated
  const prismaIndexFile = path.join(generatedDir, 'index.js');
  if (!fs.existsSync(prismaIndexFile)) {
    throw new Error('Prisma client was not properly generated. index.js is missing.');
  }
  
  console.log('✅ Successfully regenerated Prisma client!');
} catch (error) {
  console.error('❌ Error during Prisma client generation:', error);
  process.exit(1);
}

// Clean Next.js cache
try {
  const nextCacheDir = path.join(__dirname, '..', '.next');
  
  if (fs.existsSync(nextCacheDir)) {
    console.log('🗑️  Removing Next.js cache...');
    execSync(`rm -rf ${nextCacheDir}`, { stdio: 'inherit' });
  }
  
  console.log('✅ Successfully removed Next.js cache!');
} catch (error) {
  console.error('❌ Error removing Next.js cache:', error);
  // Don't exit - this is not critical
}

console.log('🎉 Pre-build cleanup completed successfully for PRODUCTION!'); 