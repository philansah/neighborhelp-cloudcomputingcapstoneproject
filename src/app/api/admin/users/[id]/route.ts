import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logCloudWatch } from '@/lib/cloudwatch';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { isVerified, role } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(typeof isVerified === 'boolean' && { isVerified }),
        ...(role && { role: role.toUpperCase() }),
      },
    });

    logCloudWatch('UserVerificationToggled', {
      targetUserId: id,
      isVerified: updatedUser.isVerified,
      role: updatedUser.role,
      adminId: currentUser.id,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
