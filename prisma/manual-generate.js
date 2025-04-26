// A script that runs Prisma generation with direct control
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Ensure the output directory exists
  const outputDir = path.join(__dirname, '..', 'src', 'generated', 'prisma');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('📁 Output directory verified:', outputDir);
  
  // Generate Prisma client
  console.log('🚀 Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production' // Force production mode
    }
  });
  
  console.log('✅ Prisma client generation completed!');
  
  // Verify the generated files
  const indexFile = path.join(outputDir, 'index.js');
  if (fs.existsSync(indexFile)) {
    console.log('✓ Client files generated successfully.');
  } else {
    console.error('✗ Client files not found at expected location.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error during Prisma client generation:', error);
  process.exit(1);
} 