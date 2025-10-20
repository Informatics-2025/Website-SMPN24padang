export type WasteNewsItem = {
    id: number;
    title: string;
    description: string;
    previewUrl: string;
    googleDriveUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};

export type WasteVideoItem = {
    id: number;
    title: string;
    youtubeUrl: string;
    createdAt: Date | null;
    updatedAt: Date | null;
};

export type WasteDocumentationItem = {
    id: number;
    title: string;
    imageUrl: string | null;
    youtubeUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
