const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  register,
  login,
  getCurrentUser,
  updateProfile
} = require("../controllers/userController");

const User = require("../model/userModel");
const EmailHelper = require("../utils/emailHelper");

// POST
router.post("/login", login);
// backend/routes/userRoute.js
router.post("/register", register);

// Add new route for updating profile
router.post('/update-profile', authMiddleware, updateProfile);


// GET
router.get("/get-current-user", authMiddleware, getCurrentUser);

// Function for otp generation.
/**
* Math.random(): Generates a random floating-point number between 0 (inclusive) and 1
(exclusive).
Math.random() * 900000: Scales the random number to a range between 0 and 899999.
100000 + Math.random() * 900000: Shifts the range to be between 100000 and 999999.
Math.floor(): Rounds down to the nearest whole number.
*/
const otpGenerator = function () {
  return Math.floor(100000 + Math.random() * 900000);
}

router.patch("/forgetpassword", async function (req, res) {
  /**
   * 1. you can ask for email.
   * 2. Check if email is present or not.
   * 3. If email is not present -> send a response to the user(User not found).
   * 4. If email is present -> create basic otp  -> send to the email.
   * 5. Also store the otp -> in the userModel.
   */

  try {
    if (req.body.email === undefined) {
      return res.status(401).json({
        status: "failure",
        message: "Please enter the email for forget password."
      });
    }

    // find the user in db.
    let user = await User.findOne({ email: req.body.email });
    if (user === null) {
      return res.status(404).json({
        status: "failure",
        message: "User not found"
      });
    }

    // If we got the user.
    const otp = otpGenerator();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;

    // Those update will be send to the db.
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Otp sent to your email id."
    });

    // send the mail to there email -> otp
    EmailHelper("otp.html", user.email, {
      name: user.name,
      otp: otp,
    });

  } catch (err) {
    return res.status(500).json({ status: "failure", message: err.message });
  }
});

router.patch("/resetpassword/:email", async function (req, res) {
  /**
   * 1. otp is there, new password should be populated and We match the otp.
   * 2. email id should match.
   * 3. otp is not expired
   */
  try {

    let resetDetails = req.body;
    // REquired fields should be there.
    if (!resetDetails.password || !resetDetails.otp) {
      return res.status(401).json({
        status: "failure",
        message: "Invalid request!"
      });
    }

    // Is person exist.
    let user = await User.findOne({ email: req.params.email });
    if (user === null) {
      return res.status(404).json({
        status: "failure",
        message: "User not found"
      });
    }

    // is otp expired.

    if (Date.now() > user.otpExpiry) {
      return res.status(401).json({
        status: "failure",
        message: "otp expired."
      });
    }

    user.password = req.body.password;

    // Reset the otp from the user.
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();
    return res.status(200).json({
      status: "success",
      message: "Password reset successfully"
    });

  } catch (err) {
    return res.status(500).json({ status: "failure", message: err.message });
  }
})




module.exports = router;
