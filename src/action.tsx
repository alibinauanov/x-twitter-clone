'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';
import { imagekit } from './utils';

// Helper function to ensure user exists in database
async function ensureUserExists(userId: string) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      // Get user data from Clerk
      const clerkUser = await currentUser();
      if (!clerkUser) {
        throw new Error('User not found in Clerk');
      }

      // Create user in database
      await prisma.user.create({
        data: {
          id: userId,
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || `user_${userId.slice(0, 8)}`,
          displayName:
            clerkUser.firstName && clerkUser.lastName
              ? `${clerkUser.firstName} ${clerkUser.lastName}`
              : clerkUser.firstName || clerkUser.username || `User ${userId.slice(0, 8)}`,
          img: clerkUser.imageUrl,
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    throw new Error('Failed to create user');
  }
}

// Create a new post
export async function createPost(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Ensure user exists in database
  await ensureUserExists(userId);

  const desc = formData.get('desc') as string;
  const file = formData.get('file') as File;

  if (!desc) {
    throw new Error('Post content is required');
  }

  let imgUrl = '';
  let videoUrl = '';

  // Handle file upload if present
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      type ImageKitUploadResponse = {
        url: string;
        // add other properties from the ImageKit upload response if needed
      };

      const result = await new Promise<ImageKitUploadResponse>((resolve, reject) => {
        imagekit.upload(
          {
            file: buffer,
            fileName: file.name,
            folder: '/posts',
          },
          function (error, result) {
            if (error) reject(error);
            else resolve(result as ImageKitUploadResponse);
          }
        );
      });

      if (file.type.includes('image')) {
        imgUrl = result.url;
      } else if (file.type.includes('video')) {
        videoUrl = result.url;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  try {
    await prisma.post.create({
      data: {
        desc,
        img: imgUrl || undefined,
        video: videoUrl || undefined,
        userId,
      },
    });

    revalidatePath('/');
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('Failed to create post');
  }
}

// Like/unlike a post
export async function toggleLike(postId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Ensure user exists in database
  await ensureUserExists(userId);

  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    // Get post owner info for notifications
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        displayName: true,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
    } else {
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });

      // Create notification for post owner (if not liking own post)
      if (post.user.id !== userId) {
        await prisma.notification.create({
          data: {
            type: 'like',
            message: `${currentUser?.displayName || currentUser?.username || 'Someone'} liked your post`,
            userId: post.user.id,
          },
        });
      }
    }

    revalidatePath('/');
  } catch (error) {
    console.error('Error toggling like:', error);
    throw new Error('Failed to toggle like');
  }
}

// Add a comment
export async function addComment(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Ensure user exists in database
  await ensureUserExists(userId);

  const desc = formData.get('desc') as string;
  const postId = parseInt(formData.get('postId') as string);

  if (!desc || !postId) {
    throw new Error('Comment and post ID are required');
  }

  try {
    // Get post owner info for notifications
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        displayName: true,
      },
    });

    await prisma.comment.create({
      data: {
        desc,
        postId,
        userId,
      },
    });

    // Create notification for post owner (if not commenting on own post)
    if (post.user.id !== userId) {
      await prisma.notification.create({
        data: {
          type: 'comment',
          message: `${currentUser?.displayName || currentUser?.username || 'Someone'} commented on your post`,
          userId: post.user.id,
        },
      });
    }

    revalidatePath('/');
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }
}

// Follow/unfollow a user
export async function toggleFollow(targetUserId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Ensure user exists in database
  await ensureUserExists(userId);

  if (userId === targetUserId) {
    throw new Error('Cannot follow yourself');
  }

  try {
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: userId,
        followingId: targetUserId,
      },
    });

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        displayName: true,
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });
    } else {
      await prisma.follow.create({
        data: {
          followerId: userId,
          followingId: targetUserId,
        },
      });

      // Create notification for followed user
      await prisma.notification.create({
        data: {
          type: 'follow',
          message: `${currentUser?.displayName || currentUser?.username || 'Someone'} started following you`,
          userId: targetUserId,
        },
      });
    }

    revalidatePath('/');
  } catch (error) {
    console.error('Error toggling follow:', error);
    throw new Error('Failed to toggle follow');
  }
}

// Legacy share action (keeping for compatibility)
export async function shareAction(formData: FormData) {
  return createPost(formData);
}