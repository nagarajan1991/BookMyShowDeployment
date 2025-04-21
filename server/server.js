const express = require('express');
import * as cors from 'cors';

// Load env Variables.
require('dotenv').config();

// Constants
const PORT = process.env.PORT;

// Setup
const app = express();

const clientBuildPath = Path2D.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));
app.get('*', (req, res) => {
    res.sendFile(Path2D.join(clientBuildPath, 'index.html'));
});

app.use(
    cors({
        origin: ["http://localhost:3000","https://bookmyshowdeployment.onrender.com"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
)

app.use(express.json()); 

// Routes
app.use("/api/users", userRoute);

// Data base connection.
const connectDb = require("./config/db");
connectDb(); // Stablish database connection.

// Global Variables
const USER_ROUTER = require("./routes/userRoute");
const MOVIE_ROUTER = require("./routes/movieRoute");
const THEATER_ROUTER = require("./routes/theatreRoute");
const SHOW_ROUTER = require("./routes/showRoute");
const BOOKING_ROUTER = require("./routes/bookingRoute");

// Routes.
app.use("/api/users", USER_ROUTER);
app.use("/api/movies", MOVIE_ROUTER);
app.use("/api/theatres", THEATER_ROUTER);
app.use("/api/shows", SHOW_ROUTER);
app.use("/api/bookings", BOOKING_ROUTER);

app.get("/", (req, res) =>
    res.status(201).send("Welcome to the home page.")
);

app.use((req, res) =>
    res.status(404).json({ message: "page not found" })
);

// Start the server.
// URL: localhost:8082
app.listen(PORT, () => {
    console.log(`server is running on port`);
});

