import http from "../utils/http";

/**
 * PUBLIC_INTERFACE
 * RecipeService provides methods to interact with the backend Recipe API.
 *
 * Endpoints used (conventional):
 * - GET /recipes -> list recipes (supports query params like page, limit, category, sort)
 * - GET /recipes/search -> search recipes (supports q, category, page, limit)
 * - GET /recipes/:id -> get single recipe details
 * - GET /categories -> list available categories
 *
 * All methods return Axios promises; callers should .then/.catch and handle loading/error UI.
 */
const RecipeService = {
  // PUBLIC_INTERFACE
  getRecipes: (params = {}) => {
    /** Fetch a list of recipes with optional params: { page, limit, category, sort }. */
    return http.get("/recipes", { params });
  },

  // PUBLIC_INTERFACE
  searchRecipes: (params = {}) => {
    /** Search recipes with params: { q, category, page, limit }. */
    return http.get("/recipes/search", { params });
  },

  // PUBLIC_INTERFACE
  getRecipeById: (id) => {
    /** Retrieve details of a single recipe by ID. */
    if (!id) throw new Error("Recipe ID is required");
    return http.get(`/recipes/${encodeURIComponent(id)}`);
  },

  // PUBLIC_INTERFACE
  getCategories: () => {
    /** Retrieve list of recipe categories. */
    return http.get("/categories");
  },
};

export default RecipeService;
