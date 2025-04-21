import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMovieById } from "../../api/movie";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loaderSlice";
import { message, Input, Row, Col, Card, Tag, Divider, Skeleton, Badge, Tooltip } from "antd";
import moment from "moment";
import { getAllTheatresByMovie } from "../../api/shows";
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  GlobalOutlined,
  TagOutlined,
  EnvironmentOutlined 
} from "@ant-design/icons";


const AGE_RATINGS = {
  'U': { color: '#4CAF50', label: 'Universal, suitable for all ages' },
  'PG': { color: '#8BC34A', label: 'Parental Guidance' },
  '12A': { color: '#FFC107', label: 'Suitable for 12 years and over' },
  '15': { color: '#FF9800', label: 'Suitable only for 15 years and over' },
  '18': { color: '#F44336', label: 'Adults Only' }
};

const SingleMovie = () => {
  const params = useParams();
  const [movie, setMovie] = useState();
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [theatres, setTheatres] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true); // Add this loading state

  const handleDate = (e) => {
    setDate(moment(e.target.value).format("YYYY-MM-DD"));
    navigate(`/movie/${params.id}?date=${e.target.value}`);
  };

  const getData = async () => {
    try {
      setIsLoading(true); // Set loading true before fetching
      dispatch(ShowLoading());
      const response = await getMovieById(params.id);
      if (response.success) {
        setMovie(response.data);
        // Get theatres right after getting movie details
        await getAllTheatres();
      } else {
        message.error(response.message);
      }
    } catch (err) {
      message.error(err.message);
    } finally {
      setIsLoading(false); // Set loading false after all data is fetched
      dispatch(HideLoading());
    }
  };

  const getAllTheatres = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllTheatresByMovie({ movie: params.id, date });
      if (response.success) {
        setTheatres(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getAllTheatres();
  }, [date]);

  return (
    <div className="movie-container">
      {isLoading ? (
        // Show skeleton while loading
        <>
          <div className="movie-hero" style={{ padding: '40px 0', background: 'rgba(0, 0, 0, 0.8)' }}>
            <div className="container mx-auto px-4">
              <Card className="movie-details-card bg-transparent">
                <Row gutter={24} align="middle">
                  <Col xs={24} sm={8} md={6}>
                    <Skeleton.Image style={{ width: '100%', height: '400px' }} active />
                  </Col>
                  <Col xs={24} sm={16} md={18}>
                    <Skeleton active paragraph={{ rows: 4 }} />
                  </Col>
                </Row>
              </Card>
            </div>
          </div>
          <div className="container mx-auto px-4">
            <div className="theatres-section">
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          </div>
        </>
      ) : (
        // Show actual content when loaded
        <>
          {movie && (
            <div className="movie-hero" style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${movie.poster})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              padding: '40px 0'
            }}>
              <div className="container mx-auto px-4">
                <Card className="movie-details-card bg-transparent">
                  <Row gutter={24} align="middle">
                    <Col xs={24} sm={8} md={6}>
                    <div className="movie-poster-container">
                      <img 
                        src={movie.poster} 
                        alt={movie.title}
                        className="movie-poster"
                      />
                      </div>
                    </Col>
                    <Col xs={24} sm={16} md={18}>
                    <div className="movie-info">
    <h1 className="movie-title" style={{ color: 'white' }}>{movie.title}</h1>
    <p className="movie-description">
        {movie.description}
    </p>

    <div className="movie-tags">
        {/* Add the age rating badge first */}
        <Tooltip title={AGE_RATINGS[movie.ageRating]?.label}>
            <Tag 
                style={{
                    backgroundColor: AGE_RATINGS[movie.ageRating]?.color || '#999',
                    color: 'white',
                    border: 'none',
                    padding: '4px 12px',
                    fontWeight: 'bold'
                }}
            >
                {movie.ageRating || 'N/A'}
            </Tag>
        </Tooltip>
        <Tag icon={<GlobalOutlined />} color="blue">
            {movie.language}
        </Tag>
        <Tag icon={<TagOutlined />} color="purple">
            {movie.genre}
        </Tag>
        <Tag icon={<CalendarOutlined />} color="green">
            {moment(movie.releaseDate).format("MMM Do YYYY")}
        </Tag>
        <Tag icon={<ClockCircleOutlined />} color="orange">
            {movie.duration} Minutes
        </Tag>
    </div>

    <div className="date-picker-section">
        <label className="date-label">Select Show Date:</label>
        <Input
            onChange={handleDate}
            type="date"
            min={moment().format("YYYY-MM-DD")}
            value={date}
            className="date-input"
            prefix={<CalendarOutlined />}
        />
    </div>
</div>
                    </Col>
                  </Row>
                </Card>
              </div>
            </div>
          )}
  
          <div className="container mx-auto px-4">
            <div className="theatres-section">
              <h2 className="section-title">Showtimes & Locations</h2>
              <Divider />
              
              {theatres.map((theatre) => (
                <Card key={theatre._id} className="theatre-card">
                  <Row gutter={24}>
                    <Col xs={24} md={8}>
                      <div className="theatre-info">
                        <h3 className="theatre-name">{theatre.name}</h3>
                        <p className="theatre-address">
                          <EnvironmentOutlined className="mr-2" />
                          {theatre.address}
                        </p>
                      </div>
                    </Col>
                    <Col xs={24} md={16}>
                      <div className="show-times">
                        {theatre.shows
                          .sort((a, b) => moment(a.time, "HH:mm") - moment(b.time, "HH:mm"))
                          .map((show) => (
                            <button
                              key={show._id}
                              onClick={() => navigate(`/book-show/${show._id}`)}
                              className="show-time-btn"
                            >
                              {moment(show.time, "HH:mm").format("hh:mm A")}
                            </button>
                          ))}
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
              
              {!isLoading && theatres.length === 0 && (
                <Card className="empty-theatres">
                  <div className="text-center py-8">
                    <h3 className="text-xl text-gray-600">
                      No theatres available for this movie on selected date
                    </h3>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}  

export default SingleMovie;