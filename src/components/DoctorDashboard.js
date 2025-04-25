import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import { useAuth } from '../context/AuthContext';

const DoctorDashboard = ({ contract }) => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    loadSharedDocuments();
  }, [contract]);

  const loadSharedDocuments = async () => {
    try {
      setLoading(true);
      const docs = await contract.getDoctorAccessibleDocuments();
      setDocuments(docs.map(hash => ({ ipfsHash: hash })));
    } catch (error) {
      console.error('Error loading shared documents:', error);
      message.error('Failed to load shared documents');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Document Hash',
      dataIndex: 'ipfsHash',
      key: 'ipfsHash',
      ellipsis: true,
    },
    {
      title: 'View',
      key: 'view',
      render: (_, record) => (
        <a 
          href={`https://gateway.pinata.cloud/ipfs/${record.ipfsHash}`} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          View Document
        </a>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2>Shared Documents</h2>
      <p>Documents shared with you by patients</p>
      <Table 
        dataSource={documents} 
        columns={columns} 
        rowKey="ipfsHash"
        loading={loading}
      />
    </div>
  );
};

export default DoctorDashboard;
