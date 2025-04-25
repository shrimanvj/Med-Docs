import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Layout, Space, Card, Modal } from 'antd';
import { UserOutlined, MedicineBoxOutlined, SafetyOutlined, BlockOutlined, CloudUploadOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const LandingPage = () => {
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null); // 'patient' or 'doctor'

  const features = [
    {
      icon: <BlockOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: 'Blockchain Security',
      description: 'Your medical documents are secured using blockchain technology, ensuring tamper-proof storage.'
    },
    {
      icon: <CloudUploadOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      title: 'IPFS Storage',
      description: 'Documents are stored on IPFS, providing decentralized and reliable access.'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      title: 'Access Control',
      description: 'Grant and revoke access to your medical documents with complete control.'
    },
    {
      icon: <TeamOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      title: 'Doctor Verification',
      description: 'Verified healthcare providers can securely access shared documents.'
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content>
        {/* Hero Section */}
        <div style={{ 
          padding: '80px 20px',
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          textAlign: 'center',
          color: 'white'
        }}>
          <Title style={{ color: 'white', fontSize: '48px', marginBottom: '24px' }}>
            Welcome to MED-DOCS
          </Title>
          <Text style={{ 
            fontSize: '20px',
            display: 'block',
            marginBottom: '40px',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            A Secure Blockchain-Based Medical Document Management System
          </Text>
          <Button 
            type="primary" 
            size="large"
            style={{ 
              height: '50px',
              padding: '0 40px',
              fontSize: '18px',
              background: 'white',
              color: '#1890ff',
              border: 'none'
            }}
            onClick={() => setShowRoleModal(true)}
          >
            Get Started
          </Button>
        </div>

        {/* Features Section */}
        <div style={{ maxWidth: 1200, margin: '60px auto', padding: '0 20px' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            Key Features
          </Title>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            {features.map((feature, index) => (
              <Card key={index} style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '16px' }}>{feature.icon}</div>
                <Title level={4}>{feature.title}</Title>
                <Text>{feature.description}</Text>
              </Card>
            ))}
          </div>
        </div>

        {/* Role Selection Modal */}
        <Modal
          title="Choose Your Role"
          open={showRoleModal}
          onCancel={() => setShowRoleModal(false)}
          footer={null}
          width={400}
          centered
        >
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '30px' }}>
              <Button 
                type="primary" 
                icon={<UserOutlined />}
                size="large" 
                block
                style={{
                  height: '50px',
                  fontSize: '16px',
                  marginBottom: '10px',
                  background: '#1890ff'
                }}
                onClick={() => navigate('/signup')}
              >
                I'm a Patient
              </Button>
              <div style={{ textAlign: 'center', color: '#666', padding: '0 20px' }}>
                Access and manage your medical documents securely
              </div>
            </div>

            <div>
              <Button 
                type="primary" 
                icon={<MedicineBoxOutlined />}
                size="large" 
                block
                style={{
                  height: '50px',
                  fontSize: '16px',
                  marginBottom: '10px',
                  background: '#1890ff'
                }}
                onClick={() => navigate('/doctor-register')}
              >
                I'm a Doctor
              </Button>
              <div style={{ textAlign: 'center', color: '#666', padding: '0 20px' }}>
                Register as a healthcare provider
              </div>
            </div>
          </div>
          <div style={{ 
            display: 'flex',
            gap: '24px',
            padding: '20px 0',
            flexWrap: 'wrap'
          }}>
            {/* Patient Card */}
            <Card 
              style={{ flex: 1, minWidth: '250px' }}
              hoverable
              onClick={() => navigate('/patient-login')}
            >
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <UserOutlined style={{ fontSize: '36px', color: '#1890ff' }} />
                <Title level={4}>I'm a Patient</Title>
                <Text>Access and manage your medical documents securely</Text>
              </Space>
            </Card>

            {/* Doctor Card */}
            <Card 
              style={{ flex: 1, minWidth: '250px' }}
              hoverable
              onClick={() => navigate('/doctor-register')}
            >
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <MedicineBoxOutlined style={{ fontSize: '36px', color: '#52c41a' }} />
                <Title level={4}>I'm a Doctor</Title>
                <Text>Register as a healthcare provider</Text>
              </Space>
            </Card>
          </div>
        </Modal>
      </Content>
    </Layout>
  );
};

export default LandingPage;
