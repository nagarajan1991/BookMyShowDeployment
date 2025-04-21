import { useEffect, useState } from "react";
import { Table, message, Button } from "antd";
import TheatreFormModal from "./TheatreFormModal";
import DeleteTheatreModal from "./DeleteTheatreModal";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { getAllTheatres } from "../../api/theatre";
import { useDispatch, useSelector } from "react-redux";
import { ShowLoading, HideLoading } from "../../redux/loaderSlice";
import ShowModal from "./ShowModal";

function TheatreList() {
  const { user } = useSelector((state) => state.users);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [formType, setFormType] = useState("add");
  const [theatres, setTheatres] = useState([]);
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllTheatres(user._id);

      if (response.success) {
        const alltheatres = response.data.map((theatre) => ({
          ...theatre,
          key: `theatre${theatre._id}`
        }));
        setTheatres(alltheatres);
      } else {
        message.error(response.message);
      }
    } catch (err) {
      console.log("Error from theatre list: ", err);
      message.error("Something went wrong");
    } finally {
      dispatch(HideLoading());
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (isActive) => (
        <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
          {isActive ? "Approved" : "Pending/Blocked"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => {
              setIsModalOpen(true);
              setFormType("edit");
              setSelectedTheatre(record);
            }}
          />
          
          <Button
            type="primary"
            danger
            ghost
            icon={<DeleteOutlined />}
            onClick={() => {
              setIsDeleteModalOpen(true);
              setSelectedTheatre(record);
            }}
          />

          {record.isActive && (
            <Button
              type="primary"
              onClick={() => {
                setIsShowModalOpen(true);
                setSelectedTheatre(record);
              }}
            >
              <PlusOutlined /> Shows
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="theatre-list-container">
      <div className="theatre-header">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setIsModalOpen(true);
            setFormType("add");
          }}
          className="add-theatre-btn"
        >
          Add Cinemas
        </Button>
      </div>

      <Table 
        dataSource={theatres} 
        columns={columns} 
        className="theatre-table"
        pagination={{ pageSize: 10 }}
      />

      {isModalOpen && (
        <TheatreFormModal
          isModalOpen={isModalOpen}
          selectedTheatre={selectedTheatre}
          setSelectedTheatre={setSelectedTheatre}
          setIsModalOpen={setIsModalOpen}
          formType={formType}
          getData={getData}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteTheatreModal
          isDeleteModalOpen={isDeleteModalOpen}
          selectedTheatre={selectedTheatre}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          setSelectedTheatre={setSelectedTheatre}
          getData={getData}
        />
      )}

      {isShowModalOpen && (
        <ShowModal
          isShowModalOpen={isShowModalOpen}
          setIsShowModalOpen={setIsShowModalOpen}
          selectedTheatre={selectedTheatre}
        />
      )}
    </div>
  );
}

export default TheatreList;
