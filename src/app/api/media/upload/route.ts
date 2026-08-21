import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { logCloudWatch, incrementMetric } from '@/lib/cloudwatch';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const s3Key = `uploads/${filename}`;
    const bucketName = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'us-east-1';

    let publicUrl = `/uploads/${filename}`;
    let uploadedToS3 = false;

    if (bucketName) {
      try {
        const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
        const s3Client = new S3Client({ region });
        
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            Body: buffer,
            ContentType: file.type || 'image/jpeg',
          })
        );
        
        publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
        uploadedToS3 = true;
        
        logCloudWatch('PhotoUploadedS3', {
          userId: user.id,
          filename: file.name,
          sizeBytes: file.size,
          s3Key,
          bucketName,
          publicUrl,
        });
      } catch (s3Error: any) {
        console.warn('Failed to upload to S3, falling back to local storage:', s3Error.message);
      }
    }

    if (!uploadedToS3) {
      // Save to public/uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      logCloudWatch('PhotoUploadedLocal', {
        userId: user.id,
        filename: file.name,
        sizeBytes: file.size,
        publicUrl,
      });
    }

    incrementMetric('S3UploadSuccessCount');

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('File upload error:', error);
    incrementMetric('S3UploadFailureCount');
    return NextResponse.json({ error: 'Failed to process photo upload' }, { status: 500 });
  }
}
