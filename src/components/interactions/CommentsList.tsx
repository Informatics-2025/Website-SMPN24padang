import Image from 'next/image';
import { type fetchComments } from '@/lib/actions/interactions';

// Infer the type from the return value of the action
type Comments = Awaited<ReturnType<typeof fetchComments>>;

interface CommentsListProps {
  comments: Comments;
}

export function CommentsList({ comments }: CommentsListProps) {
  if (comments.length === 0) {
    return <p className="text-muted-foreground">No comments yet.</p>;
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start gap-4">
          <div className="relative h-10 w-10 flex-shrink-0">
            {comment.user?.image ? (
              <Image
                src={comment.user.image}
                alt={comment.user.name || 'User avatar'}
                fill
                className="rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold">
                {(comment.user?.name || comment.authorName)?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold">{comment.user?.name || comment.authorName || 'Anonymous'}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <p>{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}