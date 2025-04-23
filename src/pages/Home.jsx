import React from 'react';
import { Link } from 'react-router-dom'; // Ensure you're using React Router DOM for routing.
import { Button, Card } from 'antd'; // Import Ant Design components.
import {
  DatabaseOutlined, // Database icon
  SafetyCertificateOutlined as ShieldOutlined, // Use Ant Design's SafetyCertificateOutlined for "Shield".
  ShareAltOutlined, // Sharing icon
} from '@ant-design/icons'; // Import Ant Design icons.
import '../style/Home.css'; // Ensure your CSS file is correctly named and located.
import { useNavigate } from 'react-router-dom';


export default function Home() {
    const navigate = useNavigate();
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <Link to="/" className="logo">
          <DatabaseOutlined className="icon" />
          <span className="logo-text">MED DOCS</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/about" className="nav-item">About Us</Link>
          <a href="#features" className="nav-item">Features</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Secure Medical Document Storage</h1>
            <p className="hero-description">
              MED DOCS is a distributed data storage platform that securely stores your medical documents on IPFS and blockchain technology.
            </p>
            <div className="hero-buttons">
              <Button type="primary" size="large" onClick={()=>navigate("/login")}>Get Started</Button>
              <Button size="large" onClick={()=>navigate("/about")}>Learn More</Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <h2 className="features-title">Key Features</h2>
          <div className="features-grid">
            <Card className="feature-card" title={<CardTitle icon={<ShieldOutlined />} title="Secure Storage" />}>
              <p>Your medical documents are encrypted and stored on a distributed IPFS network, ensuring maximum security and privacy.</p>
            </Card>
            <Card className="feature-card" title={<CardTitle icon={<DatabaseOutlined />} title="Blockchain Verification" />}>
              <p>Document hashes are stored on the blockchain, providing an immutable record and easy verification of your medical data.</p>
            </Card>
            <Card className="feature-card" title={<CardTitle icon={<ShareAltOutlined />} title="Easy Sharing" />}>
              <p>Securely share your medical documents with healthcare providers or family members with just a few clicks.</p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2023 MED DOCS. All rights reserved.</p>
        <nav className="footer-links">
          <a href="#" className="footer-item">Terms of Service</a>
          <a href="#" className="footer-item">Privacy</a>
        </nav>
      </footer>
    </div>
  );
}

// Helper Component for Card Title
function CardTitle({ icon, title }) {
  return (
    <div className="card-title">
      {icon}
      <span>{title}</span>
    </div>
  );
}
