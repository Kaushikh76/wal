export interface WalrusStoreResponse {
  newlyCreated?: {
    blobObject: {
      id: string;
      storedEpoch: number;
      blobId: string;
      size: number;
      erasureCodeType: string;
      certifiedEpoch: number;
      storage: {
        id: string;
        startEpoch: number;
        endEpoch: number;
        storageSize: number;
      };
    };
    resourceOperation: {
      RegisterFromScratch?: any;
      Extend?: any;
    };
    cost: number;
  };
  alreadyCertified?: {
    blobId: string;
    event: {
      txDigest: string;
      eventSeq: string;
    };
    endEpoch: number;
  };
}

export class WalrusClient {
  private aggregatorUrl: string;
  private publisherUrl: string;

  constructor() {
    this.aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';
    this.publisherUrl = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space';
  }

  async calculateStorageCost(dataSize: number): Promise<number> {
    // Walrus storage cost calculation
    // This is a simplified calculation - in reality you'd need to call the Walrus API
    const basePrice = 0.001; // WAL tokens per byte (example rate)
    const storagePeriods = 200; // epochs (example)
    return dataSize * basePrice * storagePeriods;
  }

  async storeBlob(data: Blob | string, epochs?: number): Promise<WalrusStoreResponse> {
    const formData = new FormData();
    
    if (typeof data === 'string') {
      formData.append('file', new Blob([data], { type: 'text/plain' }));
    } else {
      formData.append('file', data);
    }

    if (epochs) {
      formData.append('epochs', epochs.toString());
    }

    const response = await fetch(`${this.publisherUrl}/v1/store`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to store blob: ${response.statusText}`);
    }

    return response.json();
  }

  async retrieveBlob(blobId: string): Promise<Response> {
    const response = await fetch(`${this.aggregatorUrl}/v1/${blobId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to retrieve blob: ${response.statusText}`);
    }

    return response;
  }

  async getBlobInfo(blobId: string): Promise<any> {
    const response = await fetch(`${this.aggregatorUrl}/v1/info/${blobId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get blob info: ${response.statusText}`);
    }

    return response.json();
  }
}

export const walrusClient = new WalrusClient();