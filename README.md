# GPULend - Blockchain GPU Lending Platform

<div align="center">
  <img src="frontend/public/logo.png" alt="GPULend Logo" width="200" height="200" />
</div>

GPULend is a decentralized marketplace for GPU resources, connecting GPU owners with AI developers through blockchain technology. The platform enables secure, transparent, and efficient GPU rental services, leveraging the Internet Computer Protocol (ICP) for blockchain functionality.

## 🚀 Features

- **Decentralized GPU Marketplace**: Rent or lend GPUs in a peer-to-peer environment
- **Blockchain Integration**: Built on the Internet Computer Protocol for secure transactions
- **Multi-Wallet Support**: Connect with Internet Identity, NFID, or Plug Wallet
- **ICRC2 Token Support**: Handle token approvals and transfers between users
- **Real-time Availability**: Track GPU availability and pricing in real-time
- **Smart Contract Based**: All transactions and agreements enforced by smart contracts

## 💻 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Custom components with Tailwind CSS
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Blockchain**: Internet Computer Protocol (ICP)
- **Authentication**: Internet Identity, NFID, Plug Wallet integration

## 🛠️ Setup and Installation

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- Internet Identity, NFID, or Plug Wallet browser extension (for blockchain interactions)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/gpulend.git
   cd gpulend
   ```

2. Install dependencies:
   ```
   cd frontend
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## 🔗 Blockchain Integration

### Wallet Connection

GPULend supports three wallet providers:

1. **Internet Identity**: ICP's native identity service
2. **NFID (New Finance ID)**: A cross-chain identity solution
3. **Plug Wallet**: A browser extension wallet for ICP

To connect:
- Click the "Connect Wallet" button in the header
- Select your preferred wallet provider
- Follow the authentication prompts

### Token Approvals and Transfers

The platform uses ICRC2 token standard for payments and security deposits:

1. **Token Approval**: Allow the platform to transfer tokens on your behalf
2. **Token Transfer**: Transfer tokens between users for rental payments
3. **Balance Checking**: View your current balance and transaction history

## 📋 Usage Guide

### For GPU Owners

1. Connect your wallet
2. Navigate to "List GPU"
3. Fill in your GPU details, pricing, and availability
4. Set your payout wallet address
5. Submit and wait for rental requests

### For AI Developers

1. Connect your wallet
2. Browse available GPUs
3. Select a GPU and upload your model
4. Pay the rental fee using ICRC2 tokens
5. Monitor your task's progress

## 🔒 Security Considerations

- Wallet connection is optional but recommended for full functionality
- The platform stores minimal user information
- Multiple wallet provider support enhances security
- Token approvals are user-controlled and can be revoked

## 🧪 Development Environment

- **Local Development**: Uses localhost endpoints
- **Production**: Uses mainnet ICP endpoints
- **Configuration**: Environment-specific settings managed through env variables

## 📚 API Documentation

The full API documentation is available in the `/docs` directory.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built for HackoWASP 7 by Team GPULend
