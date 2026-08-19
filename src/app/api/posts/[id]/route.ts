import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logCloudWatch } from '@/lib/cloudwatch';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            locationNeighborhood: true,
            avatarUrl: true,
            skills: true,
            isVerified: true,
            createdAt: true,
          },
        },
        photos: true,
        bookings: {
          include: {
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
                avatarUrl: true,
              },
            },
            review: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Filter sensitive info if user is not author or admin
    const isOwner = user?.id === post.authorId;
    const isAdmin = user?.role === 'ADMIN';

    // If visitor, don't show full applicant contact list unless they are owner/admin or the provider who applied
    let filteredBookings = post.bookings;
    if (!isOwner && !isAdmin && user) {
      filteredBookings = post.bookings.filter(b => b.providerId === user.id);
    } else if (!isOwner && !isAdmin && !user) {
      filteredBookings = [];
    }

    return NextResponse.json({
      post: {
        ...post,
        bookings: filteredBookings,
      },
    });
  } catch (error: any) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

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

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, skillCategory, locationNeighborhood, urgency, status } = body;

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(skillCategory && { skillCategory }),
        ...(locationNeighborhood && { locationNeighborhood }),
        ...(urgency && { urgency: urgency.toUpperCase() }),
        ...(status && { status: status.toUpperCase() }),
      },
      include: {
        author: true,
        photos: true,
      },
    });

    logCloudWatch('PostUpdated', { postId: id, userId: user.id, status: updatedPost.status });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });

    logCloudWatch('PostDeleted', { postId: id, deletedBy: user.id, role: user.role });

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
