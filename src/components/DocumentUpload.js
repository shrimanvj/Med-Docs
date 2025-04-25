import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Upload, Alert, message } from 'antd';
import {
  FileTextOutlined,
  LockOutlined,
  LinkOutlined,
  LoadingOutlined,
  WalletOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import '../styles/DocumentUpload.css';
import { pinataConfig } from '../config/pinata';
import { contractAddress, contractABI } from '../contracts/config';
import { eventEmitter, EVENTS } from '../utils/events';
import { testPinataConnection } from '../utils/pinataTest';

const DocumentUpload = ({ contract }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [uploadFee, setUploadFee] = useState(null);
  const [isCheckingFee, setIsCheckingFee] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await testPinataConnection(pinataConfig.apiKey, pinataConfig.apiSecret);
        console.log('Pinata connection test:', result);
        if (!result.success) {
          message.error('Failed to connect to Pinata. Please check your API keys.');
        }
      } catch (error) {
        console.error('Error testing Pinata connection:', error);
      }
    };
    testConnection();
  }, []);

  const changeHandler = (info) => {
    if (info.fileList.length > 0) {
      setSelectedFile(info.fileList[0].originFileObj);
      setError('');
    }
  };

  const uploadToIPFS = async (file) => {
    const hide = message.loading({ content: 'Preparing upload...', key: 'upload', duration: 0 });
    try {
      setIsUploading(true);
      setError('');

      // First, ensure wallet is connected and we have the upload fee
      if (!isWalletConnected) {
        throw new Error('Please connect your wallet first');
      }

      if (!uploadFee) {
        throw new Error('Upload fee not initialized');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      message.loading({ content: 'Uploading to IPFS...', key: 'upload', duration: 0 });

      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          type: file.type,
          size: file.size
        }
      });
      formData.append('pinataMetadata', metadata);
      
      // Add options
      const options = JSON.stringify({
        cidVersion: 0
      });
      formData.append('pinataOptions', options);

      // Validate API keys
      if (!pinataConfig.apiKey || !pinataConfig.apiSecret) {
        console.log('Pinata Config:', {
          apiKey: pinataConfig.apiKey ? `${pinataConfig.apiKey.substring(0, 4)}...` : 'Missing',
          apiSecret: pinataConfig.apiSecret ? `${pinataConfig.apiSecret.substring(0, 4)}...` : 'Missing'
        });
        throw new Error('Pinata API configuration is missing. Please check your .env file.');
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': pinataConfig.apiKey.trim(),
          'pinata_secret_api_key': pinataConfig.apiSecret.trim()
        },
        body: formData
      });

      if (!response.ok) {
        let errorMessage = 'Failed to upload to IPFS';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error.details || errorData.error.reason || errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
          errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.IpfsHash) {
        message.loading({ content: 'File uploaded to IPFS. Storing on blockchain...', key: 'upload', duration: 0 });
        
        try {
          // Show confirmation dialog with fee
          const feeInEther = ethers.utils.formatEther(uploadFee);
          message.loading({ 
            content: `Waiting for transaction confirmation. Upload fee: ${feeInEther} ETH`,
            key: 'upload'
          });

          await storeHashOnBlockchain(data.IpfsHash);
          setIpfsHash(data.IpfsHash);
          message.success({ content: 'Document uploaded and stored successfully!', key: 'upload' });
          // Emit event to notify other components
          eventEmitter.emit(EVENTS.DOCUMENT_UPLOADED, { ipfsHash: data.IpfsHash });
        } catch (error) {
          if (error.code === 'ACTION_REJECTED') {
            throw new Error('Transaction was rejected. Please approve the transaction in MetaMask.');
          }
          throw error;
        }
      } else {
        throw new Error('Failed to get IPFS hash from Pinata');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error({ content: error.message, key: 'upload' });
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmission = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    // Check if wallet is connected
    if (!isWalletConnected) {
      try {
        await connectWallet();
      } catch (error) {
        message.error('Please connect your wallet to upload documents');
        return;
      }
    }

    // Check if contract is initialized
    if (!contract) {
      message.error('Smart contract not initialized. Please try again.');
      return;
    }

    // Verify upload fee
    try {
      const fee = await contract.uploadFee();
      setUploadFee(fee);
      message.info(`Upload fee: ${ethers.utils.formatEther(fee)} ETH`);
    } catch (error) {
      console.error('Error getting upload fee:', error);
      message.error('Failed to get upload fee. Please try again.');
      return;
    }

    await uploadToIPFS(selectedFile);
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask first!');
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setIsWalletConnected(true);
        setError('');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message);
      throw error; // Re-throw to handle in calling function
    }
  };

  const init = async () => {
    try {
      setIsCheckingFee(true);
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      // Check if wallet is connected
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setIsWalletConnected(accounts.length > 0);
      }

      // Get upload fee
      const fee = await contract.uploadFee();
      setUploadFee(fee);
      setError('');
    } catch (error) {
      console.error('Initialization error:', error);
      setError('Failed to initialize: ' + error.message);
    } finally {
      setIsCheckingFee(false);
    }
  };

  useEffect(() => {
    if (contract) {
      init();
    }
  }, [contract]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const handleAccountsChanged = (accounts) => {
    setIsWalletConnected(accounts.length > 0);
  };

  const getFeeInEther = () => {
    if (!uploadFee) return '...';
    return ethers.utils.formatEther(uploadFee);
  };

  const storeHashOnBlockchain = async (hash) => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      // Ensure we have a signer (connected wallet)
      const signer = contract.signer;
      if (!signer) {
        throw new Error('No wallet connected. Please connect your wallet first.');
      }

      // Get the current gas price
      const gasPrice = await signer.provider.getGasPrice();
      console.log('Current Gas Price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'Gwei');
      console.log('Upload Fee:', ethers.utils.formatEther(uploadFee), 'ETH');

      // Get current account
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet connected. Please connect your wallet first.');
      }
      console.log('Using account:', accounts[0]);

      // Prepare transaction with upload fee
      message.loading({ content: 'Please confirm the transaction in MetaMask...', key: 'txStatus', duration: 0 });
      
      // Log pre-transaction state
      console.log('Pre-transaction state:', {
        documentHash: hash,
        sender: accounts[0],
        uploadFee: ethers.utils.formatEther(uploadFee),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei')
      });

      // Create transaction object
      const tx = await contract.storeDocument(hash, { 
        value: uploadFee,
        gasLimit: 1000000,
        gasPrice: gasPrice,
        from: accounts[0] // Explicitly specify the sender
      });

      console.log('Transaction sent:', tx.hash);
      message.loading({ content: 'Transaction pending... Please wait for confirmation.', key: 'txStatus', duration: 0 });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      // Verify document ownership after storage
      const owner = await contract.getDocumentOwner(hash);
      console.log('Document ownership verification:', {
        documentHash: hash,
        storedOwner: owner,
        expectedOwner: accounts[0],
        isOwnerCorrect: owner.toLowerCase() === accounts[0].toLowerCase()
      });
      console.log('Transaction receipt:', receipt);
      
      if (receipt.status === 1) {
        setIpfsHash(hash); 
        message.success({ content: 'Document hash stored on blockchain successfully!', key: 'txStatus' });
        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Blockchain storage error:', error);
      if (error.code === 'ACTION_REJECTED') {
        message.info({ content: 'Transaction was cancelled by user', key: 'txStatus' });
      } else if (error.code === -32603) {
        message.error({ content: 'Transaction failed. Please make sure you have enough ETH to pay the fee.', key: 'txStatus' });
      } else {
        message.error({ content: 'Failed to store on blockchain: ' + error.message, key: 'txStatus' });
      }
      throw error;
    }
  };

  if (isCheckingFee) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <LoadingOutlined style={{ fontSize: 24 }} spin />
        <p style={{ marginTop: '20px' }}>Initializing...</p>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <div className="upload-content">
        <div className="upload-card">
          <h2 className="upload-card-title">Upload Medical Document</h2>
          
          <div className="upload-area">
            <Upload.Dragger
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={changeHandler}
              showUploadList={false}
              beforeUpload={() => false}
            >
              <div className="upload-icon">
                <CloudUploadOutlined />
              </div>
              <p className="upload-text">Click or drag file to this area to upload</p>
              <p className="upload-hint">
                Support for PDF, DOC, DOCX, JPG, JPEG, PNG files
              </p>
            </Upload.Dragger>
          </div>

          {error && (
            <div className="status-message error">
              <FileTextOutlined /> {error}
            </div>
          )}

          <div className="form-group">
            <div className="info-card-title">
              <WalletOutlined /> Upload Fee
            </div>
            <div className="hash-container">
              {getFeeInEther()} ETH
            </div>
          </div>
          
          <button
            onClick={handleSubmission}
            className={`upload-button ${isUploading ? 'loading' : ''}`}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? (
              <>
                <span className="loading-spinner"></span>
                Uploading...
              </>
            ) : (
              <>
                <FileTextOutlined />
                Upload Document
              </>
            )}
          </button>
        </div>

        {ipfsHash && (
          <div className="info-card">
            <div className="info-card-title">
              <LockOutlined /> Document Successfully Uploaded
            </div>
            <div className="upload-text">
              Your document has been uploaded to IPFS and is now permanently stored.
            </div>
            <div className="hash-container">
              <LinkOutlined /> {ipfsHash}
            </div>
            <a
              className="view-button"
              href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkOutlined /> View Document
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
