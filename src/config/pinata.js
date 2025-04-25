import { PINATA_API_KEY, PINATA_API_SECRET } from './keys';

// Log configuration on load
console.log('Pinata Configuration Status:', {
  apiKey: PINATA_API_KEY ? 'Present' : 'Missing',
  apiSecret: PINATA_API_SECRET ? 'Present' : 'Missing'
});

export const pinataConfig = {
  apiKey: PINATA_API_KEY,
  apiSecret: PINATA_API_SECRET,
  gateway: 'https://gateway.pinata.cloud'
};

// Validate configuration
if (!pinataConfig.apiKey || !pinataConfig.apiSecret) {
  console.warn('Pinata API configuration is missing');
  console.log('Current values:', {
    apiKey: pinataConfig.apiKey ? `${pinataConfig.apiKey.substring(0, 4)}...` : 'Missing',
    apiSecret: pinataConfig.apiSecret ? `${pinataConfig.apiSecret.substring(0, 4)}...` : 'Missing'
  });
}
