// Test database connection script
const { PrismaClient } = require('../src/generated/prisma');

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Create a new PrismaClient instance
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    // Print the DATABASE_URL (with password redacted)
    const dbUrl = process.env.DATABASE_URL || 'Not set';
    console.log('📊 Database URL:', dbUrl.replace(/:([^:@]+)@/, ':***@'));
    
    // Attempt a simple query
    console.log('🔄 Attempting database query...');
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('✅ Database connection successful!', result);
    
    // Get some basic database stats
    console.log('📊 Checking database tables...');
    const userCount = await prisma.user.count();
    console.log(`Users in database: ${userCount}`);
    
    // Clean up
    await prisma.$disconnect();
    console.log('🔌 Connection closed.');
    
    return {
      success: true,
      message: 'Database connection successful',
      userCount,
    };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return {
      success: false,
      message: 'Database connection failed',
      error: error.message,
      stack: error.stack,
    };
  }
}

// Execute if run directly
if (require.main === module) {
  testConnection()
    .then(result => {
      console.log('Result:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
}

module.exports = testConnection; 