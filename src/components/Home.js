import React from 'react';
import { Button, Typography, Space, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SecurityScanOutlined, SafetyOutlined, BlockOutlined } from '@ant-design/icons';
import '../styles/Home.css';

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero-section">
        <Title level={1}>Secure Medical Document Storage</Title>
        <Paragraph className="subtitle">
          Store and manage your medical documents securely using blockchain technology
        </Paragraph>
        <Button type="primary" size="large" onClick={() => navigate('/login')}>
          Get Started
        </Button>
      </div>

      <div className="features-section">
        <Title level={2} className="section-title">Key Features</Title>
        <div className="features-grid">
          <Card className="feature-card">
            <SecurityScanOutlined className="feature-icon" />
            <Title level={4}>Secure Storage</Title>
            <Paragraph>
              Your documents are encrypted and stored on IPFS with blockchain verification
            </Paragraph>
          </Card>

          <Card className="feature-card">
            <SafetyOutlined className="feature-icon" />
            <Title level={4}>Privacy First</Title>
            <Paragraph>
              Complete control over your medical records with secure access management
            </Paragraph>
          </Card>

          <Card className="feature-card">
            <BlockOutlined className="feature-icon" />
            <Title level={4}>Blockchain Powered</Title>
            <Paragraph>
              Immutable record keeping with Ethereum blockchain technology
            </Paragraph>
          </Card>
        </div>
      </div>

      <div className="how-it-works">
        <Title level={2} className="section-title">How It Works</Title>
        <Space direction="vertical" size="large" className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <Title level={4}>Connect Your Wallet</Title>
              <Paragraph>
                Link your MetaMask wallet to get started with secure document storage
              </Paragraph>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <Title level={4}>Upload Documents</Title>
              <Paragraph>
                Upload your medical documents securely to IPFS
              </Paragraph>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <Title level={4}>Verify on Blockchain</Title>
              <Paragraph>
                Document hashes are stored on the blockchain for verification
              </Paragraph>
            </div>
          </div>
        </Space>
      </div>
    </div>
  );
};

export default Home;
