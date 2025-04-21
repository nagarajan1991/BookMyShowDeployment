import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loaderSlice";
import { getShowById } from "../../api/shows";
import { useNavigate, useParams } from "react-router-dom";
import { message, Card, Row, Col, Button, Typography, Divider, notification } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, TagOutlined, TeamOutlined } from '@ant-design/icons';
import moment from "moment";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { makePayment, bookShow } from "../../api/booking";

const { Title, Text } = Typography;

// Initialize Stripe with the public key
const STRIPE_KEY = "pk_test_51RDa9gPDaxXsuc2w3CPDE2qPzUP2sxCNwf9fMRRS2JWyzuQm9YUZ72uZ8C4FQZ0foGP4zno1NjTJUKPMmj4Y6IlN00UjgdVKv9"
console.log("Stripe Key:", STRIPE_KEY); // For debugging

const stripePromise = loadStripe(STRIPE_KEY);

const PaymentForm = ({ amount, onSuccess, processing }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
            });

            if (error) {
                setError(error.message);
                return;
            }

            await onSuccess(paymentMethod);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <div className="card-element-container">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>
            {error && <div className="payment-error">{error}</div>}
            <Button
                type="primary"
                htmlType="submit"
                disabled={!stripe || processing}
                loading={processing}
                block
                style={{ marginTop: '20px' }}
            >
                Pay £{amount}
            </Button>
        </form>
    );
};

function BookShow() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const { user } = useSelector((state) => state.users);
    
    const [show, setShow] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [clientSecret, setClientSecret] = useState("");
    const [processing, setProcessing] = useState(false);

    const getData = async () => {
        try {
            dispatch(ShowLoading());
            const response = await getShowById({ showId: params.id });
            if (response.success) {
                setShow(response.data);
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            dispatch(HideLoading());
        }
    };

    const handlePayment = async (paymentMethod) => {
        try {
            setProcessing(true);
            dispatch(ShowLoading());
    
            const amount = selectedSeats.length * show.ticketPrice;
            const stripe = await stripePromise;
    
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: paymentMethod.id,
            });
    
            if (error) {
                throw new Error(error.message);
            }
    
            if (paymentIntent.status === "succeeded") {
                const bookingResponse = await bookShow({
                    show: params.id,
                    seats: selectedSeats,
                    transactionId: paymentIntent.id,
                    user: user._id,
                    totalAmount: amount,
                });
    
                if (bookingResponse.success) {
                    notification.success({
                        message: 'Booking Confirmed! 🎉',
                        description: 'E-ticket has been sent to your registered email (Check spam folder if not found)',
                        duration: 5
                    });
                    navigate("/ticket-view", {
                        state: {
                            booking: {
                                ...bookingResponse.data,
                                totalAmount: amount
                            },
                            show: show,
                            movie: show.movie
                        }
                    });
                } else {
                    message.error(bookingResponse.message);
                }
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setProcessing(false);
            dispatch(HideLoading());
        }
    };

    const initializePayment = async () => {
        try {
            dispatch(ShowLoading());
            const response = await makePayment({
                amount: selectedSeats.length * show.ticketPrice,
            });
            
            if (response.success) {
                setClientSecret(response.clientSecret);
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error(error.response?.message || "Could not initialize payment");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        if (selectedSeats.length > 0) {
            initializePayment();
        }
    }, [selectedSeats]);

    if (!show) return null;

    return (
        <div className="booking-container">
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card className="movie-info-card">
                        <div className="movie-header">
                            <div className="movie-details">
                                <Title level={2}>{show.movie.title}</Title>
                                <Text type="secondary">
                                    <EnvironmentOutlined /> {show.theatre.name}
                                </Text>
                                <div className="show-info">
                                    <Text>
                                        <ClockCircleOutlined /> {moment(show.date).format("MMM Do YYYY")} at {" "}
                                        {moment(show.time, "HH:mm").format("hh:mm A")}
                                    </Text>
                                    <Text>
                                        <TagOutlined /> £{show.ticketPrice} per ticket
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card className="seats-card">
                        <Title level={4} className="text-center">Select Your Seats</Title>
                        
                        <div className="screen-container">
                            <div className="screen"></div>
                            <Text type="secondary">Screen</Text>
                        </div>

                        <div className="seats-legend">
                            <div className="legend-item">
                                <div className="seat available"></div>
                                <span>Available</span>
                            </div>
                            <div className="legend-item">
                                <div className="seat selected"></div>
                                <span>Selected</span>
                            </div>
                            <div className="legend-item">
                                <div className="seat booked"></div>
                                <span>Booked</span>
                            </div>
                        </div>

                        <div className="seats-container">
                            {Array.from({ length: Math.ceil(show.totalSeats / 12) }).map((_, row) => (
                                <div key={row} className="seat-row">
                                    {Array.from({ length: 12 }).map((_, col) => {
                                        const seatNumber = row * 12 + col + 1;
                                        if (seatNumber > show.totalSeats) return null;

                                        const isSelected = selectedSeats.includes(seatNumber);
                                        const isBooked = show.bookedSeats.includes(seatNumber);

                                        return (
                                            <button
                                                key={seatNumber}
                                                className={`seat ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                                                onClick={() => {
                                                    if (!isBooked) {
                                                        if (isSelected) {
                                                            setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
                                                        } else {
                                                            setSelectedSeats([...selectedSeats, seatNumber]);
                                                        }
                                                    }
                                                }}
                                                disabled={isBooked}
                                            >
                                                {seatNumber}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {selectedSeats.length > 0 && (
                            <div className="booking-summary">
                                <div className="summary-item">
                                    <Text>Selected Seats:</Text>
                                    <Text strong>{selectedSeats.sort((a, b) => a - b).join(", ")}</Text>
                                </div>
                                <div className="summary-item">
                                    <Text>Total Amount:</Text>
                                    <Text strong>£{selectedSeats.length * show.ticketPrice}</Text>
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>

                {selectedSeats.length > 0 && clientSecret && (
                    <Col span={24}>
                        <Card className="payment-card">
                            <Title level={4}>Payment Details</Title>
                            <Divider />
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <PaymentForm
                                    amount={selectedSeats.length * show.ticketPrice}
                                    onSuccess={handlePayment}
                                    processing={processing}
                                />
                            </Elements>
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    );
}

export default BookShow;
