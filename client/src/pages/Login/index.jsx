import React from 'react';
import { Button, Form, Input, message, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, LinkedinOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LoginUser } from '../../api/users';
import styled from 'styled-components';

const { Title, Text } = Typography;

const LoginContainer = styled.div`
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .ant-card-body {
    padding: 32px;
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 24px;
  
  h1 {
    color: var(--primary-color);
    font-size: 28px;
    font-weight: 700;
    margin: 0;
  }
  
  p {
    color: var(--text-light);
    margin-top: 8px;
  }
`;

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 20px;
  }

  .ant-input-affix-wrapper {
    padding: 12px;
    border-radius: 6px;
  }

  .login-button {
    height: 45px;
    font-size: 16px;
    font-weight: 500;
  }
`;

const LinksContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  
  a {
    color: var(--primary-color);
    &:hover {
      text-decoration: underline;
    }
  }
`;

const CreatorInfo = styled.div`
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;

  p {
    margin-bottom: 8px;
    color: rgba(0, 0, 0, 0.65);
  }

  .linkedin-link {
    color: #0077b5;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      const response = await LoginUser(values);
      if (response.success) {
        message.success(response.message);
        
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        switch (response.data.user.role) {
          case "admin":
            navigate("/admin");
            break;
          case "partner":
            navigate("/partner");
            break;
          default:
            navigate("/");
        }
      } else {
        message.error(response.message);
      }
    } catch (err) {
      message.error(err.message);
    }
  };

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (token && user) {
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "partner":
          navigate("/partner");
          break;
        default:
          navigate("/");
      }
    }
  }, [navigate]);

  return (
    <LoginContainer>
      <StyledCard>
        <LogoContainer>
          <h1>BookMyShow</h1>
          <p>Welcome back! Please login to continue</p>
        </LogoContainer>
        
        <StyledForm
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email id.' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email Address"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 5, message: 'Password must be at least 5 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          <LinksContainer>
            <Link to="/register">New User? Register Here</Link>
            <Link to="/forgot-password">Forgot Password?</Link>
          </LinksContainer>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              className="login-button"
            >
              Login
            </Button>
          </Form.Item>
        </StyledForm>

        <CreatorInfo>
          <p>Created by Naga Lakshmanan</p>
          <a
            href="https://www.linkedin.com/in/nagalakshmanan/"
            target="_blank"
            rel="noopener noreferrer"
            className="linkedin-link"
          >
            <LinkedinOutlined /> Connect on LinkedIn
          </a>
        </CreatorInfo>
      </StyledCard>
    </LoginContainer>
  );
}

export default Login;
