// MovieForm.jsx
import { Col, Modal, Row, Form, Input, Select, Button, message,Tooltip } from "antd";
import TextArea from "antd/es/input/TextArea";
import { ShowLoading, HideLoading } from "../../redux/loaderSlice";
import { useDispatch, useSelector} from "react-redux";
import { addMovie, updateMovie } from "../../api/movie";
import moment from "moment";


const AGE_RATINGS = [
  { value: 'U', label: 'U - Universal, suitable for all ages', color: '#4CAF50' },
  { value: 'PG', label: 'PG - Parental Guidance', color: '#8BC34A' },
  { value: '12A', label: '12A - Suitable for 12 years and over', color: '#FFC107' },
  { value: '15', label: '15 - Suitable only for 15 years and over', color: '#FF9800' },
  { value: '18', label: '18 - Suitable only for adults', color: '#F44336' },
];

const MovieForm = ({
  isModalOpen,
  setIsModalOpen,
  selectedMovie,
  setSelectedMovie,
  formType,
  getData,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);
  if (selectedMovie) {
    selectedMovie.releaseDate = moment(selectedMovie.releaseDate).format(
      "YYYY-MM-DD"
    );
  }

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      let response;
      
      const movieData = {
        title: values.title.trim(),
        userId: user._id, // Make sure this exists
        description: values.description,
        duration: values.duration,
        language: values.language,
        genre: values.genre,
        releaseDate: moment(values.releaseDate).format('YYYY-MM-DD'),
        poster: values.poster,
        ageRating: values.ageRating, // Add this line
      };
  
      // Debug log to check the data
      console.log('Movie Data being sent:', movieData);

      if (formType === "add") {
        response = await addMovie(movieData);
      } else {
        response = await updateMovie({ ...movieData, movieId: selectedMovie._id });
      }

      if (response && response.success) {  // Added check for response existence
        getData();
        message.success(response.message);
        setIsModalOpen(false);
      } else {
        message.error(response?.message || "Something went wrong"); // Added fallback message
      }

      setSelectedMovie(null);
      dispatch(HideLoading());
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message || "Something went wrong");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  return (
    <Modal
      centered
      title={formType === "add" ? "Add Movie" : "Edit Movie"}
      open={isModalOpen}
      onCancel={handleCancel}
      width={800}
      footer={null}
    >
      <Form layout="vertical" initialValues={selectedMovie} onFinish={onFinish}>
        <Row gutter={{ xs: 6, sm: 10, md: 12, lg: 16 }}>
          <Col span={24}>
            <Form.Item
              label="Movie Name"
              name="title"
              rules={[{ required: true, message: "Movie name is required!" }]}
            >
              <Input placeholder="Enter the movie name" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Description is required!" }]}
            >
              <TextArea rows="4" placeholder="Enter the description" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Row gutter={{ xs: 6, sm: 10, md: 12, lg: 16 }}>
              <Col span={8}>
                <Form.Item
                  label="Movie Duration (in min)"
                  name="duration"
                  rules={[
                    { required: true, message: "Movie duration is required!" },
                  ]}
                >
                  <Input type="number" placeholder="Enter the movie duration" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Language"
                  name="language"
                  rules={[
                    { required: true, message: "Movie language is required!" },
                  ]}
                >
                  <Select
                    placeholder="Select Language"
                    options={[
                      { value: "English", label: "English" },
                      { value: "Hindi", label: "Hindi" },
                      { value: "Tamil", label: "Tamil" },
                      { value: "Telugu", label: "Telugu" },
                      // ... other languages
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Release Date"
                  name="releaseDate"
                  rules={[
                    { required: true, message: "Release date is required!" },
                  ]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row gutter={{ xs: 6, sm: 10, md: 12, lg: 16 }}>
              <Col span={8}>
                <Form.Item
                  label="Genre"
                  name="genre"
                  rules={[{ required: true, message: "Genre is required!" }]}
                >
                  <Select
                    placeholder="Select Genre"
                    options={[
                      { value: "Action", label: "Action" },
                      { value: "Comedy", label: "Comedy" },
                      { value: "Drama", label: "Drama" },
                      { value: "Romance", label: "Romance" },
                      { value: "Horror", label: "Horror" },
                      { value: "Kids", label: "Kids" },
                      { value: "Family", label: "Family" },
                      // ... other genres
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Age Rating"
                  name="ageRating"
                  rules={[{ required: true, message: "Age rating is required!" }]}
                >
                  <Select
                    placeholder="Select age rating"
                    optionLabelProp="label"
                  >
                    {AGE_RATINGS.map(rating => (
                      <Select.Option 
                        key={rating.value} 
                        value={rating.value}
                        label={rating.value}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div
                            style={{
                              backgroundColor: rating.color,
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              marginRight: '8px',
                              fontWeight: 'bold'
                            }}
                          >
                            {rating.value}
                          </div>
                          <span>{rating.label}</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={16}>
                <Form.Item
                  label="Poster URL"
                  name="poster"
                  rules={[{ required: true, message: "Poster URL is required!" }]}
                >
                  <Input placeholder="Enter the poster URL" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>

        <Form.Item>
          <Button
            block
            type="primary"
            htmlType="submit"
            style={{ fontSize: "1rem", fontWeight: "600" }}
          >
            {formType === "add" ? "Add Movie" : "Update Movie"}
          </Button>

          <Button className="mt-3" block onClick={handleCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MovieForm;
