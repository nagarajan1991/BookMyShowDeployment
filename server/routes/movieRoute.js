const movieRouter = require("express").Router();
const {
  addMovie,
  getAllMovies,
  updateMovie,
  deleteMovie,
  getMovieById
} = require("../controllers/movieController");
const authMiddleware = require("../middlewares/authMiddleware");

// Middleware to handle errors
const errorHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};

// POST routes with auth middleware
movieRouter.post("/add-movie", authMiddleware, errorHandler(addMovie));
movieRouter.post("/delete-movie", authMiddleware, errorHandler(deleteMovie));

// GET routes
movieRouter.get("/get-all-movies", errorHandler(getAllMovies));
movieRouter.get("/get-movie/:id", errorHandler(getMovieById));

// PUT routes with auth middleware
movieRouter.put("/update-movie", authMiddleware, errorHandler(updateMovie));

module.exports = movieRouter;
