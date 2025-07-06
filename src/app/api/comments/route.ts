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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    await ensureUserExists(userId);

    const body = await request.json();
    const { postId, desc } = body;

    if (!postId || !desc) {
      return NextResponse.json({ error: 'Post ID and description are required' }, { status: 400 });
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        desc: desc.trim(),
        userId,
        postId: parseInt(postId),
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
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
