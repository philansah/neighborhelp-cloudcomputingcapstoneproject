import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        locationNeighborhood: true,
        bio: true,
        avatarUrl: true,
        skills: true,
        isVerified: true,
        createdAt: true,
        reviewsReceived: {
          include: {
            reviewer: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate average rating
    const totalRating = user.reviewsReceived.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = user.reviewsReceived.length > 0
      ? (totalRating / user.reviewsReceived.length).toFixed(1)
      : null;

    return NextResponse.json({
      user: {
        ...user,
        averageRating,
        reviewsCount: user.reviewsReceived.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}
