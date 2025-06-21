import { ethers } from 'ethers';

export interface CCTPTransferParams {
  amount: string;
  destinationDomain: number;
  recipient: string;
  mintRecipient: string;
}

export class CCTPClient {
  private tokenMessengerAddress: string;
  private messageTransmitterAddress: string;
  private usdcAddress: string;

  constructor() {
    // Arbitrum One mainnet addresses
    this.tokenMessengerAddress = '0x19330d10D9Cc8751218eaf51E8885D058642E08A';
    this.messageTransmitterAddress = '0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca';
    this.usdcAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
  }

  async depositForBurn(
    provider: ethers.Provider,
    signer: ethers.Signer,
    params: CCTPTransferParams
  ): Promise<string> {
    const tokenMessengerAbi = [
      'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken) returns (uint64)',
      'function depositForBurnWithCaller(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken, bytes32 destinationCaller) returns (uint64)'
    ];

    const tokenMessenger = new ethers.Contract(
      this.tokenMessengerAddress,
      tokenMessengerAbi,
      signer
    );

    // Convert recipient address to bytes32
    const mintRecipientBytes32 = ethers.zeroPadValue(params.mintRecipient, 32);

    const tx = await tokenMessenger.depositForBurn(
      ethers.parseUnits(params.amount, 6), // USDC has 6 decimals
      params.destinationDomain, // Sui domain (you'll need to get the actual domain ID)
      mintRecipientBytes32,
      this.usdcAddress
    );

    return tx.hash;
  }

  async getMessageFromTx(provider: ethers.Provider, txHash: string): Promise<string> {
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }

    // Parse logs to extract the message
    const messageTransmitterAbi = [
      'event MessageSent(bytes message)'
    ];

    const iface = new ethers.Interface(messageTransmitterAbi);
    
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed && parsed.name === 'MessageSent') {
          return parsed.args.message;
        }
      } catch (e) {
        // Continue to next log
      }
    }

    throw new Error('MessageSent event not found in transaction logs');
  }

  async getMessageStatus(messageHash: string): Promise<boolean> {
    // Check if message has been received on destination chain
    // This would require calling the MessageTransmitter contract on Sui
    // For now, return a placeholder
    return false;
  }
}

export const cctpClient = new CCTPClient();