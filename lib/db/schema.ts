import { pgTable, uuid, text, timestamp, integer, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const watchedMovies = pgTable(
  "watched_movies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    movieId: integer("movie_id").notNull(),
    watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("watched_movies_user_movie_unique").on(table.userId, table.movieId)]
);

export type WatchedMovie = typeof watchedMovies.$inferSelect;
export type NewWatchedMovie = typeof watchedMovies.$inferInsert;

export const favoriteMovies = pgTable(
  "favorite_movies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    movieId: integer("movie_id").notNull(),
    favoritedAt: timestamp("favorited_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("favorite_movies_user_movie_unique").on(table.userId, table.movieId)]
);

export type FavoriteMovie = typeof favoriteMovies.$inferSelect;
export type NewFavoriteMovie = typeof favoriteMovies.$inferInsert;
