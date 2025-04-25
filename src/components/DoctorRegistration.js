import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useAuth } from '../context/AuthContext';

const DoctorRegistration = ({ contract }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const tx = await contract.registerDoctor(values.name, values.specialization);
      await tx.wait();
      message.success('Successfully registered as a doctor!');
    } catch (error) {
      console.error('Error registering doctor:', error);
      message.error('Failed to register as doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      <h2>Register as Doctor</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Full Name"
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
        >
          <Input placeholder="Enter your full name" />
        </Form.Item>

        <Form.Item
          label="Specialization"
          name="specialization"
          rules={[{ required: true, message: 'Please input your specialization!' }]}
        >
          <Input placeholder="Enter your medical specialization" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Register as Doctor
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DoctorRegistration;
