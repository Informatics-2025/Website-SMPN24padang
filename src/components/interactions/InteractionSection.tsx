import { fetchComments, countLikes, hasLiked } from '@/lib/actions/interactions';
import { CommentForm } from './CommentForm';
import { LikeButton } from './LikeButton';
import { CommentsList } from './CommentsList';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface InteractionSectionProps {
  contentType: 'news' | 'waste_news';
  contentId: string;
  pathname: string;
}

export async function InteractionSection({ contentType, contentId, pathname }: InteractionSectionProps) {
  const session = await auth();
  // For anonymous users, we need a stable ID. We can use a cookie or a fingerprint.
  // For simplicity, we'll rely on a client-side generated ID for now.
  // The `hasLiked` action will be called client-side for anonymous users.

  const [comments, likeCount, userHasLiked] = await Promise.all([
    fetchComments(contentType, contentId),
    countLikes(contentType, contentId),
    session?.user ? hasLiked(contentType, contentId, null) : Promise.resolve(false),
  ]);

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Interactions</h2>
      <div className="flex items-center gap-4 mb-6">
        <LikeButton
          contentType={contentType}
          contentId={contentId}
          pathname={pathname}
          initialLikeCount={likeCount}
          initialHasLiked={userHasLiked}
          isUserLoggedIn={!!session?.user}
        />
      </div>
      <hr className="my-6" />
      <div>
        <h3 className="text-xl font-bold mb-4">Comments ({comments.length})</h3>
        <CommentForm 
          contentType={contentType} 
          contentId={contentId} 
          pathname={pathname} 
          isUserLoggedIn={!!session?.user} 
        />
        <CommentsList comments={comments} />
      </div>
    </div>
  );
}