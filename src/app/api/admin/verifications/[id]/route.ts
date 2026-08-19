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

    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden. Creator/Super Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body; // 'APPROVE' or 'REJECT'

    const isApproved = action === 'APPROVE';

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isVerified: isApproved,
        verificationStatus: isApproved ? 'APPROVED' : 'REJECTED',
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        verificationStatus: true,
      },
    });

    logCloudWatch('VerificationDecisionMade', {
      targetUserId: id,
      targetEmail: updatedUser.email,
      decision: isApproved ? 'APPROVED' : 'REJECTED',
      decidedBy: currentUser.id,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${updatedUser.name} verification status set to ${updatedUser.verificationStatus}`,
    });
  } catch (error: any) {
    console.error('Error deciding verification:', error);
    return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 });
  }
}
