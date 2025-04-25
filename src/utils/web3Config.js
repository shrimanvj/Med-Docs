import { ethers } from 'ethers';
import { contractABI } from '../contracts/config';

// Local Hardhat node configuration
const localProvider = 'http://127.0.0.1:8545';
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Your contract address

export const initWeb3 = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask to use this feature');
    }

    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect your wallet.');
    }

    // Create Web3Provider and get signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    console.log('Connected account:', await signer.getAddress());

    // Create contract instance with signer
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log('Contract initialized with signer');

    return { provider, signer, contract };
  } catch (error) {
    console.error('Failed to initialize Web3:', error);
    throw error;
  }
};

export const getContractWithSigner = async () => {
    const { signer } = await initWeb3();
    return new ethers.Contract(
        contractAddress,
        contractABI,
        signer
    );
};
