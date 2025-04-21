// controllers/movieController.js
const Movie = require("../model/movieModel");

// Add Movie
// controllers/movieController.js
const addMovie = async (req, res) => {
    try {
      console.log("1. Incoming request body:", req.body);
      
      // Validate required fields
      if (!req.body.title || !req.body.userId) {
        return res.status(400).json({
          success: false,
          message: "Title and userId are required"
        });
      }
  
      const newMovie = new Movie({
        ...req.body,
        userId: req.body.userId
      });
      
      console.log("2. Created movie object:", newMovie);
      
      const savedMovie = await newMovie.save();
      console.log("3. Saved movie:", savedMovie);
  
      res.status(201).json({
        success: true,
        message: "Movie added successfully",
        data: savedMovie
      });
    } catch (error) {
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        keyPattern: error.keyPattern,
        keyValue: error.keyValue
      });
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Movie with this title already exists"
        });
      }
  
      res.status(500).json({
        success: false,
        message: error.message || "Error adding movie"
      });
    }
  };
  
  

// Get All Movies
const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching movies"
    });
  }
};

// Get Movie by ID
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found"
      });
    }
    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching movie"
    });
  }
};

// Update Movie
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.body.movieId,
      req.body,
      { new: true }
    );
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating movie"
    });
  }
};

// Delete Movie
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.body.movieId);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Movie deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting movie"
    });
  }
};

module.exports = {
  addMovie,
  getAllMovies,
  updateMovie,
  deleteMovie,
  getMovieById
};
