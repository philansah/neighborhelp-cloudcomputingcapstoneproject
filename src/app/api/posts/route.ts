import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logCloudWatch, incrementMetric } from '@/lib/cloudwatch';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const skillCategory = searchParams.get('skillCategory');
    const urgency = searchParams.get('urgency');
    const postType = searchParams.get('postType');
    const locationNeighborhood = searchParams.get('locationNeighborhood');
    const status = searchParams.get('status');
    const authorId = searchParams.get('authorId');

    const where: any = {};

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { locationNeighborhood: { contains: q } },
      ];
    }

    if (skillCategory && skillCategory !== 'ALL') {
      where.skillCategory = skillCategory;
    }

    if (urgency && urgency !== 'ALL') {
      where.urgency = urgency;
    }

    if (postType && postType !== 'ALL') {
      where.postType = postType;
    }

    if (locationNeighborhood && locationNeighborhood !== 'ALL') {
      where.locationNeighborhood = locationNeighborhood;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            locationNeighborhood: true,
            isVerified: true,
          },
        },
        photos: true,
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, skillCategory, locationNeighborhood, urgency = 'MEDIUM', postType = 'NEED_HELP', photos = [] } = body;

    if (!title || !description || !skillCategory) {
      return NextResponse.json(
        { error: 'Title, description, and skill category are required.' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        title,
        description,
        skillCategory,
        locationNeighborhood: locationNeighborhood || user.locationNeighborhood || 'Maplewood Park',
        urgency: urgency.toUpperCase(),
        postType: postType.toUpperCase(),
        status: 'OPEN',
        photos: {
          create: photos.map((url: string) => ({
            s3Url: url,
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        photos: true,
      },
    });

    logCloudWatch('PostCreated', {
      postId: post.id,
      authorId: user.id,
      skillCategory: post.skillCategory,
      urgency: post.urgency,
      postType: post.postType,
      photosCount: photos.length,
    });
    incrementMetric('PostCreationCount');

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
