import { useEffect, useState, useCallback } from "react";
import { HideLoading, ShowLoading } from "../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import { getAllMovies } from "../../api/movie";
import { message, Row, Col, Input, Card, Typography, Badge, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title } = Typography;

// Add this constant for age ratings
const AGE_RATINGS = {
    'U': { color: '#4CAF50', label: 'Universal, suitable for all ages' },
    'PG': { color: '#8BC34A', label: 'Parental Guidance' },
    '12A': { color: '#FFC107', label: 'Suitable for 12 years and over' },
    '15': { color: '#FF9800', label: 'Suitable only for 15 years and over' },
    '18': { color: '#F44336', label: 'Suitable only for adults' }
};

function Home() {
  const [movies, setMovies] = useState(null);
  const [searchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllMovies();
      if (response.success) {
        setMovies(response.data);
      } else {
        message.error(response.message);
      }
    } catch (err) {
      message.error(err.message);
    } finally {
      dispatch(HideLoading());
    }
  }, [dispatch]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <div className="container">
      {/* Search Section */}
      <div className="search-container">
        <div className="search-wrapper">
          <Input
            size="large"
            placeholder="Search for movies"
            prefix={<SearchOutlined style={{ color: '#666' }} />}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Movies Grid */}
      <div className="movies-section" style={{ padding: '0 24px' }}>
        <Title level={2} style={{ marginBottom: 24 }}>Now Showing</Title>
        <Row gutter={[24, 24]}>
          {movies?.filter(movie => 
            movie?.title?.toLowerCase().includes(searchText.toLowerCase())
          ).map(movie => (
            <Col xs={12} sm={8} md={6} lg={4} key={movie._id}>
              <Card 
                hoverable
                className="movie-card"
                cover={
                  <div className="movie-poster-container">
                    <img
                      alt={movie.title}
                      src={movie.poster}
                      className="movie-poster"
                      onClick={() => navigate(`/movie/${movie._id}?date=${moment().format("YYYY-MM-DD")}`)}
                    />
                  </div>
                }
                bodyStyle={{ padding: '12px 16px' }}
              >
                <div className="movie-info">
                  <div className="movie-title-container">
                    <h3 className="movie-title" onClick={() => navigate(`/movie/${movie._id}`)}>
                      {movie.title}
                    </h3>
                  </div>
                  <div className="movie-meta">
                    <div className="movie-details">
                      <span className="movie-genre">{movie.genre}</span>
                      <span className="movie-language">{movie.language}</span>
                    </div>
                    <Tooltip title={AGE_RATINGS[movie.ageRating]?.label}>
                      <Badge
                        className="age-rating-badge"
                        style={{
                          backgroundColor: AGE_RATINGS[movie.ageRating]?.color || '#999',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          marginTop: '8px'
                        }}
                      >
                        {movie.ageRating || 'N/A'}
                      </Badge>
                    </Tooltip>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}

export default Home;