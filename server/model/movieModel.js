// models/movieModel.js
const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    // Remove the index from here if you're using schema.index()
    // unique: true  // Remove this line
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  ageRating: {
    type: String,
    required: true,
    enum: ['U', 'PG', '12A', '15', '18'],
    default: 'PG'
  }
}, { timestamps: true });

// Define the index here only once
movieSchema.index({ title: 1 }, { 
  unique: true,
  collation: { locale: 'en', strength: 2 } // This makes the index case-insensitive
});

const Movie = mongoose.model("movies", movieSchema);
module.exports = Movie;
