// Simple script to check database connection
const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  console.log('🔍 Checking database connection...');
  
  // Create Prisma client
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    // Print environment info
    console.log('Environment variables:');
    console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'Set (starts with ' + process.env.DATABASE_URL.slice(0, 15) + '...)' : 'Not set'}`);
    console.log(`- DIRECT_URL: ${process.env.DIRECT_URL ? 'Set (starts with ' + process.env.DIRECT_URL.slice(0, 15) + '...)' : 'Not set'}`);
    
    // Test simple query
    console.log('\nTesting basic query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful:', result);
    
    // Count users
    console.log('\nCounting users...');
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    // Get sample users if any exist
    if (userCount > 0) {
      console.log('\nFetching sample users:');
      const users = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          email: true
        }
      });
      console.log(JSON.stringify(users, null, 2));
    }
    
    await prisma.$disconnect();
    console.log('\n✅ Database check complete - CONNECTION SUCCESSFUL');
    return true;
  } catch (error) {
    console.error('\n❌ DATABASE CONNECTION ERROR:', error);
    
    // Give advice based on error type
    if (error.message && error.message.includes('Error validating datasource')) {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Make sure you have both DATABASE_URL and DIRECT_URL set in your .env file');
      console.log('2. For Prisma Postgres, your URLs should be:');
      console.log('   DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"');
      console.log('   DIRECT_URL="postgres://database-pooler.prisma-data.net/?api_key=YOUR_API_KEY"');
      console.log('3. Add both variables to your Vercel environment variables');
    }
    
    await prisma.$disconnect();
    return false;
  }
}

// Run directly if not imported
if (require.main === module) {
  checkDatabase()
    .then(success => {
      console.log(`\nCheck ${success ? 'SUCCEEDED' : 'FAILED'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
}

module.exports = checkDatabase; 