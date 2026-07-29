CREATE TABLE "watchlist_movies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"movie_id" integer NOT NULL,
	"media_type" text DEFAULT 'movie' NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watchlist_movies_user_movie_unique" UNIQUE("user_id","movie_id","media_type")
);
--> statement-breakpoint
ALTER TABLE "watchlist_movies" ADD CONSTRAINT "watchlist_movies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;