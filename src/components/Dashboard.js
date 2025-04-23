import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Layout, Menu } from 'antd';
import { LogoutOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;

const Dashboard = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = useMemo(() => [
    {
      key: 'upload',
      icon: <UploadOutlined />,
      label: 'Upload Documents'
    }
  ], []);

  return (
    <Layout className="layout">
      <Header style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
          <div className="logo" style={{ color: 'white', fontSize: '18px' }}>
            MED DOCS
          </div>
          <Menu 
            theme="dark" 
            mode="horizontal" 
            selectedKeys={[]} 
            items={menuItems}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'white' }}>
              <UserOutlined /> {user?.email}
            </span>
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </Header>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </Content>
    </Layout>
  );
};

export default Dashboard;
