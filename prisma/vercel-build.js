const { execSync } = require('child_process');

// This script is run during Vercel build to ensure Prisma Client is properly generated
try {
  console.log('🚀 Running Prisma generate for Vercel deployment...');
  
  // Force a new Prisma Client generation with --no-engine flag for production
  execSync('npx prisma generate --no-engine', { stdio: 'inherit' });
  
  console.log('✅ Prisma Client generated successfully!');
} catch (error) {
  console.error('❌ Failed to generate Prisma Client:', error);
  process.exit(1);
} 