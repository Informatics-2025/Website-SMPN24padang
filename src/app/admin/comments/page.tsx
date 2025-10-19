import {
    fetchAllCommentsForAdmin,
    deleteComment,
} from '@/lib/actions/interactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

function DeleteButton({ commentId }: { commentId: number }) {
    const deleteAction = deleteComment.bind(null, commentId);
    return (
        <form action={deleteAction}>
            <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
            </Button>
        </form>
    );
}

function getArticleLink(contentType: string, contentId: string) {
    const basePath = contentType === 'news' ? '/news' : '/articles';
    return `${basePath}/${contentId}`;
}

export default async function AdminCommentsPage() {
    const comments = await fetchAllCommentsForAdmin();

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Comments</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[25%]">Author</TableHead>
                            <TableHead className="w-[40%]">Comment</TableHead>
                            <TableHead>Content</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <TableRow key={comment.id}>
                                    <TableCell>
                                        {comment.user ? (
                                            <div className="font-medium">
                                                {comment.user.name}
                                            </div>
                                        ) : (
                                            <div className="font-medium">
                                                {comment.authorName}{' '}
                                                <Badge variant="outline">
                                                    Anon
                                                </Badge>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{comment.content}</TableCell>
                                    <TableCell>
                                        <Link
                                            href={getArticleLink(
                                                comment.contentType,
                                                comment.contentId,
                                            )}
                                            className="text-blue-500 hover:underline"
                                            target="_blank"
                                        >
                                            View Content
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            comment.createdAt,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DeleteButton commentId={comment.id} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    Belum ada Komentar.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
