import app from './app';
import { config } from './utils/config';
import { ensureBucketExists } from './utils/minio';

// Initialize MinIO bucket and start server
ensureBucketExists()
  .then(() => {
    console.log('✅ MinIO bucket initialized successfully');
    
    const server = app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`📚 API Documentation: http://localhost:${config.PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${config.PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize MinIO bucket:', error);
    process.exit(1);
  });
