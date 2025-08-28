import http from "../utils/http";

/**
 * PUBLIC_INTERFACE
 * FavoriteService encapsulates HTTP calls for managing user's favorite recipes.
 *
 * Endpoints (conventional; adjust to your backend routes):
 * - GET /favorites -> list of favorites (each item should include recipeId)
 * - POST /favorites { recipeId } -> create favorite
 * - DELETE /favorites/:recipeId -> remove favorite by recipeId
 */
const FavoriteService = {
  // PUBLIC_INTERFACE
  listFavorites: () => {
    /** Retrieve user's favorite recipes. Returns Axios promise resolving to an array. */
    return http.get("/favorites");
  },

  // PUBLIC_INTERFACE
  addFavorite: (recipeId) => {
    /** Add a recipe to favorites. Expects recipeId to be provided. */
    if (!recipeId) throw new Error("recipeId is required");
    return http.post("/favorites", { recipeId });
  },

  // PUBLIC_INTERFACE
  removeFavorite: (recipeId) => {
    /** Remove a recipe from favorites by recipeId. */
    if (!recipeId) throw new Error("recipeId is required");
    return http.delete(`/favorites/${encodeURIComponent(recipeId)}`);
  },
};

export default FavoriteService;
