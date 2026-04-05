import { env } from './config/env';
import { prisma } from './config/prisma';
import app from './app';

const start = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    const server = app.listen(env.PORT, env.HOST, () => {
      console.log(`🚀 Server running at http://${env.HOST}:${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`📊 Health check: http://${env.HOST}:${env.PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('💤 Server and DB connection closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
