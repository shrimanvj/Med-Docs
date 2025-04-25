import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initWeb3 } from '../utils/web3Config';

const { Title } = Typography;

const DoctorRegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Initialize Web3 first to check connection
      let web3Data;
      try {
        web3Data = await initWeb3();
        console.log('Web3 initialized successfully');
      } catch (web3Error) {
        console.error('Web3 initialization error:', web3Error);
        message.error('Please make sure MetaMask is connected to Hardhat Local network');
        return;
      }

      // Then register the doctor's account
      await signup(values.email, values.password);

      const { contract, signer } = web3Data;
      const address = await signer.getAddress();
      console.log('Connected with address:', address);

      // Register as doctor in the smart contract
      console.log('Attempting to register doctor...');
      console.log('Name:', values.name);
      console.log('Specialization:', values.specialization);
      
      const gasPrice = await signer.provider.getGasPrice();
      console.log('Current gas price:', gasPrice.toString());
      
      const tx = await contract.registerDoctor(values.name, values.specialization, {
        gasLimit: 500000, // Increased gas limit
        gasPrice: gasPrice
      });
      
      console.log('Transaction sent:', tx.hash);
      message.info('Please wait for transaction confirmation...');
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);

      message.success('Successfully registered as doctor!');
      navigate('/doctor-login');
    } catch (error) {
      console.error('Registration error:', error);
      
      if (!window.ethereum) {
        message.error('Please install MetaMask first!');
        return;
      }

      // Handle specific error cases
      if (error.code === 4001) {
        message.error('You rejected the transaction. Please try again.');
      } else if (error.code === -32603) {
        message.error('Internal blockchain error. Please check your MetaMask connection and network.');
      } else if (error.message.includes('user rejected')) {
        message.error('You rejected the transaction. Please try again.');
      } else if (error.message.includes('already registered')) {
        message.error('This wallet address is already registered as a doctor.');
      } else {
        message.error('Registration failed: ' + (error.reason || error.message || 'Unknown error'));
      }
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
          Register as Doctor
        </Title>
        <Form
          name="doctor_register"
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

          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your full name!' }]}
          >
            <Input placeholder="Full Name" size="large" />
          </Form.Item>

          <Form.Item
            name="specialization"
            rules={[{ required: true, message: 'Please input your specialization!' }]}
          >
            <Input placeholder="Medical Specialization" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Register
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            Already registered? {' '}
            <Button type="link" onClick={() => navigate('/doctor-login')}>
              Login here
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default DoctorRegisterPage;
