// client/src/components/ProtectedRoute.js

// Keep all your existing imports
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from 'react-router-dom';
import { GetCurrentUser } from "../api/users";
import { SetUser } from "../redux/userSlice";
import { message, Layout, Menu } from "antd";
import { ShowLoading, HideLoading } from "../redux/loaderSlice";
import { LinkedinOutlined } from "@ant-design/icons";
import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

function ProtectedRoute({ children }) {
  const { user } = useSelector(state => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

// CHANGE #1: Update this function in ProtectedRoute.js
const isPathAllowed = (userRole, path) => {
  const allowedPaths = {
    user: ['/', '/movie', '/profile', '/book-show'], // Updated paths for user
    partner: ['/', '/partner'],
    admin: ['/', '/admin']
  };

  // Check if the current path starts with any of the allowed paths
  return allowedPaths[userRole]?.some(allowedPath => 
    path.startsWith(allowedPath)
  ) || false;
};


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(SetUser(null));
    navigate("/login");
  };

  // CHANGE #2: Combine the effects into one
  useEffect(() => {
    const validateUserAndAccess = async () => {
      // If no token, redirect to login
      if (!localStorage.getItem("token")) {
        navigate("/login");
        return;
      }

      // If we have a user, check path access
      if (user) {
        if (!isPathAllowed(user.role, location.pathname)) {
          message.error({
            content: "Unauthorized access",
            key: "unauthorized", // Add this to prevent duplicate messages
            duration: 2
          });
          
          // Redirect based on role
          switch (user.role) {
            case 'admin':
              navigate('/admin');
              break;
            case 'partner':
              navigate('/partner');
              break;
            default:
              navigate('/');
          }
        }
        return;
      }

      // If no user but have token, fetch user data
      try {
        dispatch(ShowLoading());
        const response = await GetCurrentUser();
        if (response.success) {
          dispatch(SetUser(response.data));
        } else {
          handleLogout();
        }
      } catch (error) {
        handleLogout();
      } finally {
        dispatch(HideLoading());
      }
    };

    validateUserAndAccess();
  }, [location.pathname, user]);

  // CHANGE #3: Simplify the render condition
  if (!user) {
    return null;
  }

  // Keep all your existing navItems and return JSX the same
  const navItems = [
    {
      key: '/',
      icon: <HomeOutlined style={{ fontSize: '18px' }} />,
      label: <span onClick={() => navigate("/")} className="clickable-link" 
        style={{ fontSize: '16px', fontWeight: '500' }}>Home</span>,
    },
    ...(user?.role === 'partner' ? [{
      key: '/partner',
      icon: <ProfileOutlined style={{ fontSize: '18px' }} />,
      label: <span onClick={() => navigate("/partner")} className="clickable-link" 
        style={{ fontSize: '16px', fontWeight: '500' }}>Partner</span>,
    }] : []),
    ...(user?.role === 'admin' ? [{
      key: '/admin',
      icon: <ProfileOutlined style={{ fontSize: '18px' }} />,
      label: <span onClick={() => navigate("/admin")} className="clickable-link" 
        style={{ fontSize: '16px', fontWeight: '500' }}>Admin</span>,
    }] : []),
    {
      key: 'user',
      label: (
        <div className="user-menu-item">
          <UserOutlined className="user-icon" />
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-type">Type: {user?.role || ''}</span>
          </div>
        </div>
      ),
      children: [
        {
          key: 'profile',
          icon: <ProfileOutlined />,
          label: 'My Profile',
          onClick: () => {
            switch (user?.role) {
              case 'admin':
                navigate("/admin");
                break;
              case 'partner':
                navigate("/partner");
                break;
              default:
                navigate("/profile");
            }
          }
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          onClick: handleLogout
        }
      ]
    }
  ];

  return (
    <Layout>
        <Header className="header">
  <div className="header-content">
    <div className="logo">
    <h3 onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>BookMyShow</h3>
      <a 
        href="https://www.linkedin.com/in/nagalakshmanan/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="creator-link"
      >
        by Naga Lakshmanan <LinkedinOutlined />
      </a>
    </div>

<div className="menu-container">
  {/* Main Menu */}
  <Menu
    theme="dark"
    mode="horizontal"
    selectedKeys={[location.pathname === '/profile' ? '' : location.pathname]}
    className="main-menu"
    items={navItems.filter(item => item.key !== 'user')}
  />

  {/* User Menu */}
  <Menu
    theme="dark"
    mode="horizontal"
    selectedKeys={[location.pathname === '/profile' ? 'profile' : '']}
    className="user-menu"
  >
    <Menu.SubMenu
      key="user"
      title={
        <div className="user-menu-item">
          <UserOutlined className="user-icon" />
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-type">{user?.role || ''}</span>
          </div>
        </div>
      }
    >
      <Menu.Item 
        key="profile" 
        icon={<ProfileOutlined />}
        onClick={() => {
          if (user?.role === 'admin') navigate("/admin");
          else if (user?.role === 'partner') navigate("/partner");
          else navigate("/profile");
        }}
      >
        My Profile
      </Menu.Item>
      <Menu.Item 
        key="logout" 
        icon={<LogoutOutlined />} 
        onClick={handleLogout}
      >
        Logout
      </Menu.Item>
    </Menu.SubMenu>
  </Menu>
</div>

        </div>
      </Header>
      <div className="content-container">
        {children}
      </div>
    </Layout>
  );
}  

export default ProtectedRoute;
