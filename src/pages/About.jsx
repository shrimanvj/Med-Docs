import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import '../style/About.css'; // Ensure this file exists and is styled properly.
import { useNavigate } from 'react-router-dom';

export default function About() {
    const navigate = useNavigate();
  return (
    <div className="about-container">
      {/* Header */}
      <header className="about-header">
        <Link to="/" className="logo">
          <DatabaseOutlined className="icon" />
          <span className="logo-text">MED DOCS</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/about" className="nav-item">About Us</Link>
          <a href="/#features" className="nav-item">Features</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">About MED DOCS</h1>
              <p className="hero-description">
                Revolutionizing medical document storage with blockchain and IPFS technology.
              </p>
            </div>
          </div>
        </section>

        {/* Mission and How It Works Section */}
        <section className="info-section">
          <div className="container info-grid">
            <div className="info-block">
              <h2 className="info-title">Our Mission</h2>
              <p className="info-description">
                At MED DOCS, our mission is to provide a secure, decentralized platform for storing and sharing medical documents. We believe that patients should have full control over their medical data while ensuring it remains accessible and verifiable when needed.
              </p>
            </div>
            <div className="info-block">
              <h2 className="info-title">How It Works</h2>
              <p className="info-description">
                MED DOCS utilizes IPFS (InterPlanetary File System) to store your encrypted medical documents across a distributed network. The unique hash generated for each document is then recorded on a blockchain, creating an immutable record of your data. This approach ensures both the security and integrity of your medical information.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="why-section">
          <div className="container">
            <h2 className="why-title">Why Choose MED DOCS?</h2>
            <ul className="why-list">
              <li>Unparalleled security for your sensitive medical information</li>
              <li>Easy access and sharing of your documents with healthcare providers</li>
              <li>Immutable record-keeping through blockchain technology</li>
              <li>Full control over your personal health data</li>
              <li>Compliance with healthcare data regulations</li>
            </ul>
            <div className="why-buttons">
              <Button type="primary" size="large" onClick={()=>navigate("/login")}>Get Started</Button>
            
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="about-footer">
        <p>© 2023 MED DOCS. All rights reserved.</p>
        <nav className="footer-links">
          <a href="#" className="footer-item">Terms of Service</a>
          <a href="#" className="footer-item">Privacy</a>
        </nav>
      </footer>
    </div>
  );
}
