import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logCloudWatch } from '@/lib/cloudwatch';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get bookings as Resident OR Provider
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { residentId: user.id },
          { providerId: user.id },
        ],
      },
      include: {
        post: {
          include: {
            photos: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            skills: true,
            isVerified: true,
          },
        },
        resident: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login to apply.' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, proposedTime, message } = body;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId === user.id) {
      return NextResponse.json({ error: 'You cannot apply to your own help request.' }, { status: 400 });
    }

    // Check if provider has already applied
    const existingBooking = await prisma.booking.findFirst({
      where: {
        postId,
        providerId: user.id,
      },
    });

    if (existingBooking) {
      return NextResponse.json({ error: 'You have already submitted an application for this request.' }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        postId,
        providerId: user.id,
        residentId: post.authorId,
        proposedTime: proposedTime || 'Flexible',
        message: message || '',
        status: 'PENDING',
      },
      include: {
        post: true,
        provider: {
          select: { id: true, name: true, avatarUrl: true, isVerified: true },
        },
      },
    });

    logCloudWatch('JobApplicationSubmitted', {
      bookingId: booking.id,
      postId,
      providerId: user.id,
      residentId: post.authorId,
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
