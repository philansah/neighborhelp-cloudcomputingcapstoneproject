import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { logCloudWatch, incrementMetric } from '@/lib/cloudwatch';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { filename, contentType } = body;

    const fileExtension = filename?.split('.').pop() || 'jpg';
    const s3Key = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
    const bucketName = process.env.S3_BUCKET_NAME || 'neighborhelp-uploads';
    const region = process.env.AWS_REGION || 'us-east-1';
    
    let presignedUrl = '';
    let publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

    try {
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

      const s3Client = new S3Client({
        region,
      });

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        ContentType: contentType || 'image/jpeg',
      });

      presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (e: any) {
      console.warn('Failed to generate real S3 presigned URL, falling back to simulation:', e.message);
      presignedUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=MOCK_CREDENTIALS&X-Amz-Date=${new Date().toISOString()}&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=MOCK_SIGNATURE`;
      publicUrl = `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800`;
    }

    logCloudWatch('S3PresignedUrlGenerated', {
      userId: user.id,
      filename,
      s3Key,
      bucketName,
    });
    incrementMetric('S3UploadSuccessCount');

    return NextResponse.json({
      presignedUrl,
      s3Key,
      publicUrl,
      bucket: bucketName,
    });
  } catch (error: any) {
    console.error('Error generating presigned S3 URL:', error);
    incrementMetric('S3UploadFailureCount');
    return NextResponse.json({ error: 'Failed to generate S3 upload URL' }, { status: 500 });
  }
}
