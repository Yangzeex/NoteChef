import { algoliasearch } from "algoliasearch";

export const algoliaAdmin = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_KEY!
);

export const RECIPES_INDEX = "recipes";
export const USERS_INDEX = "users";
