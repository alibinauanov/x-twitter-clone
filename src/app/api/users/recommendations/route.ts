import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/prisma';

// Helper function to ensure user exists in database
async function ensureUserExists(userId: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        throw new Error('User not found in Clerk');
      }

      await prisma.user.create({
        data: {
          id: userId,
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || `user_${userId.slice(0, 8)}`,
          displayName: clerkUser.firstName && clerkUser.lastName 
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.firstName || clerkUser.username || `User ${userId.slice(0, 8)}`,
          img: clerkUser.imageUrl,
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error);
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    await ensureUserExists(userId);

    // Get users the current user is already following
    const followingUsers = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = followingUsers.map(f => f.followingId);
    followingIds.push(userId); // Exclude current user

    // Get recommended users based on mutual follows and activity
    const recommendations = await prisma.user.findMany({
      where: {
        id: {
          notIn: followingIds,
        },
      },
      include: {
        _count: {
          select: {
            followers: true,
            posts: true,
          },
        },
        followers: {
          where: {
            followerId: {
              in: followingIds.filter(id => id !== userId), // Mutual connections
            },
          },
          select: {
            follower: {
              select: {
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          followers: {
            _count: 'desc',
          },
        },
        {
          posts: {
            _count: 'desc',
          },
        },
      ],
      take: 5,
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
