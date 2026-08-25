import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { logCloudWatch } from '@/lib/cloudwatch';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role = 'RESIDENT', phone, locationNeighborhood, bio, skills } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required fields.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: role.toUpperCase(),
        phone: phone || null,
        locationNeighborhood: locationNeighborhood || 'Maplewood Park',
        bio: bio || null,
        skills: Array.isArray(skills) ? skills.join(',') : skills || null,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
      },
    });

    logCloudWatch('UserRegistered', { userId: user.id, email: user.email, role: user.role });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        locationNeighborhood: user.locationNeighborhood,
        avatarUrl: user.avatarUrl,
        skills: user.skills,
        isVerified: user.isVerified,
      },
    });

    const forwardedProto = request.headers.get('x-forwarded-proto');
    const isSecure = forwardedProto === 'https' || request.url.startsWith('https://');

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
