'use client';

import { useState } from 'react';
import { Card, Button, Input, Form, Typography, Alert } from 'antd';
import { MailOutlined, LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import '../style/Login.css'; // Import your external CSS file
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function Component() {
    const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    console.log(isLogin ? 'Logging in...' : 'Signing up...', { email, password });
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" bordered={false}>
        <div className="header-container">
          <div className="app-logo">Med.Doc</div>
        </div>
        <Title level={3} className="auth-title">
          {isLogin ? 'Login to your account' : 'Create an account'}
        </Title>
        <Text className="auth-description">
          {isLogin
            ? 'Enter your email below to login to your account'
            : 'Enter your email below to create your account'}
        </Text>
        <Form layout="vertical" onFinish={handleSubmit} className="auth-form">
          <Form.Item label="Username" required>
            <Input
              prefix={<MailOutlined />}
              placeholder="Himanshu Sharma"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Password" required>
            <Input.Password
              prefix={<LockOutlined />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
          {!isLogin && (
            <Form.Item label="Confirm Password" required>
              <Input.Password
                prefix={<LockOutlined />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Item>
          )}
          {error && (
            <Alert
              message={error}
              type="error"
              icon={<ExclamationCircleOutlined />}
              showIcon
              className="error-message"
            />
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" block onClick={()=>navigate("/Main")}>
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="link" onClick={() => setIsLogin(!isLogin)} block>
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
