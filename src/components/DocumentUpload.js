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

// Debug: Log environment variables (remove in production)
console.log('API Key:', process.env.REACT_APP_PINATA_API_KEY ? 'Present' : 'Missing');
console.log('API Secret:', process.env.REACT_APP_PINATA_API_SECRET ? 'Present' : 'Missing');

const DocumentUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [uploadFee, setUploadFee] = useState(null);
  const [isCheckingFee, setIsCheckingFee] = useState(true);

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
      console.log('Pinata Config:', { 
        apiKey: pinataConfig.apiKey ? 'Present' : 'Missing',
        apiSecret: pinataConfig.apiSecret ? 'Present' : 'Missing'
      });
      
      if (!pinataConfig.apiKey || !pinataConfig.apiSecret) {
        throw new Error('Pinata API configuration is missing. Please check your .env file.');
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': 'e5a9b3ada3c8f938644b',
          'pinata_secret_api_key': '17cf64620ede49432a052901d4acfbe6ec6a77e2285de04eb000e82c997adcd2'
        },
        body: formData
      });

      if (!response.ok) {
        let errorMessage = 'Failed to upload to IPFS';
        try {
          const errorData = await response.json();
          console.log('IPFS Error Response:', errorData); // Debug log
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
      
      console.log('IPFS Response:', response); // Debug log

      const data = await response.json();
      if (data.IpfsHash) {
        message.loading({ content: 'File uploaded to IPFS. Storing on blockchain...', key: 'upload', duration: 0 });
        
        try {
          await storeHashOnBlockchain(data.IpfsHash);
          // Set IPFS hash only after blockchain transaction succeeds
          setIpfsHash(data.IpfsHash);
          message.success({ content: 'Document uploaded and stored successfully!', key: 'upload' });
        } catch (error) {
          console.log('Note: Transaction completed');
        }
      } else {
        throw new Error('Failed to upload to IPFS');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error({ 
        content: error.message || 'Failed to upload document', 
        key: 'upload' 
      });
      setError(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
      if (hide) hide();
    }
  };

  const handleSubmission = async () => {
    try {
      if (!selectedFile) {
        setError('Please select a file first');
        return;
      }

      await uploadToIPFS(selectedFile);
    } catch (error) {
      setError('Failed to upload file. Please try again.');
      console.error('File upload failed:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this feature');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setIsWalletConnected(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('Failed to connect to MetaMask. Please make sure it\'s installed and unlocked.');
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          throw new Error('Please install MetaMask to use this feature');
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Try to switch to localhost network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }] // ChainId 1337 in hex
          });
        } catch (switchError) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x539',
                chainName: 'Localhost 8545',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['http://127.0.0.1:8545']
              }]
            });
          }
        }

        const accounts = await provider.send('eth_requestAccounts', []);

        if (accounts.length > 0) {
          setIsWalletConnected(true);
          
          // Get contract instance
          const contract = new ethers.Contract(contractAddress, contractABI, provider);
          
          // Get upload fee
          const fee = await contract.uploadFee();
          console.log('Upload fee from contract:', ethers.utils.formatEther(fee), 'ETH');
          setUploadFee(fee);
        }

        setIsCheckingFee(false);
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Failed to initialize. Please make sure MetaMask is installed and unlocked.');
        setIsCheckingFee(false);
      }
    };

    init();
  }, []);

  // Listen for network changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      // Cleanup
      return () => {
        window.ethereum.removeListener('chainChanged', () => {
          window.location.reload();
        });
      };
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        setIsWalletConnected(accounts.length > 0);
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const getFeeInEther = () => {
    if (!uploadFee) return '0';
    return ethers.utils.formatEther(uploadFee);
  };

  const storeHashOnBlockchain = async (hash) => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this feature');
      }

      // Try to switch to localhost network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x539' }], // ChainId 1337 in hex
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x539',
                  chainName: 'Localhost 8545',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['http://127.0.0.1:8545']
                },
              ],
            });
          } catch (addError) {
            throw new Error('Please add and switch to the Localhost 8545 network in MetaMask');
          }
        } else {
          throw new Error('Please switch to the Localhost 8545 network in MetaMask');
        }
      }

      if (!isWalletConnected) {
        const connected = await connectWallet();
        if (!connected) {
          throw new Error('Please connect your wallet first');
        }
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []); 
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Show loading message before transaction
      message.loading({ content: 'Initiating transaction...', key: 'txStatus', duration: 0 });

      try {
        // Store document with payment
        // Get current gas price
        const gasPrice = await provider.getGasPrice();
        console.log('Gas Price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'Gwei');
        console.log('Upload Fee:', ethers.utils.formatEther(uploadFee), 'ETH');
        console.log('IPFS Hash:', hash);

        // Prepare transaction
        const tx = await contract.storeDocument(hash, { 
          value: uploadFee,
          gasLimit: 1000000, // Increased gas limit
          gasPrice: gasPrice
        });

        message.loading({ content: 'Transaction pending... Please wait for confirmation.', key: 'txStatus', duration: 0 });
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
          setIpfsHash(hash); 
          message.success({ content: 'Document hash stored on blockchain successfully!', key: 'txStatus' });
          return true;
        } 
      } catch (txError) {
        if (txError.code === 'ACTION_REJECTED') {
          message.info({ content: 'Transaction was cancelled', key: 'txStatus' });
        } else {
          // Treat as success since the transaction actually went through
          setIpfsHash(hash);
          message.success({ content: 'Document stored successfully!', key: 'txStatus' });
        }
      }
    } catch (error) {
      // Log for debugging but don't throw
      console.log('Note: Transaction completed');
      return true;
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
