'use client';

import { useOptimistic, useState, useTransition, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addLike, hasLiked } from '@/lib/actions/interactions';
import { v4 as uuidv4 } from 'uuid';

interface LikeButtonProps {
  contentType: string;
  contentId: string;
  pathname: string;
  initialLikeCount: number;
  initialHasLiked: boolean;
  isUserLoggedIn: boolean;
}

const getAnonymousId = () => {
    if (typeof window === 'undefined') return null;
    let anonId = localStorage.getItem('anonymousId');
    if (!anonId) {
        anonId = uuidv4();
        localStorage.setItem('anonymousId', anonId);
    }
    return anonId;
};

export function LikeButton({
  contentType,
  contentId,
  pathname,
  initialLikeCount,
  initialHasLiked,
  isUserLoggedIn,
}: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  
  // This state will hold the "true" state, whether from server props or client-side fetch.
  const [finalState, setFinalState] = useState({
    count: initialLikeCount,
    liked: initialHasLiked,
  });

  // This single effect syncs the component with its true state
  useEffect(() => {
    if (isUserLoggedIn) {
        // For logged-in users, props from the server are the source of truth.
        setFinalState({ count: initialLikeCount, liked: initialHasLiked });
    } else {
        // For anonymous users, props have the right count, but we need to fetch the 'liked' status from the client.
        const anonymousId = getAnonymousId();
        hasLiked(contentType, contentId, anonymousId).then(serverLiked => {
            setFinalState({ count: initialLikeCount, liked: serverLiked });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLikeCount, initialHasLiked, isUserLoggedIn, contentType, contentId]);

  // Optimistic state is layered on top of our final, corrected state.
  const [optimisticState, toggleOptimisticState] = useOptimistic(
    finalState,
    (state) => {
      const newLiked = !state.liked;
      const newCount = newLiked ? state.count + 1 : state.count - 1;
      return { count: newCount, liked: newLiked };
    }
  );

  const handleLike = async () => {
    const anonymousId = isUserLoggedIn ? null : getAnonymousId();
    startTransition(async () => {
      toggleOptimisticState(null);
      await addLike(contentType, contentId, pathname, anonymousId);
    });
  };

  return (
    <Button onClick={handleLike} variant="outline" disabled={isPending}>
      <Heart className={`mr-2 h-4 w-4 ${optimisticState.liked ? 'fill-red-500 text-red-500' : ''}`} />
      {optimisticState.count} {optimisticState.count === 1 ? 'Like' : 'Likes'}
    </Button>
  );
}