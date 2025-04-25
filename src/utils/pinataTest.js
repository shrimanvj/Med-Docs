// Test Pinata API connection
export const testPinataConnection = async (apiKey, apiSecret) => {
  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': apiSecret
      }
    });

    const data = await response.json();
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
