import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleLike, toggleFollow } from '@/action';

// Types
export interface Post {
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
  _count: {
    likes: number;
    directComments: number;
    comments: number;
  };
  isLiked: boolean;
}

export interface PostsResponse {
  items: Post[];
  nextCursor: number | null;
  hasNextPage: boolean;
}

// Fetch posts with infinite scrolling
export function useInfinitePosts() {
  return useInfiniteQuery<PostsResponse>({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = null }) => {
      const url = new URL('/api/posts', window.location.origin);
      if (pageParam) url.searchParams.set('cursor', pageParam.toString());
      url.searchParams.set('limit', '10');
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  });
}

// Like/unlike mutation with optimistic updates
export function useLikeMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleLike,
    onMutate: async (postId: number) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update the cache
      queryClient.setQueryData(['posts'], (old: import('@tanstack/react-query').InfiniteData<PostsResponse> | undefined) => {
        if (!old?.pages) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: PostsResponse) => ({
            ...page,
            items: page.items.map((post: Post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  isLiked: !post.isLiked,
                  _count: {
                    ...post._count,
                    likes: post.isLiked ? post._count.likes - 1 : post._count.likes + 1,
                  },
                };
              }
              return post;
            }),
          })),
        };
      });

      return { previousPosts };
    },
    onError: (err, postId, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Follow/unfollow mutation
export function useFollowMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleFollow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
