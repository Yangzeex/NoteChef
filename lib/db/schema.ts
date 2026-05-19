import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  real,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // synced from Clerk
  username: text("username").unique().notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  cuisineSpecialties: text("cuisine_specialties").array(),
  subscriptionTier: text("subscription_tier").default("free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Recipes ──────────────────────────────────────────────────────────────────

export const recipes = pgTable("recipes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: jsonb("description"), // Tiptap JSON
  cookTime: integer("cook_time"), // minutes
  servings: integer("servings"),
  difficulty: text("difficulty"), // easy | medium | hard
  visibility: text("visibility").default("public").notNull(), // public | followers | private
  tags: text("tags").array(),
  status: text("status").default("draft").notNull(), // draft | published
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Media Items ──────────────────────────────────────────────────────────────

export const mediaItems = pgTable("media_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // video | audio | photo | text
  url: text("url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // seconds
  order: integer("order").default(0).notNull(),
  status: text("status").default("pending").notNull(), // pending | processing | ready | failed
  muxAssetId: text("mux_asset_id"),
  muxPlaybackId: text("mux_playback_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Ingredients ──────────────────────────────────────────────────────────────

export const ingredients = pgTable("ingredients", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amount: text("amount"),
  unit: text("unit"),
  order: integer("order").default(0).notNull(),
});

// ─── Steps ────────────────────────────────────────────────────────────────────

export const steps = pgTable("steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  body: jsonb("body"), // Tiptap JSON
  order: integer("order").default(0).notNull(),
  mediaItemId: uuid("media_item_id").references(() => mediaItems.id, {
    onDelete: "set null",
  }),
});

// ─── Cookbooks ────────────────────────────────────────────────────────────────

export const cookbooks = pgTable("cookbooks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Cookbook Recipes ─────────────────────────────────────────────────────────

export const cookbookRecipes = pgTable(
  "cookbook_recipes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cookbookId: uuid("cookbook_id")
      .notNull()
      .references(() => cookbooks.id, { onDelete: "cascade" }),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at").defaultNow().notNull(),
    note: text("note"),
  },
  (t) => ({
    uniqueCookbookRecipe: uniqueIndex("unique_cookbook_recipe").on(
      t.cookbookId,
      t.recipeId
    ),
  })
);

// ─── Follows ──────────────────────────────────────────────────────────────────

export const follows = pgTable(
  "follows",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.followerId, t.followingId] }),
  })
);

// ─── Comments ─────────────────────────────────────────────────────────────────

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  parentId: uuid("parent_id"), // self-reference for threading — added below via relations
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Reactions ────────────────────────────────────────────────────────────────

export const reactions = pgTable(
  "reactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // like | love | fire
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqueReaction: uniqueIndex("unique_reaction").on(t.recipeId, t.userId),
  })
);

// ─── Recipe Stats ─────────────────────────────────────────────────────────────

export const recipeStats = pgTable("recipe_stats", {
  recipeId: uuid("recipe_id")
    .primaryKey()
    .references(() => recipes.id, { onDelete: "cascade" }),
  likeCount: integer("like_count").default(0).notNull(),
  saveCount: integer("save_count").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
});

// ─── Feed Items ───────────────────────────────────────────────────────────────

export const feedItems = pgTable("feed_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(), // feed owner
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipeId: uuid("recipe_id").references(() => recipes.id, {
    onDelete: "cascade",
  }),
  eventType: text("event_type").notNull(), // new_recipe | new_follow
  score: real("score").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // new_follower | new_comment | new_reaction
  recipeId: uuid("recipe_id").references(() => recipes.id, {
    onDelete: "cascade",
  }),
  commentId: uuid("comment_id").references(() => comments.id, {
    onDelete: "cascade",
  }),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  cookbooks: many(cookbooks),
  comments: many(comments),
  reactions: many(reactions),
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),
  notifications: many(notifications),
  feedItems: many(feedItems),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(users, { fields: [recipes.userId], references: [users.id] }),
  mediaItems: many(mediaItems),
  ingredients: many(ingredients),
  steps: many(steps),
  comments: many(comments),
  reactions: many(reactions),
  stats: one(recipeStats, {
    fields: [recipes.id],
    references: [recipeStats.recipeId],
  }),
  cookbookRecipes: many(cookbookRecipes),
  feedItems: many(feedItems),
}));

export const mediaItemsRelations = relations(mediaItems, ({ one }) => ({
  recipe: one(recipes, {
    fields: [mediaItems.recipeId],
    references: [recipes.id],
  }),
}));

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [ingredients.recipeId],
    references: [recipes.id],
  }),
}));

export const stepsRelations = relations(steps, ({ one }) => ({
  recipe: one(recipes, { fields: [steps.recipeId], references: [recipes.id] }),
  mediaItem: one(mediaItems, {
    fields: [steps.mediaItemId],
    references: [mediaItems.id],
  }),
}));

export const cookbooksRelations = relations(cookbooks, ({ one, many }) => ({
  user: one(users, { fields: [cookbooks.userId], references: [users.id] }),
  cookbookRecipes: many(cookbookRecipes),
}));

export const cookbookRecipesRelations = relations(
  cookbookRecipes,
  ({ one }) => ({
    cookbook: one(cookbooks, {
      fields: [cookbookRecipes.cookbookId],
      references: [cookbooks.id],
    }),
    recipe: one(recipes, {
      fields: [cookbookRecipes.recipeId],
      references: [recipes.id],
    }),
  })
);

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  recipe: one(recipes, {
    fields: [comments.recipeId],
    references: [recipes.id],
  }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "parent",
  }),
  replies: many(comments, { relationName: "parent" }),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  recipe: one(recipes, {
    fields: [reactions.recipeId],
    references: [recipes.id],
  }),
  user: one(users, { fields: [reactions.userId], references: [users.id] }),
}));

export const recipeStatsRelations = relations(recipeStats, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeStats.recipeId],
    references: [recipes.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [notifications.recipeId],
    references: [recipes.id],
  }),
}));

export const feedItemsRelations = relations(feedItems, ({ one }) => ({
  actor: one(users, { fields: [feedItems.actorId], references: [users.id] }),
  recipe: one(recipes, {
    fields: [feedItems.recipeId],
    references: [recipes.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
export type MediaItem = typeof mediaItems.$inferSelect;
export type NewMediaItem = typeof mediaItems.$inferInsert;
export type Ingredient = typeof ingredients.$inferSelect;
export type Step = typeof steps.$inferSelect;
export type Cookbook = typeof cookbooks.$inferSelect;
export type NewCookbook = typeof cookbooks.$inferInsert;
export type CookbookRecipe = typeof cookbookRecipes.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Reaction = typeof reactions.$inferSelect;
export type RecipeStats = typeof recipeStats.$inferSelect;
export type FeedItem = typeof feedItems.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
