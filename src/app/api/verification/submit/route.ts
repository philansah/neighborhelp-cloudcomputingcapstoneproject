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
    const { proofUrl, tradeLicense, notes } = body;

    if (!proofUrl) {
      return NextResponse.json({ error: 'Verification proof document image is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationProofUrl: proofUrl,
        verificationStatus: 'PENDING',
        verificationSubmittedAt: new Date(),
        ...(notes && { bio: `${user.bio || ''}\n[Trade License / Proof Notes: ${notes}]` }),
      },
    });

    logCloudWatch('VerificationProofSubmitted', {
      userId: user.id,
      email: user.email,
      proofUrl,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Verification proof submitted successfully. Creator/Super Admin will review your document.',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Verification submission error:', error);
    return NextResponse.json({ error: 'Failed to submit verification' }, { status: 500 });
  }
}
