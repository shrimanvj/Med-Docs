import React, { useState, useEffect } from 'react';
import { Table, Button, Input, message, Modal, List, Card, Tag } from 'antd';
import { ShareAltOutlined, StopOutlined, FileOutlined, LinkOutlined } from '@ant-design/icons';
import { eventEmitter, EVENTS } from '../utils/events';

const DocumentSharing = ({ contract }) => {
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [doctorAddress, setDoctorAddress] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Load user's documents and listen for new uploads
  useEffect(() => {
    if (contract) {
      loadDocuments();
      loadRegisteredDoctors();

      // Listen for new document uploads
      const handleDocumentUploaded = (data) => {
        loadDocuments(); // Refresh the documents list
      };

      eventEmitter.on(EVENTS.DOCUMENT_UPLOADED, handleDocumentUploaded);

      return () => {
        eventEmitter.off(EVENTS.DOCUMENT_UPLOADED, handleDocumentUploaded);
      };
    }
  }, [contract]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await contract.getUserDocuments();
      console.log('Loaded documents:', docs);
      
      // Create document objects with access info
      const documentObjects = await Promise.all(docs.map(async (hash) => {
        try {
          // Get document owner to verify ownership
          const owner = await contract.getDocumentOwner(hash);
          const signer = await contract.signer.getAddress();
          console.log('Document ownership check:', {
            hash,
            owner,
            signer,
            isOwner: owner.toLowerCase() === signer.toLowerCase()
          });
          
          return {
            ipfsHash: hash,
            url: `https://gateway.pinata.cloud/ipfs/${hash}`,
            isOwner: true, // Show all documents for now
            owner: owner
          };
        } catch (error) {
          console.error('Error getting document owner:', error);
          return {
            ipfsHash: hash,
            url: `https://gateway.pinata.cloud/ipfs/${hash}`,
            isOwner: true, // Show all documents for now
            owner: 'Unknown'
          };
        }
      }));

      setDocuments(documentObjects); // Show all documents
    } catch (error) {
      console.error('Error loading documents:', error);
      message.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadRegisteredDoctors = async () => {
    try {
      // Since we can't get a list of all doctors directly, we'll use events
      const filter = contract.filters.DoctorRegistered();
      const events = await contract.queryFilter(filter);
      console.log('Doctor registration events:', events);
      
      // Process each doctor from events
      const doctorList = await Promise.all(
        events.map(async (event) => {
          const doctorAddress = event.args.doctor;
          const doctorInfo = await contract.doctors(doctorAddress);
          return {
            address: doctorAddress,
            name: doctorInfo.name,
            specialization: doctorInfo.specialization,
            isRegistered: doctorInfo.isRegistered
          };
        })
      );
      
      // Filter only registered doctors
      const registeredDoctors = doctorList.filter(doctor => doctor.isRegistered);
      console.log('Loaded registered doctors:', registeredDoctors);
      setDoctors(registeredDoctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
      message.error('Failed to load registered doctors');
    }
  };

  const handleShare = async () => {
    if (!doctorAddress || !selectedDocument) return;

    try {
      setLoading(true);
      
      // Debug logging
      console.log('Sharing document:', {
        documentHash: selectedDocument.ipfsHash,
        doctorAddress: doctorAddress
      });

      // Get current signer
      const signer = await contract.signer.getAddress();
      console.log('Current signer:', signer);

      // Get document owner
      const owner = await contract.getDocumentOwner(selectedDocument.ipfsHash);
      console.log('Document owner:', owner);

      // Debug ownership check
      console.log('Ownership check:', {
        owner: owner.toLowerCase(),
        signer: signer.toLowerCase(),
        isOwner: owner.toLowerCase() === signer.toLowerCase()
      });

      // Verify doctor is registered
      const doctorInfo = await contract.doctors(doctorAddress);
      console.log('Doctor info:', doctorInfo);

      // Try to share the document
      console.log('Attempting to grant access...');
      const tx = await contract.grantAccess(doctorAddress, selectedDocument.ipfsHash);
      console.log('Transaction sent:', tx.hash);
      
      message.info('Processing transaction...');
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      
      message.success('Successfully shared document with doctor');
      setSharing(false);
      setDoctorAddress('');
      setSelectedDocument(null);
      await loadDocuments(); // Refresh the documents list
    } catch (error) {
      console.error('Error sharing document:', error);
      
      // More detailed error messages
      if (error.message.includes('Doctor is not registered')) {
        message.error('This address does not belong to a registered doctor');
      } else if (error.message.includes('Only document owner')) {
        message.error('You can only share documents that you own. Please make sure you are connected with the correct wallet.');
      } else {
        message.error(`Failed to share document: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (document, doctorAddr) => {
    try {
      setLoading(true);
      const tx = await contract.revokeAccess(doctorAddr, document.ipfsHash);
      message.info('Processing transaction...');
      await tx.wait();
      message.success('Successfully revoked access');
      await loadDocuments(); // Refresh the documents list
    } catch (error) {
      console.error('Error revoking access:', error);
      message.error('Failed to revoke access: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Document',
      dataIndex: 'ipfsHash',
      key: 'ipfsHash',
      render: (hash, record) => (
        <div>
          <FileOutlined style={{ marginRight: 8 }} />
          <a href={record.url} target="_blank" rel="noopener noreferrer">
            {hash.substring(0, 20)}...
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
          disabled={!record.isOwner}
          onClick={() => {
            setSelectedDocument(record);
            setSharing(true);
          }}
        >
          Share
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2>My Documents</h2>
      <Card>
        <Table 
          dataSource={documents} 
          columns={columns} 
          rowKey="ipfsHash"
          loading={loading}
        />
      </Card>

      <Modal
        title="Share Document"
        open={sharing}
        onOk={handleShare}
        onCancel={() => {
          setSharing(false);
          setDoctorAddress('');
          setSelectedDocument(null);
        }}
        confirmLoading={loading}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <h4>Selected Document:</h4>
          {selectedDocument && (
            <Tag icon={<FileOutlined />}>
              {selectedDocument.ipfsHash.substring(0, 20)}...
            </Tag>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4>Registered Doctors:</h4>
          <List
            size="small"
            bordered
            dataSource={doctors}
            renderItem={doctor => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    onClick={() => setDoctorAddress(doctor.address)}
                  >
                    Select
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={doctor.name}
                  description={`${doctor.specialization} (${doctor.address.substring(0, 10)}...)`}
                />
              </List.Item>
            )}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <h4>Or enter doctor's address manually:</h4>
          <Input
            placeholder="Enter doctor's wallet address"
            value={doctorAddress}
            onChange={(e) => setDoctorAddress(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default DocumentSharing;
