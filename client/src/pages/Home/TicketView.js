// TicketView.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button } from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import moment from 'moment';
import { useSelector } from 'react-redux';

const TicketView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, show, movie } = location.state || {};
  const { user } = useSelector((state) => state.users);

  if (!booking || !show || !movie) {
    return navigate('/profile');
  }

  const generateQRData = () => {
    return JSON.stringify({
      bookingId: booking._id,
      showTime: show.time,
      seats: booking.seats,
      userId: user._id
    });
  };

  const styles = {
    pageContainer: {
      maxWidth: '1000px',
      margin: '2rem auto',
      padding: '20px',
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '24px',
      padding: '24px',
    },
    posterContainer: {
      width: '100%',
      aspectRatio: '2/3',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '20px',
    },
    poster: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    detailsSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    movieTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1a1a1a',
      marginBottom: '16px',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
    infoItem: {
      marginBottom: '12px',
    },
    label: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '4px',
    },
    value: {
      color: '#1a1a1a',
      fontSize: '16px',
      fontWeight: '500',
    },
    qrSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '20px',
    },
    downloadButton: {
      marginTop: '20px',
      width: '100%',
    },
    // Print-specific styles
    printStyles: `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-ticket, .print-ticket * {
          visibility: visible;
        }
        .print-ticket {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px;
        }
        .no-print {
          display: none !important;
        }
        @page {
          size: A4;
          margin: 0;
        }
      }
    `
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{styles.printStyles}</style>
      <div style={styles.pageContainer}>
        <Card style={styles.card} className="print-ticket">
          {/* Header with Logo */}
          <div style={{ 
            borderBottom: '2px solid #f0f0f0', 
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{ 
              margin: 0, 
              color: '#f84464', 
              fontSize: '24px', 
              fontWeight: 'bold' 
            }}>
              BOOKMYSHOW
            </h1>
            <div style={{ textAlign: 'right', fontSize: '14px', color: '#666' }}>
              <div>Booking ID: {booking._id}</div>
              <div>Booked On: {moment(booking.createdAt).format("DD-MM-YYYY hh:mm A")}</div>
            </div>
          </div>

          <div style={styles.contentGrid}>
            {/* Left Section - Poster */}
            <div>
              <div style={styles.posterContainer}>
                <img src={movie.poster} alt={movie.title} style={styles.poster} />
              </div>
              <Button 
                type="primary" 
                onClick={handlePrint} 
                style={styles.downloadButton}
                className="no-print"
              >
                Download Ticket
              </Button>
            </div>

            {/* Right Section - Details */}
            <div style={styles.detailsSection}>
              <h2 style={styles.movieTitle}>{movie.title}</h2>
              
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <div style={styles.label}>Date</div>
                  <div style={styles.value}>
                    {moment(show.date).format('MMM Do YYYY')}
                  </div>
                </div>

                <div style={styles.infoItem}>
                  <div style={styles.label}>Time</div>
                  <div style={styles.value}>
                    {moment(show.time, 'HH:mm').format('hh:mm A')}
                  </div>
                </div>

                <div style={styles.infoItem}>
                  <div style={styles.label}>Theatre</div>
                  <div style={styles.value}>{show.theatre.name}</div>
                </div>

                <div style={styles.infoItem}>
                  <div style={styles.label}>Amount Paid</div>
                  <div style={styles.value}>£{booking.totalAmount}</div>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.label}>Seats</div>
                <div style={styles.value}>{booking.seats.join(', ')}</div>
              </div>

              <div style={styles.qrSection}>
                <QRCodeSVG
                  value={generateQRData()}
                  size={120}
                  level="H"
                  includeMargin={true}
                />
                <p style={{ marginTop: '8px', color: '#666' }}>Scan for entry</p>
              </div>

              {/* Terms and Conditions */}
              <div style={{ 
                marginTop: '20px', 
                padding: '16px', 
                backgroundColor: '#f8f8f8', 
                borderRadius: '8px',
                fontSize: '12px',
                color: '#666'
              }}>
                <h4 style={{ marginBottom: '8px' }}>Terms & Conditions:</h4>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li>Please arrive 15 minutes before show time</li>
                  <li>Outside food and beverages are not allowed</li>
                  <li>This ticket is non-refundable and non-transferable</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default TicketView;
