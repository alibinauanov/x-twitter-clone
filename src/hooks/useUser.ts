import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleFollow } from '@/action';
import { Post } from './usePosts';

// Types
export interface User {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  location?: string;
  job?: string;
  website?: string;
  img?: string;
  cover?: string;
  createdAt: string;
  _count: {
    followers: number;
    followings: number;
    posts: number;
  };
  isFollowing: boolean;
  followers?: {
    follower: {
      username: string;
      displayName?: string;
    };
  }[];
}

export interface PostWithComments {
  id: number;
  desc: string;
  img?: string;
  video?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    img?: string;
  };
  directComments: {
    id: string;
    desc: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      displayName: string;
      img?: string;
    };
  }[];
  _count: {
    likes: number;
    directComments: number;
    comments: number;
  };
  isLiked: boolean;
}

// Fetch user profile
export function useUser(username: string) {
  return useQuery<User & { posts: Post[] }>({
    queryKey: ['user', username],
    queryFn: async () => {
      const response = await fetch(`/api/users/${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    enabled: !!username,
  });
}

// Fetch single post with comments
export function usePost(postId: string) {
  return useQuery<PostWithComments>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      return response.json();
    },
    enabled: !!postId,
  });
}

// Fetch user recommendations
export function useRecommendations() {
  return useQuery<User[]>({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/users/recommendations');
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      return response.json();
    },
  });
}

// Follow/unfollow mutation
export function useFollowMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleFollow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
