import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    await ensureUserExists(userId);

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '10');

    const posts = await prisma.post.findMany({
      take: limit + 1, // Get one extra to determine if there's a next page
      cursor: cursor ? { id: parseInt(cursor) } : undefined,
      skip: cursor ? 1 : 0, // Skip the cursor item
      orderBy: {
        createdAt: 'desc',
      },
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
    });

    const hasNextPage = posts.length > limit;
    const items = hasNextPage ? posts.slice(0, -1) : posts;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    // Add isLiked field for current user
    const postsWithLikeStatus = items.map(post => ({
      ...post,
      isLiked: post.likes.some(like => like.userId === userId),
    }));

    return NextResponse.json({
      items: postsWithLikeStatus,
      nextCursor,
      hasNextPage,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
