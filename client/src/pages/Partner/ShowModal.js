import {
  Col,
  Modal,
  Row,
  Form,
  Input,
  Button,
  Select,
  Table,
  message,
} from "antd";
import { ShowLoading, HideLoading } from "../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getAllMovies } from "../../api/movie";
import {
  addShow,
  deleteShow,
  getShowsByTheatre,
  updateShow,
} from "../../api/shows";
import moment from "moment";
import { DatePicker, Checkbox, Tag } from "antd";
const { RangePicker } = DatePicker;

const ShowModal = ({ isShowModalOpen, setIsShowModalOpen, selectedTheatre }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [view, setView] = useState("table");
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('daily');
  const [selectedDays, setSelectedDays] = useState([]);
  const [exceptions, setExceptions] = useState([]);

  const handleCancel = () => {
    setIsShowModalOpen(false);
    setSelectedShow(null);
    setView("table");
    form.resetFields();
  };

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const moviesResponse = await getAllMovies();
      if (moviesResponse.success) {
        setMovies(moviesResponse.data);
      } else {
        message.error(moviesResponse.message);
      }

      const showsResponse = await getShowsByTheatre({
        theatreId: selectedTheatre._id,
      });
      if (showsResponse.success) {
        setShows(showsResponse.data);
      } else {
        message.error(showsResponse.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(HideLoading());
    }
  };

  const onFinish = async (values) => {
    try {
      await form.validateFields();
      dispatch(ShowLoading());
  
      if (isRecurring && values.dateRange) {
        // Handle recurring shows
        const startDate = moment(values.dateRange[0]);
        const endDate = moment(values.dateRange[1]);
        let currentDate = startDate.clone();
        let successCount = 0;
        let failCount = 0;
  
        while (currentDate.isSameOrBefore(endDate)) {
          // Skip exception dates
          if (!exceptions.some(date => moment(date).isSame(currentDate, 'day'))) {
            let shouldAddShow = false;
  
            if (recurrencePattern === 'weekly') {
              // For weekly pattern, check if the current day is selected
              const dayName = currentDate.format('dddd').toLowerCase();
              shouldAddShow = selectedDays.includes(dayName);
            } else if (recurrencePattern === 'daily') {
              // For daily pattern, add all days
              shouldAddShow = true;
            }
  
            if (shouldAddShow) {
              const showData = {
                ...values,
                theatre: selectedTheatre._id,
                date: currentDate.format('YYYY-MM-DD'),
                ticketPrice: Number(values.ticketPrice),
                totalSeats: Number(values.totalSeats),
                availableSeats: Number(values.totalSeats)
              };
  
              try {
                const response = await addShow(showData);
                if (response.success) {
                  successCount++;
                } else {
                  failCount++;
                }
              } catch (err) {
                failCount++;
                console.log(`Failed to create show for date ${currentDate.format('YYYY-MM-DD')}:`, err);
              }
            }
          }
          currentDate.add(1, 'days');
        }
  
        if (successCount > 0) {
          message.success(`Successfully created ${successCount} shows${failCount > 0 ? ` (${failCount} failed)` : ''}`);
          getData();
          setView("table");
          form.resetFields();
          // Reset recurring show states
          setIsRecurring(false);
          setRecurrencePattern('daily');
          setSelectedDays([]);
          setExceptions([]);
        } else {
          message.error("Failed to create any shows");
        }
  
      } else {
        // Handle single show (your existing logic)
        const showData = {
          ...values,
          theatre: selectedTheatre._id,
          date: moment(values.date).format('YYYY-MM-DD'),
          ticketPrice: Number(values.ticketPrice),
          totalSeats: Number(values.totalSeats),
          availableSeats: Number(values.totalSeats)
        };
  
        let response = null;
  
        if (view === "form") {
          response = await addShow(showData);
        } else {
          response = await updateShow({
            ...showData,
            showId: selectedShow._id,
          });
        }
  
        if (response.success) {
          message.success(response.message);
          getData();
          setView("table");
          form.resetFields();
        } else {
          message.error(response.message);
        }
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(HideLoading());
    }
  };
  

  const handleDelete = async (showId) => {
    try {
      dispatch(ShowLoading());
      const response = await deleteShow({ showId });
      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(HideLoading());
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (text) => moment(text).format("MMM Do YYYY"),
    },
    {
      title: "Time",
      dataIndex: "time",
    },
    {
      title: "Movie",
      dataIndex: "movie",
      render: (text, record) => record.movie.title,
    },
    {
      title: "Ticket Price",
      dataIndex: "ticketPrice",
    },
    {
      title: "Total Seats",
      dataIndex: "totalSeats",
    },
    {
      title: "Available Seats",
      dataIndex: "availableSeats",
      render: (text, record) => record.totalSeats - record.bookedSeats?.length,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => (
        <div className="d-flex gap-2">
          <EditOutlined
            onClick={() => {
              setSelectedShow(record);
              setView("edit");
            }}
          />
          <DeleteOutlined onClick={() => handleDelete(record._id)} />
        </div>
      ),
    },
  ];

  // Form management useEffect
  useEffect(() => {
    if (view === 'form') {
      form.resetFields();
    } else if (view === 'edit' && selectedShow) {
      form.setFieldsValue({
        ...selectedShow,
        date: moment(selectedShow.date).format('YYYY-MM-DD'),
        movie: selectedShow.movie._id
      });
    }
  }, [view, selectedShow, form]);

  // Initial data loading
  useEffect(() => {
    getData();
  }, []);

  return (
    <Modal
      centered
      title={selectedTheatre.name}
      open={isShowModalOpen}
      onCancel={handleCancel}
      width={1200}
      footer={null}
      className="show-modal"
    >
      <div className="d-flex justify-content-between mb-3">
        <h3 className="modal-section-title">
          {view === "table"
            ? "List of Shows"
            : view === "form"
            ? "Add Show"
            : "Edit Show"}
        </h3>
        {view === "table" && (
          <Button type="primary" onClick={() => setView("form")}>
            Add Show
          </Button>
        )}
      </div>

      {view === "table" && <Table dataSource={shows} columns={columns} />}

      {(view === "form" || view === "edit") && (
  <Form
    form={form}
    layout="vertical"
    className="show-form"
    onFinish={onFinish}
  >
    <Row gutter={[24, 16]}>
      {/* Recurring Show Option */}
      {view === "form" && (
        <Col span={24}>
          <Form.Item label="Recurring Show">
            <Checkbox
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            >
              Make this a recurring show
            </Checkbox>
          </Form.Item>
        </Col>
      )}

      {/* Date Selection */}
      <Col xs={24} sm={12} md={8}>
        {isRecurring ? (
          <Form.Item
            label="Date Range"
            name="dateRange"
            rules={[/* your existing rules */]}
          >
            <RangePicker
              style={{ width: '100%' }}
              disabledDate={(current) => {/* your existing logic */}}
            />
          </Form.Item>
        ) : (
          <Form.Item
            label="Show Date"
            name="date"
            rules={[/* your existing rules */]}
          >
            <Input type="date" /* your existing props */ />
          </Form.Item>
        )}
      </Col>

      {/* Recurrence Pattern */}
      {isRecurring && (
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Recurrence Pattern">
            <Select
              value={recurrencePattern}
              onChange={setRecurrencePattern}
            >
              <Select.Option value="daily">Daily</Select.Option>
              <Select.Option value="weekly">Weekly</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      )}

      {/* Weekly Pattern Days */}
      {isRecurring && recurrencePattern === 'weekly' && (
        <Col span={24}>
          <Form.Item label="Select Days">
            <Checkbox.Group
              options={[/* your existing options */]}
              value={selectedDays}
              onChange={setSelectedDays}
            />
          </Form.Item>
        </Col>
      )}

{/* Exception Dates */}
{isRecurring && (
  <Col span={24}>
    <Form.Item label="Add Exception Dates (Skip Dates)">
      <DatePicker
        onChange={(date) => {
          if (date) {
            // Check if date is already in exceptions
            if (!exceptions.some(existingDate => 
              moment(existingDate).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD')
            )) {
              setExceptions([...exceptions, date]);
            } else {
              message.warning('This date is already added as an exception');
            }
          }
        }}
        disabledDate={(current) => {
          const dateRange = form.getFieldValue('dateRange');
          if (!dateRange) {
            return true; // Disable all dates if no date range is selected
          }
          
          // Disable dates outside the selected range
          const [startDate, endDate] = dateRange;
          const isOutOfRange = current.isBefore(startDate, 'day') || 
                              current.isAfter(endDate, 'day');

          // Disable already selected exception dates
          const isException = exceptions.some(date => 
            moment(date).format('YYYY-MM-DD') === current.format('YYYY-MM-DD')
          );

          return isOutOfRange || isException;
        }}
        style={{ width: '200px' }}
      />
      <div style={{ marginTop: 8 }}>
        {exceptions.length > 0 && (
          <div>
            <h4>Exception Dates:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {exceptions.map((date, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => {
                    const newExceptions = exceptions.filter((_, i) => i !== index);
                    setExceptions(newExceptions);
                  }}
                  style={{ 
                    padding: '4px 8px',
                    marginBottom: '8px',
                    background: '#f5f5f5',
                    borderRadius: '4px'
                  }}
                >
                  {moment(date).format('YYYY-MM-DD')}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    </Form.Item>
  </Col>
)}


      {/* Show Time */}
      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Show Time"
          name="time"
          dependencies={['date']}
          rules={[/* your existing rules */]}
        >
          <Input type="time" />
        </Form.Item>
      </Col>

      {/* Movie Selection */}
      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Select Movie"
          name="movie"
          rules={[{ required: true, message: "Movie is required!" }]}
        >
          <Select
            placeholder="Select Movie"
            options={movies?.map((movie) => ({
              value: movie._id,
              label: movie.title,
            }))}
            onChange={(value) => {
              const movie = movies.find(m => m._id === value);
              setSelectedMovie(movie);
            }}
          />
        </Form.Item>
      </Col>

      {/* Ticket Price */}
      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Ticket Price"
          name="ticketPrice"
          rules={[/* your existing rules */]}
        >
          <Input 
            type="number"
            min="1"
            max="10000"
            onChange={(e) => form.setFieldsValue({ 
              ticketPrice: Number(e.target.value) 
            })}
            placeholder="Enter ticket price"
          />
        </Form.Item>
      </Col>

      {/* Total Seats */}
      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Total Seats"
          name="totalSeats"
          rules={[/* your existing rules */]}
        >
          <Input
            type="number"
            min="1"
            max="500"
            onChange={(e) => {
              const value = Number(e.target.value);
              form.setFieldsValue({ 
                totalSeats: value 
              });
            }}
            placeholder="Enter the number of total seats"
          />
        </Form.Item>
      </Col>
    </Row>

    {/* Form Actions */}
    <div className="form-actions">
      <Button 
        onClick={() => {
          setView("table");
          form.resetFields();
        }} 
        className="back-button me-3"
      >
        <ArrowLeftOutlined /> Go Back
      </Button>
      <Button type="primary" htmlType="submit">
        {view === "form" ? "Add Show" : "Update Show"}
      </Button>
    </div>
  </Form>
)}

    </Modal>
  );
};

export default ShowModal;
