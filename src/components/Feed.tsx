'use client';

import { useInfinitePosts } from '@/hooks/usePosts';
import Post from './Post';
import { useEffect, useRef } from 'react';

const Feed = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfinitePosts();

  const observerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-iconBlue"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500">Error loading posts. Please try again.</div>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      
      {/* Loading indicator for infinite scroll */}
      <div ref={observerRef} className="flex justify-center p-4">
        {isFetchingNextPage && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-iconBlue"></div>
        )}
        {!hasNextPage && posts.length > 0 && (
          <div className="text-textGray text-sm">No more posts to load</div>
        )}
      </div>
      
      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-2xl mb-2">👋</div>
          <div className="text-lg font-semibold mb-1">Welcome to X!</div>
          <div className="text-textGray">Start by creating your first post or following someone.</div>
        </div>
      )}
    </div>
  );
};

export default Feed;