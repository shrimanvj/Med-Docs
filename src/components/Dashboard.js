import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Layout, Tabs, message, Table, Tag } from 'antd';
import { LogoutOutlined, UploadOutlined, UserOutlined, TeamOutlined, FileProtectOutlined, FileOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DocumentUpload from './DocumentUpload';
import DocumentSharing from './DocumentSharing';
import DoctorDashboard from './DoctorDashboard';
import { initWeb3 } from '../utils/web3Config';

const { Header, Content } = Layout;

const Dashboard = ({ isDoctor = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const { contract: web3Contract, signer } = await initWeb3();
        if (!web3Contract || !signer) {
          throw new Error('Failed to initialize contract with signer');
        }
        
        // Verify we can get the signer's address
        const address = await signer.getAddress();
        console.log('Connected with address:', address);
        
        setContract(web3Contract);
      } catch (error) {
        console.error("Failed to initialize dashboard:", error);
        if (error.message.includes('contract not found')) {
          message.error('Smart contract not found. Please make sure the contract is deployed.');
        } else {
          message.error('Failed to initialize: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [isDoctor]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const loadDoctorDocuments = async () => {
    try {
      setLoading(true);
      const docs = await contract.getDoctorAccessibleDocuments();
      console.log('Doctor accessible documents:', docs);

      // Create document objects with patient info
      const documentObjects = await Promise.all(docs.map(async (hash, index) => {
        try {
          // Get document owner directly from contract
          const owner = await contract.getDocumentOwner(hash);
          console.log(`Document ${hash} owner:`, owner);
          
          return {
            key: `doc-${index}`,
            ipfsHash: hash,
            url: `https://gateway.pinata.cloud/ipfs/${hash}`,
            patientAddress: owner,
            patientAddressShort: `${owner.substring(0, 6)}...${owner.substring(38)}`
          };
        } catch (error) {
          console.error('Error getting document owner:', error);
          return {
            key: `doc-${index}`,
            ipfsHash: hash,
            url: `https://gateway.pinata.cloud/ipfs/${hash}`,
            patientAddress: 'Unknown',
            patientAddressShort: 'Unknown'
          };
        }
      }));

      setDocuments(documentObjects);
    } catch (error) {
      console.error('Error loading doctor documents:', error);
      message.error('Failed to load shared documents');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDocuments = async () => {
    try {
      setLoading(true);
      const docs = await contract.getUserDocuments();
      const documentObjects = docs.map((hash) => ({
        ipfsHash: hash,
        url: `https://gateway.pinata.cloud/ipfs/${hash}`
      }));
      setDocuments(documentObjects);
    } catch (error) {
      console.error('Error loading patient documents:', error);
      message.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      if (isDoctor) {
        loadDoctorDocuments();
      } else {
        loadPatientDocuments();
      }
    }
  }, [contract, isDoctor]);

  const columns = isDoctor ? [
    {
      title: 'Document',
      dataIndex: 'ipfsHash',
      key: 'ipfsHash',
      render: (hash, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FileOutlined style={{ marginRight: 8 }} />
          <a href={record.url} target="_blank" rel="noopener noreferrer">
            {hash.substring(0, 15)}...{hash.substring(hash.length - 4)}
          </a>
        </div>
      ),
    },
    {
      title: 'Shared By (Patient)',
      dataIndex: 'patientAddress',
      key: 'patientAddress',
      render: (address, record) => (
        <Tag color="blue" title={record.patientAddress}>
          {record.patientAddressShort}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary"
          icon={<FileOutlined />}
          onClick={() => window.open(record.url, '_blank')}
          disabled={!record.url}
        >
          View Document
        </Button>
      ),
    }
  ] : [
    {
      title: 'Document',
      dataIndex: 'ipfsHash',
      key: 'ipfsHash',
      render: (hash, record) => (
        <div>
          <FileOutlined style={{ marginRight: 8 }} />
          <a href={record.url} target="_blank" rel="noopener noreferrer">
            {hash ? `${hash.substring(0, 20)}...` : 'Loading...'}
          </a>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary"
          icon={<ShareAltOutlined />}
          onClick={() => {
            setSelectedDocument(record);
            setSharing(true);
          }}
          disabled={!record.ipfsHash}
        >
          Share
        </Button>
      ),
    }
  ];

  // Define tabs based on user role
  const patientItems = [
    {
      key: '1',
      label: (
        <span>
          <UploadOutlined />
          Upload Documents
        </span>
      ),
      children: <DocumentUpload contract={contract} />
    },
    {
      key: '2',
      label: (
        <span>
          <FileProtectOutlined />
          Share Documents
        </span>
      ),
      children: <DocumentSharing contract={contract} selectedDocument={selectedDocument} sharing={sharing} setSharing={setSharing} />
    }
  ];

  const doctorItems = [
    {
      key: '1',
      label: (
        <span>
          <TeamOutlined />
          Shared Documents
        </span>
      ),
      children: <Table columns={columns} dataSource={documents} />
    }
  ];

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            MED-DOCS {isDoctor ? '(Doctor)' : '(Patient)'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>
              <UserOutlined /> {user?.email}
            </span>
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
          {!loading && (
            <Tabs defaultActiveKey="1" items={isDoctor ? doctorItems : patientItems} />
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;
