const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const auth = require("../middlewares/authMiddleware");
const Booking = require("../model/bookingModel");
const Show = require("../model/showModel");
const EmailHelper = require("../utils/emailHelper");

// Helper function to format date
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// Helper function to format time
const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

router.post("/make-payment", auth, async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount"
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'gbp',
            payment_method_types: ['card'],
            metadata: {
                userId: req.body.userId
            }
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error("Payment Intent Error:", error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.post("/book-show", auth, async (req, res) => {
    try {
        // Validate request body
        if (!req.body.show || !req.body.seats || !req.body.transactionId) {
            return res.status(400).json({
                success: false,
                message: "Missing required booking information"
            });
        }

        // Create new booking
        const newBooking = new Booking(req.body);
        await newBooking.save();

        // Update show's booked seats
        const show = await Show.findById(req.body.show)
            .populate("movie")
            .populate("theatre");

        if (!show) {
            throw new Error("Show not found");
        }

        const updatedBookedSeats = [...show.bookedSeats, ...req.body.seats];
        await Show.findByIdAndUpdate(req.body.show, {
            bookedSeats: updatedBookedSeats,
        });

        // Get populated booking details
        const populatedBooking = await Booking.findById(newBooking._id)
            .populate("user")
            .populate({
                path: "show",
                populate: [
                    { path: "movie", model: "movies" },
                    { path: "theatre", model: "theatre" }
                ]
            });

        console.log("Populated booking details:", {
            bookingId: populatedBooking._id,
            user: populatedBooking.user.email,
            movie: populatedBooking.show.movie.title,
            seats: populatedBooking.seats
        });

        // Prepare email data
        const emailData = {
            name: populatedBooking.user.name,
            movie: populatedBooking.show.movie.title,
            theatre: populatedBooking.show.theatre.name,
            date: formatDate(populatedBooking.show.date),
            time: formatTime(populatedBooking.show.time),
            seats: populatedBooking.seats.join(", "),
            amount: populatedBooking.seats.length * populatedBooking.show.ticketPrice,
            transactionId: populatedBooking.transactionId,
            posterUrl: populatedBooking.show.movie.posterUrl || '',
            bookingId: populatedBooking._id
        };

        // Send email
        try {
            await EmailHelper("ticketTemplate.html", populatedBooking.user.email, emailData);
            console.log("Ticket email sent successfully");
        } catch (emailError) {
            console.error("Failed to send ticket email:", emailError);
            // Don't throw error here, booking is still successful
        }

        res.status(200).json({
            success: true,
            message: "Show booked successfully",
            data: {
                ...newBooking.toObject(),
                emailSent: true
            }
        });
    } catch (err) {
        console.error("Booking error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to book show",
            error: err.message
        });
    }
});

router.get("/get-all-bookings", auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.body.userId })
            .populate("user")
            .populate({
                path: "show",
                populate: [
                    { path: "movie", model: "movies" },
                    { path: "theatre", model: "theatres" }
                ]
            })
            .sort({ createdAt: -1 }); // Latest bookings first

        res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            data: bookings
        });
    } catch (err) {
        console.error("Get bookings error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
            error: err.message
        });
    }
});

router.post("/webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', {
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                customerId: paymentIntent.customer
            });

            // Add any additional payment success handling here
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Webhook Error:", err);
        return res.status(400).json({
            success: false,
            message: `Webhook Error: ${err.message}`
        });
    }
});

module.exports = router;
