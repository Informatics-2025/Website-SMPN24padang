import { getWasteNewsById } from '@/app/admin/banksampah/actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PDFViewer } from '@/components/pdf-viewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractionSection } from '@/components/interactions/InteractionSection';

export default async function ArticlePage({ params }: { params: { id: string } }) {
    const articleId = parseInt(params.id, 10);
    if (isNaN(articleId)) {
        notFound();
    }

    const article = await getWasteNewsById(articleId);

    if (!article) {
        notFound();
    }

    const backButton = (
        <Link href="/sispendik" className="mb-6 inline-block">
            <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Sispendik
            </Button>
        </Link>
    );

    if (article.googleDriveUrl) {
        return (
            <div className="container mx-auto py-6">
                {backButton}
                <PDFViewer
                    title={article.title}
                    description={article.description}
                    url={article.googleDriveUrl}
                />
                <InteractionSection 
                    contentType="waste_news" 
                    contentId={article.id.toString()} 
                    pathname={`/articles/${article.id}`} 
                />
            </div>
        );
    }

    // Fallback for articles without a PDF link, showing title and description.
    return (
        <div className="container mx-auto py-10">
            {backButton}
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-4xl font-bold leading-tight">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-lg max-w-none mt-4">
                    <p>{article.description}</p>
                </CardContent>
            </Card>
            <InteractionSection 
                contentType="waste_news" 
                contentId={article.id.toString()} 
                pathname={`/articles/${article.id}`} 
            />
        </div>
    );
}
