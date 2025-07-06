import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/prisma';

export async function GET(request: NextRequest, { params }: { params: { username: string, postId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;

    // Get post with comments
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
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
        directComments: {
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
          orderBy: {
            createdAt: 'desc',
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

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Add isLiked field
    const postWithLikeStatus = {
      ...post,
      isLiked: post.likes.some(like => like.userId === userId),
    };

    return NextResponse.json(postWithLikeStatus);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
