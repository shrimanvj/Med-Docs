import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const PatientLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      message.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      message.error('Failed to login: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5',
      padding: '20px'
    }}>
      <Card style={{ width: '100%', maxWidth: 400 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Patient Login
        </Title>
        <Form
          name="patient_login"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Login
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default PatientLoginPage;
