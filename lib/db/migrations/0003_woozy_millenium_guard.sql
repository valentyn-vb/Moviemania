ALTER TABLE "favorite_movies" DROP CONSTRAINT "favorite_movies_user_movie_unique";--> statement-breakpoint
ALTER TABLE "watched_movies" DROP CONSTRAINT "watched_movies_user_movie_unique";--> statement-breakpoint
ALTER TABLE "favorite_movies" ADD COLUMN "media_type" text DEFAULT 'movie' NOT NULL;--> statement-breakpoint
ALTER TABLE "watched_movies" ADD COLUMN "media_type" text DEFAULT 'movie' NOT NULL;--> statement-breakpoint
ALTER TABLE "favorite_movies" ADD CONSTRAINT "favorite_movies_user_movie_unique" UNIQUE("user_id","movie_id","media_type");--> statement-breakpoint
ALTER TABLE "watched_movies" ADD CONSTRAINT "watched_movies_user_movie_unique" UNIQUE("user_id","movie_id","media_type");