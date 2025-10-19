'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { comments, likes, users } from '@/lib/db/schema';
import { and, eq, count, desc, or, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// --- Comments Actions ---

export async function createComment(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  const content = formData.get('content') as string;
  const contentType = formData.get('contentType') as string;
  const contentId = formData.get('contentId') as string;
  const pathname = formData.get('pathname') as string;
  const authorName = formData.get('authorName') as string;

  if (!content || !contentType || !contentId) {
    throw new Error('Invalid comment data.');
  }

  if (!userId && !authorName) {
    throw new Error('You must provide a name to comment anonymously.');
  }

  await db.insert(comments).values({
    content,
    contentType,
    contentId,
    userId: userId,
    authorName: userId ? undefined : authorName,
  });

  revalidatePath(pathname);
}

export async function fetchComments(contentType: string, contentId:string) {
    const commentsData = await db.select()
        .from(comments)
        .where(and(
            eq(comments.contentType, contentType),
            eq(comments.contentId, contentId)
        ))
        .orderBy(desc(comments.createdAt));

    if (commentsData.length === 0) {
        return [];
    }

    const userIds = commentsData
        .map(comment => comment.userId)
        .filter((id): id is string => id !== null);

    if (userIds.length === 0) {
        return commentsData.map(comment => ({ ...comment, user: null }));
    }

    const usersData = await db.select({
        id: users.id,
        name: users.name,
        image: users.image,
    }).from(users).where(inArray(users.id, userIds));

    const usersMap = new Map(usersData.map(user => [user.id, user]));

    const result = commentsData.map(comment => {
        const user = comment.userId ? usersMap.get(comment.userId) : null;
        return {
            ...comment,
            user: user || null,
        };
    });

    return result;
}

// --- Likes Actions ---

export async function addLike(contentType: string, contentId: string, pathname: string, anonymousId: string | null) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId && !anonymousId) {
        throw new Error('Cannot identify user or device.');
    }

    const existingLikeQuery = userId
        ? eq(likes.userId, userId)
        : eq(likes.anonymousId, anonymousId!)

    const existingLike = await db.query.likes.findFirst({
        where: and(
            existingLikeQuery,
            eq(likes.contentType, contentType),
            eq(likes.contentId, contentId)
        ),
    });

    if (existingLike) {
        await db.delete(likes).where(eq(likes.id, existingLike.id));
    } else {
        const newLike: {
            userId?: string | null;
            anonymousId?: string | null;
            contentType: string;
            contentId: string;
        } = {
            contentType,
            contentId,
        };

        if (userId) {
            newLike.userId = userId;
        } else {
            newLike.anonymousId = anonymousId;
        }

        await db.insert(likes).values(newLike);
    }

    revalidatePath(pathname);
}


export async function countLikes(contentType: string, contentId: string) {
  const result = await db
    .select({
      count: count(),
    })
    .from(likes)
    .where(
      and(
        eq(likes.contentType, contentType),
        eq(likes.contentId, contentId)
      )
    );
  
  return result[0]?.count ?? 0;
}

export async function hasLiked(contentType: string, contentId: string, anonymousId: string | null) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId && !anonymousId) {
        return false;
    }

    const existingLikeQuery = userId
        ? eq(likes.userId, userId)
        : eq(likes.anonymousId, anonymousId!)

    const existingLike = await db.query.likes.findFirst({
        where: and(
            existingLikeQuery,
            eq(likes.contentType, contentType),
            eq(likes.contentId, contentId)
        ),
    });

    return !!existingLike;
}

// --- Admin Actions ---

export async function fetchAllCommentsForAdmin() {
    const session = await auth();
    // TODO: Add a proper admin role check here
    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    // This uses the same robust fetch pattern as fetchComments
    const commentsData = await db.select().from(comments).orderBy(desc(comments.createdAt));

    if (commentsData.length === 0) return [];

    const userIds = commentsData
        .map(comment => comment.userId)
        .filter((id): id is string => id !== null);

    if (userIds.length === 0) {
        return commentsData.map(comment => ({ ...comment, user: null }));
    }

    const usersData = await db.select({
        id: users.id,
        name: users.name,
    }).from(users).where(inArray(users.id, userIds));

    const usersMap = new Map(usersData.map(user => [user.id, user]));

    const result = commentsData.map(comment => {
        const user = comment.userId ? usersMap.get(comment.userId) : null;
        return {
            ...comment,
            user: user || null,
        };
    });

    return result;
}

export async function deleteComment(commentId: number) {
    const session = await auth();
    // TODO: Add a proper admin role check here
    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    await db.delete(comments).where(eq(comments.id, commentId));

    revalidatePath('/admin/comments');
}
