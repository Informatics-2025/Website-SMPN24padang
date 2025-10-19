ALTER TABLE "comments" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "comments" ADD COLUMN "author_name" text;
--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "unique_like";
--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "user_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "likes" ADD COLUMN "anonymous_id" text;
