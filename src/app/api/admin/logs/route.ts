import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCloudWatchLogs, getCloudWatchMetrics } from '@/lib/cloudwatch';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const logs = getCloudWatchLogs();
    const metrics = getCloudWatchMetrics();

    return NextResponse.json({
      logGroup: '/neighborhelp/app-logs',
      logs,
      metrics,
    });
  } catch (error: any) {
    console.error('Error fetching CloudWatch logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
