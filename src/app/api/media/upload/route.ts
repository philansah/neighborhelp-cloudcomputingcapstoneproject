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

    // Save to public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${filename}`;

    logCloudWatch('PhotoUploadedLocal', {
      userId: user.id,
      filename: file.name,
      sizeBytes: file.size,
      publicUrl,
    });
    incrementMetric('S3UploadSuccessCount');

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('File upload error:', error);
    incrementMetric('S3UploadFailureCount');
    return NextResponse.json({ error: 'Failed to process photo upload' }, { status: 500 });
  }
}
