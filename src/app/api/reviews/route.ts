import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logCloudWatch } from '@/lib/cloudwatch';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, rating, comment } = body;

    if (!bookingId || !rating) {
      return NextResponse.json({ error: 'Booking ID and rating (1-5) are required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.review) {
      return NextResponse.json({ error: 'A review has already been submitted for this booking.' }, { status: 400 });
    }

    // Determine reviewee (if user is resident, reviewee is provider; if provider, reviewee is resident)
    const revieweeId = user.id === booking.residentId ? booking.providerId : booking.residentId;

    const review = await prisma.review.create({
      data: {
        bookingId,
        reviewerId: user.id,
        revieweeId,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        comment: comment || null,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true },
        },
        reviewee: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    logCloudWatch('ReviewSubmitted', {
      reviewId: review.id,
      bookingId,
      reviewerId: user.id,
      revieweeId,
      rating: review.rating,
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
