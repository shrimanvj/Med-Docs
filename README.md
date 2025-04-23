# Med-Docs DApp

A decentralized application (DApp) for secure storage and management of medical documents using blockchain technology.

## Features

- Secure document storage using IPFS
- Blockchain-based document verification
- User authentication and authorization
- Document sharing capabilities
- Intuitive user interface

## Prerequisites

- Node.js (v14 or higher)
- NPM (v6 or higher)
- MetaMask wallet extension

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shrimanvj/Med-Docs.git
   cd Med-Docs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add your JWT token and gateway address:
     ```
     REACT_APP_JWT_TOKEN=your_jwt_token
     REACT_APP_GATEWAY_ADDRESS=your_gateway_address
     ```

## Usage

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Connect your MetaMask wallet when prompted

## License

MIT
