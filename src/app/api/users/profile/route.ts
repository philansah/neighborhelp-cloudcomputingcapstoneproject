import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logCloudWatch } from '@/lib/cloudwatch';

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, locationNeighborhood, bio, avatarUrl, skills } = body;

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(locationNeighborhood && { locationNeighborhood }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatarUrl }),
        ...(skills !== undefined && { skills: Array.isArray(skills) ? skills.join(',') : skills }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        locationNeighborhood: true,
        bio: true,
        avatarUrl: true,
        skills: true,
        isVerified: true,
      },
    });

    logCloudWatch('UserProfileUpdated', { userId: currentUser.id });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
