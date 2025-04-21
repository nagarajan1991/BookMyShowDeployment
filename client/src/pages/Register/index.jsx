// Register.js
import React from "react";
import { Form, Input, Button, message, Select, Radio } from "antd"; // Added Select to imports
import { Link, useNavigate } from "react-router-dom";
import { RegisterUser } from "../../api/users";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../redux/loaderSlice";
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';


const { Option } = Select; // Destructure Option from Select

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const styles = {
    containerFluid: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    },
    formContainer: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px',
      margin: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '2rem',
      color: '#1a1a1a'
    },
    form: {
      width: '100%'
    },
    formItem: {
      marginBottom: '1rem'
    },
    input: {
      padding: '8px 12px',
      borderRadius: '4px'
    },
    button: {
      width: '100%',
      height: '40px',
      fontSize: '16px',
      marginTop: '1rem'
    },
    link: {
      display: 'block',
      textAlign: 'center',
      marginTop: '1rem',
      color: '#1890ff',
      textDecoration: 'none'
    },
    divider: {
      margin: '1rem 0',
      borderTop: '1px solid #f0f0f0',
      position: 'relative'
    },
    dividerText: {
      position: 'absolute',
      top: '-13px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'white',
      padding: '0 1rem',
      color: '#666',
      fontSize: '14px'
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: '15px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '800px', // Increased to accommodate two columns
        position: 'relative',
        overflow: 'hidden'
      },
      formRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr'
        }
      },
      fullWidth: {
        gridColumn: '1 / -1' // Spans full width
      }
    };

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await RegisterUser(values);
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        navigate("/login");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  return (
    <div style={styles.containerFluid}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>
          Create Account
          <div style={styles.titleUnderline}></div>
        </h2>
        <Form
          layout="vertical"
          style={styles.form}
          onFinish={onFinish}
        >
          <div style={styles.formRow}>
            {/* First Column */}
            <Form.Item
              label="Name"
              name="name"
              style={styles.formItem}
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                style={styles.input} 
                placeholder="Enter your name" 
              />
            </Form.Item>

            {/* Second Column */}
            <Form.Item
              label="Email"
              name="email"
              style={styles.formItem}
              rules={[
                { required: true, message: "Please input your email!" },
                { type: 'email', message: "Please enter a valid email!" }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                style={styles.input} 
                placeholder="Enter your email" 
              />
            </Form.Item>
          </div>

          <div style={styles.formRow}>
            <Form.Item
              label="Password"
              name="password"
              style={styles.formItem}
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters!" }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                style={styles.input} 
                placeholder="Enter your password" 
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              style={styles.formItem}
              dependencies={['password']}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                style={styles.input} 
                placeholder="Confirm your password" 
              />
            </Form.Item>
          </div>

          <div style={styles.formRow}>
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              style={styles.formItem}
              rules={[{ pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number!' }]}
            >
              <Input 
                prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                style={styles.input} 
                placeholder="Enter your phone number" 
              />
            </Form.Item>

            <Form.Item
              label="Gender"
              name="gender"
              style={styles.formItem}
            >
              <Select 
                placeholder="Select your gender" 
                style={styles.select}
                dropdownStyle={{ borderRadius: '8px' }}
              >
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Full Width Address Field */}
          <div style={{...styles.formRow, ...styles.fullWidth}}>
            <Form.Item
              label="Address"
              name="address"
              style={styles.formItem}
            >
              <Input.TextArea 
                prefix={<HomeOutlined style={{ color: '#bfbfbf' }} />}
                style={{...styles.input, ...styles.textArea}} 
                placeholder="Enter your address"
                rows={3}
              />
            </Form.Item>
  <Form.Item
    label="Register as a partner"
    name="role"
    initialValue="user"
    rules={[{ required: true, message: "Please select an option" }]}
    style={styles.formItem}
  >
    <Radio.Group>
      <div style={styles.radioGroup}>
        <Radio value="partner">
          Yes
          <span style={styles.radioHint}>
            (Theatre partners can list their theatres and manage shows)
          </span>
        </Radio>
        <Radio value="user">No</Radio>
      </div>
    </Radio.Group>
  </Form.Item>
</div>

          {/* Full Width Button */}
          <div style={{...styles.formRow, ...styles.fullWidth}}>
            <Button 
              type="primary" 
              htmlType="submit"
              style={styles.button}
            >
              Create Account
            </Button>
          </div>

          <div style={{...styles.formRow, ...styles.fullWidth}}>
            <div style={styles.divider}>
              <span style={styles.dividerText}>OR</span>
            </div>
          </div>

          <div style={{...styles.formRow, ...styles.fullWidth}}>
            <Link to="/login" style={styles.link}>
              Already have an account? Login
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Register;