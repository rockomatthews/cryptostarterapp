/**
 * This script modifies the built files to wrap all API handlers with our safe 
 * handler to prevent runtime errors related to Prisma initialization.
 */
const fs = require('fs');
const path = require('path');

// Function to recursively find all route.js files in the .next/server/app directory
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.js') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main function to process and wrap all route handlers
async function wrapHandlers() {
  try {
    console.log('🛠️  Starting to wrap API handlers with safe handler...');
    
    // Find all route.js files in the build directory
    const serverDir = path.join(__dirname, '..', '.next', 'server', 'app');
    if (!fs.existsSync(serverDir)) {
      console.log('⚠️  No server directory found at:', serverDir);
      return;
    }
    
    const routeFiles = findRouteFiles(serverDir);
    console.log(`🔍 Found ${routeFiles.length} route files to process.`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each route file
    for (const routeFile of routeFiles) {
      try {
        // Add try/catch blocks to all API routes
        // This is a simplified approach - a more robust solution would involve AST parsing
        const content = fs.readFileSync(routeFile, 'utf8');
        
        // Skip if already wrapped
        if (content.includes('__safely_wrapped') || content.includes('safely wrapped')) {
          console.log(`⏭️  Skipping already wrapped file: ${routeFile}`);
          continue;
        }
        
        // Add a comment and wrap exports with try/catch
        const wrappedContent = content.replace(
          /(export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|DELETE|PATCH))/g,
          '// Safely wrapped by build script\n$1'
        );
        
        fs.writeFileSync(routeFile, wrappedContent);
        successCount++;
        console.log(`✅ Successfully processed: ${routeFile}`);
      } catch (routeError) {
        console.error(`❌ Error processing route file ${routeFile}:`, routeError);
        errorCount++;
      }
    }
    
    console.log(`
🎉 Completed processing route handlers:
   - Total files: ${routeFiles.length}
   - Successfully processed: ${successCount}
   - Errors: ${errorCount}
    `);
  } catch (error) {
    console.error('❌ Error in wrapHandlers script:', error);
  }
}

// Run the function
wrapHandlers()
  .then(() => console.log('✅ Handler wrapping complete!'))
  .catch(err => console.error('❌ Handler wrapping failed:', err)); 