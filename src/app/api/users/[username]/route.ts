import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/prisma';

// Helper function to ensure user exists in database
async function ensureUserExists(userId: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId }
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    await ensureUserExists(userId);

    const { username } = await params;

    // Get user by username
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        posts: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                img: true,
              },
            },
            likes: {
              select: {
                userId: true,
              },
            },
            _count: {
              select: {
                likes: true,
                directComments: true,
                comments: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            followers: true,
            followings: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if current user is following this user
    const currentUserInDb = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUserInDb) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    const isFollowing = await prisma.follow.findFirst({
      where: {
        followerId: currentUserInDb.id,
        followingId: user.id,
      },
    });

    // Add isLiked field to posts
    const postsWithLikeStatus = user.posts.map(post => ({
      ...post,
      isLiked: post.likes.some(like => like.userId === currentUserInDb.id),
    }));

    const userWithFollowStatus = {
      ...user,
      posts: postsWithLikeStatus,
      isFollowing: !!isFollowing,
    };

    return NextResponse.json(userWithFollowStatus);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
