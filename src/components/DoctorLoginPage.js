import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initWeb3 } from '../utils/web3Config';

const { Title } = Typography;

const DoctorLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // First authenticate with email/password
      await login(values.email, values.password);

      // Then verify doctor status on blockchain
      const { contract, signer } = await initWeb3();
      
      // Verify if the address is registered as a doctor
      const address = await signer.getAddress();
      const doctorInfo = await contract.doctors(address);
      
      if (!doctorInfo.isRegistered) {
        message.error('This account is not registered as a doctor');
        return;
      }

      message.success('Successfully logged in as doctor!');
      navigate('/doctor-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      message.error('Failed to login: ' + (error.message || error.reason || 'Unknown error'));
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
          Doctor Login
        </Title>
        <Form
          name="doctor_login"
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
            Not registered yet? {' '}
            <Button type="link" onClick={() => navigate('/doctor-register')}>
              Register here
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default DoctorLoginPage;
