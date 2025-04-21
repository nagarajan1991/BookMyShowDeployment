import { Table, Button, Badge, Space, message } from "antd";
import MovieForm from "./MovieForm";
import { ShowLoading, HideLoading } from "../../redux/loaderSlice";
import { getAllMovies } from "../../api/movie";
import { useDispatch } from "react-redux";
import moment from "moment";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import DeleteMovieModal from "./DeleteMovieModal";

const AGE_RATINGS = {
    'U': { color: '#4CAF50', label: 'Universal' },
    'PG': { color: '#8BC34A', label: 'Parental Guidance' },
    '12A': { color: '#FFC107', label: 'Ages 12 & over' },
    '15': { color: '#FF9800', label: 'Ages 15 & over' },
    '18': { color: '#F44336', label: 'Adults Only' }
};

function MovieList() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [formType, setFormType] = useState("add");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const dispatch = useDispatch();

    const tableHeading = [
        {
            title: "Poster",
            dataIndex: "poster",
            render: (text, data) => (
                <div style={{ 
                    width: "75px", 
                    height: "115px", 
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                    <img
                        width="75"
                        height="115"
                        style={{ 
                            objectFit: "cover",
                            width: "100%",
                            height: "100%"
                        }}
                        src={data.poster}
                        alt={data.title}
                    />
                </div>
            ),
            width: 100,
        },
        {
            title: "Movie Name",
            dataIndex: "title",
            sorter: (a, b) => a.title.localeCompare(b.title),
            render: (text) => (
                <span style={{ fontWeight: "500" }}>{text}</span>
            ),
            width: 60,
        },
        {
            title: "Duration",
            dataIndex: "duration",
            render: (text) => `${text} Mins`,
            sorter: (a, b) => a.duration - b.duration,
            width: 60,
        },
        {
            title: "Genre",
            dataIndex: "genre",
            filters: [
                { text: "Action", value: "Action" },
                { text: "Comedy", value: "Comedy" },
                { text: "Drama", value: "Drama" },
                { text: "Romance", value: "Romance" },
                { text: "Horror", value: "Horror" },
            ],
            onFilter: (value, record) => record.genre === value,
            width: 50,
        },
        {
            title: "Age Rating",
            dataIndex: "ageRating",
            filters: Object.entries(AGE_RATINGS).map(([key, value]) => ({
                text: value.label,
                value: key,
            })),
            onFilter: (value, record) => record.ageRating === value,
            width: 10,
        },
        {
            title: "Release Date",
            dataIndex: "releaseDate",
            render: (text) => moment(text).format("MMM DD, YYYY"),
            sorter: (a, b) => moment(a.releaseDate).unix() - moment(b.releaseDate).unix(),
            width: 130,
        },
        {
            title: "Action",
            width: 120,
            render: (text, record) => (
                <Space>
                    <Button
                        type="primary"
                        ghost
                        icon={<EditOutlined />}
                        onClick={() => {
                            setIsModalOpen(true);
                            setSelectedMovie(record);
                            setFormType("edit");
                        }}
                    />
                    <Button
                        type="primary"
                        danger
                        ghost
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            setIsDeleteModalOpen(true);
                            setSelectedMovie(record);
                        }}
                    />
                </Space>
            ),
        },
    ];

    const getData = async () => {
        try {
            dispatch(ShowLoading());
            const response = await getAllMovies();
            if (response.success) {
                setMovies(
                    response.data.map((item) => ({
                        ...item,
                        key: `movie${item._id}`
                    }))
                );
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error("Something went wrong");
            console.error('Error fetching movies:', error);
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="container">
            <div style={{
                padding: "20px",
                background: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px"
                }}>
                    <h2 style={{ margin: 0 }}>Movies List</h2>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setIsModalOpen(true);
                            setFormType("add");
                            setSelectedMovie(null);
                        }}
                    >
                        Add Movie
                    </Button>
                </div>

                <Table 
                    dataSource={movies} 
                    columns={tableHeading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} movies`,
                        showQuickJumper: true,
                    }}
                    scroll={{ x: 1300 }}
                    bordered
                    style={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                    }}
                />

                {isModalOpen && (
                    <MovieForm
                        isModalOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                        formType={formType}
                        getData={getData}
                        selectedMovie={selectedMovie}
                        setSelectedMovie={setSelectedMovie}
                    />
                )}

                {isDeleteModalOpen && (
                    <DeleteMovieModal
                        isDeleteModalOpen={isDeleteModalOpen}
                        setIsDeleteModalOpen={setIsDeleteModalOpen}
                        getData={getData}
                        selectedMovie={selectedMovie}
                        setSelectedMovie={setSelectedMovie}
                    />
                )}
            </div>
        </div>
    );
}

export default MovieList;
