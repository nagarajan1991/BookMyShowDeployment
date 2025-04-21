const nodemailer = require("nodemailer");
const QRCode = require('qrcode');
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const { SENDGRID_API_KEY } = process.env;

async function generateQRCode(data) {
    try {
        return await QRCode.toDataURL(JSON.stringify(data));
    } catch (err) {
        console.error("QR Code generation error:", err);
        return null;
    }
}

async function replaceContent(content, creds) {
    try {
        // Format date if it exists
        if (creds.date) {
            const dateObj = new Date(creds.date);
            creds.date = dateObj.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }

        // Format time if it exists
        if (creds.time) {
            const timeArr = creds.time.split(':');
            const timeObj = new Date();
            timeObj.setHours(timeArr[0], timeArr[1]);
            creds.time = timeObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }

        // Generate QR code if booking details exist
        if (creds.transactionId && creds.movie) {
            const qrCodeData = {
                bookingId: creds.transactionId,
                movie: creds.movie,
                seats: creds.seats,
                date: creds.date,
                time: creds.time
            };
            const qrCodeImage = await generateQRCode(qrCodeData);
            if (qrCodeImage) {
                creds.qrCode = qrCodeImage;
            }
        }

        // Replace all placeholders with actual values
        let updatedContent = content;
        for (const [key, value] of Object.entries(creds)) {
            const placeholder = `#{${key}}`;
            // Use global replace to replace all instances
            updatedContent = updatedContent.replace(new RegExp(placeholder, 'g'), value || '');
        }

        return updatedContent;
    } catch (err) {
        console.error("Content replacement error:", err);
        throw err;
    }
}

async function EmailHelper(templateName, receiverEmail, creds) {
    try {
        console.log("Email Helper started with:", {
            template: templateName,
            email: receiverEmail,
            credentials: JSON.stringify(creds, null, 2)
        });

        // Validate required fields based on template type
        if (templateName === 'ticketTemplate.html') {
            const requiredFields = ['transactionId', 'movie', 'theatre', 'date', 'time', 'seats', 'amount', 'name'];
            const missingFields = requiredFields.filter(field => !creds[field]);
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }
        }

        const templatePath = path.join(__dirname, "email_templates", templateName);
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found: ${templatePath}`);
        }

        let content = await fs.promises.readFile(templatePath, "utf-8");
        const processedContent = await replaceContent(content, creds);

        const emailDetails = {
            to: receiverEmail,
            from: "nagarajan1991@gmail.com",
            subject: templateName.includes('ticket') 
                ? `Your Movie Tickets for ${creds.movie}`
                : "Mail From Dummy Book My Show",
            html: processedContent
        };

        const transportDetails = {
            host: "smtp.sendgrid.net",
            port: 587, // Changed to 587 for TLS
            secure: false,
            auth: {
                user: "apikey",
                pass: SENDGRID_API_KEY,
            }
        };

        const transporter = nodemailer.createTransport(transportDetails);
        
        // Verify transport configuration
        await transporter.verify();
        console.log("Transport verified successfully");

        // Send email
        const info = await transporter.sendMail(emailDetails);
        console.log("Email sent successfully:", info.messageId);

        return {
            success: true,
            messageId: info.messageId
        };

    } catch (err) {
        console.error("Email Helper Error:", err);
        throw err; // Rethrow to handle in calling function
    }
}

module.exports = EmailHelper;
