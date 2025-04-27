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
    
    // Also make sure the default Prisma client location exists for compatibility
    const defaultPrismaDir = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
    if (!fs.existsSync(defaultPrismaDir)) {
      fs.mkdirSync(defaultPrismaDir, { recursive: true });
      console.log('📁 Created default Prisma client directory for compatibility.');
      
      // Copy key files to ensure compatibility with libraries expecting default location
      const defaultDir = path.join(defaultPrismaDir, 'default');
      if (!fs.existsSync(defaultDir)) {
        fs.mkdirSync(defaultDir, { recursive: true });
      }
      
      // Create a simple index.js file
      fs.writeFileSync(
        path.join(defaultDir, 'index.js'),
        `// Compatibility file - redirects to our custom location\nmodule.exports = require('../../../../src/generated/prisma');\n`
      );
      console.log('✓ Created compatibility files for default Prisma client location.');
    }
  } else {
    console.error('✗ Client files not found at expected location.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error during Prisma client generation:', error);
  process.exit(1);
} 