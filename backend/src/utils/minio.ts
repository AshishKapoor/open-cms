import * as Minio from 'minio';
import * as path from 'path';
import { config } from './config';
import { Readable } from 'stream';

// Initialize MinIO client
export const minioClient = new Minio.Client({
  endPoint: config.MINIO_ENDPOINT,
  port: config.MINIO_PORT,
  useSSL: config.MINIO_USE_SSL,
  accessKey: config.MINIO_ACCESS_KEY,
  secretKey: config.MINIO_SECRET_KEY,
});

/**
 * Ensure the bucket exists, create it if it doesn't
 */
export const ensureBucketExists = async (): Promise<void> => {
  try {
    const bucketExists = await minioClient.bucketExists(config.MINIO_BUCKET);

    if (!bucketExists) {
      await minioClient.makeBucket(config.MINIO_BUCKET, 'us-east-1');
      console.log(`Bucket '${config.MINIO_BUCKET}' created successfully`);

      // Set bucket policy to allow public read access to images
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${config.MINIO_BUCKET}/*`],
          },
        ],
      };

      await minioClient.setBucketPolicy(
        config.MINIO_BUCKET,
        JSON.stringify(policy)
      );
      console.log(`Bucket policy set for '${config.MINIO_BUCKET}'`);
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
};

/**
 * Upload a file to MinIO
 * @param file - The file buffer to upload
 * @param originalName - Original filename
 * @param mimetype - File MIME type
 * @returns The public URL of the uploaded file
 */
export const uploadFile = async (
  file: Buffer,
  originalName: string,
  mimetype: string
): Promise<string> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName).toLowerCase() || '';
    
    // Validate that the file has an extension
    if (!extension) {
      throw new Error('File must have a valid extension');
    }
    
    const fileName = `${timestamp}-${randomString}${extension}`;

    // Convert buffer to stream
    const stream = Readable.from(file);

    // Upload to MinIO
    await minioClient.putObject(
      config.MINIO_BUCKET,
      fileName,
      stream,
      file.length,
      {
        'Content-Type': mimetype,
      }
    );

    // Generate public URL using external endpoint for client access
    const protocol = config.MINIO_USE_SSL ? 'https' : 'http';
    const publicUrl = `${protocol}://${config.MINIO_EXTERNAL_ENDPOINT}:${config.MINIO_EXTERNAL_PORT}/${config.MINIO_BUCKET}/${fileName}`;

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw error;
  }
};

/**
 * Delete a file from MinIO
 * @param fileName - The name of the file to delete
 */
export const deleteFile = async (fileName: string): Promise<void> => {
  try {
    await minioClient.removeObject(config.MINIO_BUCKET, fileName);
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    throw error;
  }
};

/**
 * Get a presigned URL for temporary access to a file
 * @param fileName - The name of the file
 * @param expirySeconds - How long the URL should be valid (default: 24 hours)
 * @returns The presigned URL
 */
export const getPresignedUrl = async (
  fileName: string,
  expirySeconds: number = 86400
): Promise<string> => {
  try {
    const url = await minioClient.presignedGetObject(
      config.MINIO_BUCKET,
      fileName,
      expirySeconds
    );
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};
