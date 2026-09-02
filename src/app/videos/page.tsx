import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { unstable_cache } from "next/cache";
import { VideoGrid } from "./video-grid";

export const revalidate = 300;

const getVideos = unstable_cache(
  async () => db.select().from(videos),
  ["public-videos"],
  { revalidate: 300, tags: ["videos-collection"] },
);

export default async function VideosPage() {
  const videoData = await getVideos();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Galeri Video</h1>
      <VideoGrid videos={videoData} />
    </div>
  );
}
