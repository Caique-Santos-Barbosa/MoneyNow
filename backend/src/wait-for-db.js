import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const maxRetries = 30; // 30 tentativas = 60 segundos
let retries = 0;

async function waitForDatabase() {
  console.log('🔍 Checking database connection...');
  console.log(`📊 Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
  
  while (retries < maxRetries) {
    try {
      // Tentar conectar ao banco
      await prisma.$connect();
      console.log('✅ Database connection successful!');
      await prisma.$disconnect();
      return true;
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        console.error('❌ Failed to connect to database after', maxRetries, 'attempts');
        console.error('Error:', error.message);
        await prisma.$disconnect().catch(() => {});
        process.exit(1);
      }
      console.log(`⏳ Waiting for database... (attempt ${retries}/${maxRetries})`);
      if (error.message) {
        console.log(`   Error: ${error.message.substring(0, 100)}`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2 segundos
    }
  }
}

waitForDatabase()
  .then(() => {
    console.log('🚀 Database is ready!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error waiting for database:', error);
    process.exit(1);
  });

