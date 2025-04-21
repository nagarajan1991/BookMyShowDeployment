import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Row, Col, Button, Modal, Form, Input, message, Select } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import moment from 'moment';
import { ShowLoading, HideLoading } from '../../redux/loaderSlice';
import { UpdateUserProfile } from '../../api/users'; // You'll need to create this API endpoint

const { Option } = Select;

function Profile() {
    const { user } = useSelector((state) => state.users);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        try {
            dispatch(ShowLoading());
            const response = await UpdateUserProfile({
                ...values,
                userId: user._id,
            });
            dispatch(HideLoading());
            if (response.success) {
                message.success(response.message);
                setIsModalVisible(false);
                // Update user in redux store if needed
            } else {
                message.error(response.message);
            }
        } catch (error) {
            dispatch(HideLoading());
            message.error(error.message);
        }
    };

    return (
        <div className="container mx-auto py-4">
            <Card className="profile-card">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Profile Information</h2>
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={() => {
                            form.setFieldsValue(user);
                            setIsModalVisible(true);
                        }}
                    >
                        Edit Profile
                    </Button>
                </div>

                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        <div className="detail-item">
                            <label>Name</label>
                            <p>{user?.name}</p>
                        </div>
                        <div className="detail-item">
                            <label>Email</label>
                            <p>{user?.email}</p>
                        </div>
                        <div className="detail-item">
                            <label>Phone Number</label>
                            <p>{user?.phoneNumber || 'Not provided'}</p>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="detail-item">
                            <label>Address</label>
                            <p>{user?.address || 'Not provided'}</p>
                        </div>
                        <div className="detail-item">
                            <label>Gender</label>
                            <p>{user?.gender || 'Not provided'}</p>
                        </div>
                        <div className="detail-item">
                            <label>Member Since</label>
                            <p>{moment(user?.createdAt).format('MMMM Do YYYY')}</p>
                        </div>
                    </Col>
                </Row>

                {/* Recent Bookings section can be added here */}
            </Card>

            <Modal
                title="Edit Profile"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={user}
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input your name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Phone Number"
                        name="phoneNumber"
                        rules={[
                            { required: true, message: 'Please input your phone number!' },
                            { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Address"
                        name="address"
                        rules={[{ required: true, message: 'Please input your address!' }]}
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                        label="Gender"
                        name="gender"
                        rules={[{ required: true, message: 'Please select your gender!' }]}
                    >
                        <Select>
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Update Profile
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Profile;
