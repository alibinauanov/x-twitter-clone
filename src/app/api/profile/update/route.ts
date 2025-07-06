import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/prisma';
import { imagekit } from '@/utils';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const displayName = formData.get('displayName') as string;
    const bio = formData.get('bio') as string;
    const location = formData.get('location') as string;
    const website = formData.get('website') as string;
    const profileImage = formData.get('profileImage') as File;
    const coverImage = formData.get('coverImage') as File;

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Helper function to upload image to ImageKit
    const uploadImage = async (file: File, folder: string): Promise<string> => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const result = await imagekit.upload({
        file: buffer,
        fileName: `${folder}_${Date.now()}_${file.name}`,
        folder: `/twitter-clone/${folder}`,
      });
      
      return result.url;
    };

    // Upload images if provided
    let profileImageUrl = user.img;
    let coverImageUrl = user.cover;

    if (profileImage && profileImage.size > 0) {
      try {
        profileImageUrl = await uploadImage(profileImage, 'profile');
      } catch (error) {
        console.error('Error uploading profile image:', error);
        return NextResponse.json({ error: 'Failed to upload profile image' }, { status: 500 });
      }
    }

    if (coverImage && coverImage.size > 0) {
      try {
        coverImageUrl = await uploadImage(coverImage, 'cover');
      } catch (error) {
        console.error('Error uploading cover image:', error);
        return NextResponse.json({ error: 'Failed to upload cover image' }, { status: 500 });
      }
    }

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        displayName: displayName || user.displayName,
        bio: bio || null,
        location: location || null,
        website: website || null,
        img: profileImageUrl,
        cover: coverImageUrl,
      },
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
            likes: true,
            comments: {
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
            },
            _count: {
              select: {
                likes: true,
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
            posts: true,
            followers: true,
            followings: true,
          },
        },
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
