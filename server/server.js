const express = require('express');
const cors = require("cors");
const path = require("path");

// Load env Variables.
require('dotenv').config();

// Constants
const PORT = process.env.PORT || 8080;

// Setup
const app = express();

// Serve static files from the React build
const clientBuildPath = path.join(__dirname, "../client/build");
app.use(express.static(clientBuildPath));


// CORS
app.use(
    cors({
        origin: ["http://localhost:3000", "https://bookmyshowdeployment.onrender.com"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// Middleware
app.use(express.json()); 

// DB Connection
const connectDb = require("./config/db");
connectDb(); // Establish database connection

// Routes
const USER_ROUTER = require("./routes/userRoute");
const MOVIE_ROUTER = require("./routes/movieRoute");
const THEATER_ROUTER = require("./routes/theatreRoute");
const SHOW_ROUTER = require("./routes/showRoute");
const BOOKING_ROUTER = require("./routes/bookingRoute");

app.use("/api/users", USER_ROUTER);
app.use("/api/movies", MOVIE_ROUTER);
app.use("/api/theatres", THEATER_ROUTER);
app.use("/api/shows", SHOW_ROUTER);
app.use("/api/bookings", BOOKING_ROUTER);

// Default Route
app.get("/", (req, res) =>
    res.status(200).send("Welcome to the home page.")
);

app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// 404 Handler
app.use((req, res) =>
    res.status(404).json({ message: "page not found" })
);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
