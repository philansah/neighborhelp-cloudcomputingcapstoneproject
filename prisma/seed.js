const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NeighborHelp database with Security Verification System...');

  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.postPhoto.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Super Admin / Platform Creator
  const creator = await prisma.user.create({
    data: {
      email: 'admin@neighborhelp.org',
      passwordHash,
      name: 'Application Creator (Super Admin)',
      role: 'SUPER_ADMIN',
      phone: '(555) 999-0000',
      locationNeighborhood: 'Platform Master',
      bio: 'NeighborHelp Master Application Creator & Security Admin.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      isVerified: true,
      verificationStatus: 'APPROVED',
    },
  });

  // 2. Verified Provider (Approved by Creator)
  const alex = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      passwordHash,
      name: 'Alex Rivera',
      role: 'PROVIDER',
      phone: '(555) 345-6789',
      locationNeighborhood: 'Maplewood Park',
      bio: 'Licensed plumber and general handyman with 10+ years experience in local repairs.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      skills: 'Plumbing,General Handyman,Drainage',
      isVerified: true,
      verificationStatus: 'APPROVED',
      verificationProofUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
      verificationSubmittedAt: new Date(),
    },
  });

  // 3. Pending Verification Provider (Awaiting Super Admin Approval)
  const maria = await prisma.user.create({
    data: {
      email: 'maria@example.com',
      passwordHash,
      name: 'Maria Santos',
      role: 'PROVIDER',
      phone: '(555) 456-7890',
      locationNeighborhood: 'Oakridge Heights',
      bio: 'Landscape enthusiast, lawn care specialist, and certified electrician.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      skills: 'Electrical,Yard Work,Cleaning',
      isVerified: false, // Awaiting Creator/Admin approval
      verificationStatus: 'PENDING',
      verificationProofUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      verificationSubmittedAt: new Date(),
    },
  });

  // 4. Residents
  const sarah = await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      passwordHash,
      name: 'Sarah Jenkins',
      role: 'RESIDENT',
      phone: '(555) 234-5678',
      locationNeighborhood: 'Maplewood Park',
      bio: 'Resident in Maplewood for 6 years. Love gardening and community organizing.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isVerified: true,
      verificationStatus: 'APPROVED',
    },
  });

  const david = await prisma.user.create({
    data: {
      email: 'david@example.com',
      passwordHash,
      name: 'David Miller',
      role: 'RESIDENT',
      phone: '(555) 876-5432',
      locationNeighborhood: 'Oakridge Heights',
      bio: 'Homeowner looking for trustworthy neighbors for small home repairs.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isVerified: false,
      verificationStatus: 'UNSUBMITTED',
    },
  });

  console.log('Created Users with Verification records.');

  // Posts
  const post1 = await prisma.post.create({
    data: {
      authorId: sarah.id,
      postType: 'NEED_HELP',
      title: 'Severely Blocked Kitchen Sink & Leaking Pipe',
      description: 'Our kitchen sink is completely backed up with standing water and water is slowly dripping into the lower cabinet under the basin. Needs immediate auger work and washer replacement.',
      skillCategory: 'Plumbing',
      locationNeighborhood: 'Maplewood Park',
      urgency: 'HIGH',
      status: 'OPEN',
      photos: {
        create: [
          { s3Url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800' },
        ],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: alex.id,
      postType: 'CAN_HELP',
      title: 'Emergency Plumbing & Sewer Snaking Services Available',
      description: 'Offering emergency plumbing repairs, water heater maintenance, and drain clearing for Maplewood & Oakridge neighbors.',
      skillCategory: 'Plumbing',
      locationNeighborhood: 'Maplewood Park',
      urgency: 'LOW',
      status: 'OPEN',
      photos: {
        create: [
          { s3Url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800' },
        ],
      },
    },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
