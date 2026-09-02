'use client';

import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { createComment } from '@/lib/actions/interactions';

interface CommentFormProps {
  contentType: string;
  contentId: string;
  pathname: string;
  isUserLoggedIn: boolean;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit Comment'}
    </Button>
  );
}

export function CommentForm({ contentType, contentId, pathname, isUserLoggedIn }: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  // This client-side action wrapper is used just to reset the form after submission.
  const clientAction = async (formData: FormData) => {
    await createComment(formData);
    formRef.current?.reset();
  };

  return (
    <form ref={formRef} action={clientAction} className="space-y-4 mb-6">
      {!isUserLoggedIn && (
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <Input id="authorName" name="authorName" placeholder="Your Name" required />
        </div>
      )}
      <div>
        <label htmlFor="commentContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Comment <span className="text-red-500">*</span>
        </label>
        <Textarea id="commentContent" name="content" placeholder="Write a comment..." required />
      </div>
      <input type="hidden" name="contentType" value={contentType} />
      <input type="hidden" name="contentId" value={contentId} />
      <input type="hidden" name="pathname" value={pathname} />
      <SubmitButton />
    </form>
  );
}
