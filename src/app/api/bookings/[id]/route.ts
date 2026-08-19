import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logCloudWatch, incrementMetric } from '@/lib/cloudwatch';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { post: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Must be post resident (owner), provider, or admin to modify
    const isResident = booking.residentId === user.id;
    const isProvider = booking.providerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isResident && !isProvider && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    const normalizedStatus = status?.toUpperCase();

    if (normalizedStatus === 'ACCEPTED') {
      // 1. Mark this booking ACCEPTED
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      });

      // 2. Reject other pending applications for this post
      await prisma.booking.updateMany({
        where: {
          postId: booking.postId,
          id: { not: id },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      // 3. Mark post as IN_PROGRESS
      await prisma.post.update({
        where: { id: booking.postId },
        data: { status: 'IN_PROGRESS' },
      });

      logCloudWatch('BookingAccepted', {
        bookingId: id,
        postId: booking.postId,
        acceptedBy: user.id,
        providerId: booking.providerId,
      });
      incrementMetric('ActiveBookingsCount');

      return NextResponse.json({ success: true, booking: updatedBooking });
    }

    if (normalizedStatus === 'COMPLETED') {
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });

      await prisma.post.update({
        where: { id: booking.postId },
        data: { status: 'COMPLETED' },
      });

      logCloudWatch('BookingCompleted', {
        bookingId: id,
        postId: booking.postId,
        completedBy: user.id,
      });

      return NextResponse.json({ success: true, booking: updatedBooking });
    }

    if (normalizedStatus === 'REJECTED' || normalizedStatus === 'CANCELLED') {
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status: normalizedStatus },
      });

      logCloudWatch(`Booking${normalizedStatus}`, {
        bookingId: id,
        postId: booking.postId,
        updatedBy: user.id,
      });

      return NextResponse.json({ success: true, booking: updatedBooking });
    }

    return NextResponse.json({ error: 'Invalid booking status' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
