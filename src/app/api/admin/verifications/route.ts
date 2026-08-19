import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden. Master Admin authorization required.' }, { status: 403 });
    }

    const pendingRequests = await prisma.user.findMany({
      where: {
        verificationStatus: { in: ['PENDING', 'APPROVED', 'REJECTED'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        locationNeighborhood: true,
        avatarUrl: true,
        skills: true,
        isVerified: true,
        verificationStatus: true,
        verificationProofUrl: true,
        verificationSubmittedAt: true,
      },
      orderBy: { verificationSubmittedAt: 'desc' },
    });

    return NextResponse.json({ requests: pendingRequests });
  } catch (error: any) {
    console.error('Error fetching verification requests:', error);
    return NextResponse.json({ error: 'Failed to fetch verification requests' }, { status: 500 });
  }
}
