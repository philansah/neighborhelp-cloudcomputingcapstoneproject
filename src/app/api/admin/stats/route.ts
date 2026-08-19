import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getCloudWatchMetrics } from '@/lib/cloudwatch';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const [totalUsers, residentCount, providerCount, totalPosts, activeBookings, completedBookings] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'RESIDENT' } }),
      prisma.user.count({ where: { role: 'PROVIDER' } }),
      prisma.post.count(),
      prisma.booking.count({ where: { status: { in: ['PENDING', 'ACCEPTED'] } } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
    ]);

    const metrics = getCloudWatchMetrics();

    return NextResponse.json({
      stats: {
        totalUsers,
        residentCount,
        providerCount,
        totalPosts,
        activeBookings,
        completedBookings,
        cloudWatch: {
          logGroup: '/neighborhelp/app-logs',
          status: 'HEALTHY',
          metrics,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
