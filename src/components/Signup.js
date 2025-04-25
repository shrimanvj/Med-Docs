import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await signup(values.email, values.password, values.name);
      message.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      message.error('Signup failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h1>Create MED DOCS Account</h1>
      <Form
        name="signup"
        onFinish={onFinish}
        layout="vertical"
        className="signup-form"
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
        >
          <Input 
            placeholder="Full Name" 
            size="large"
            className="signup-input"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input 
            placeholder="Email" 
            size="large"
            className="signup-input"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 6, message: 'Password must be at least 6 characters!' }
          ]}
        >
          <Input.Password 
            placeholder="Password" 
            size="large"
            className="signup-input"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
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
            placeholder="Confirm Password" 
            size="large"
            className="signup-input"
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            block
            size="large"
            className="signup-button"
          >
            Sign up
          </Button>
        </Form.Item>

        <div className="login-link">
          Already have an account? <Link to="/patient-login">Log in</Link>
        </div>
      </Form>
    </div>
  );
};

export default Signup;
