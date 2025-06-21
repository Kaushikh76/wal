'use client';

import { useState } from 'react';
import { WalletConnection } from '@/components/wallet/wallet-connection';
import { DataUpload } from '@/components/storage/data-upload';
import { StorageProgress } from '@/components/storage/storage-progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, ArrowRightLeft, Wallet, Shield } from 'lucide-react';

export default function HomePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [storageResult, setStorageResult] = useState(null);

  const handleUploadStart = () => {
    setIsProcessing(true);
    setStorageResult(null);
  };

  const handleUploadComplete = (result: any) => {
    setIsProcessing(false);
    setStorageResult(result);
  };

  const handleReset = () => {
    setIsProcessing(false);
    setStorageResult(null);
  };

  const features = [
    {
      icon: <ArrowRightLeft className="w-5 h-5" />,
      title: 'Cross-Chain Bridge',
      description: 'Seamlessly transfer USDC from Arbitrum One to Sui using CCTP',
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: 'Decentralized Storage',
      description: 'Store your data permanently on Walrus Protocol with cryptographic proofs',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and distributed across multiple nodes',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Walrus Storage
                </h1>
                <p className="text-xs text-gray-500">Decentralized Data Storage</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                Arbitrum One
              </Badge>
              <ArrowRightLeft className="w-4 h-4 text-gray-400" />
              <Badge variant="outline" className="text-xs">
                Sui Network
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900">
            Store Data on <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Walrus Protocol</span>
          </h2>
          <p className="text-lg text-gray-600">
            Pay with USDC on Arbitrum One, automatically converted to WAL tokens on Sui for permanent decentralized storage
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Application */}
        <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto">
          {/* Wallet Connection */}
          <div className="w-full flex justify-center">
            <WalletConnection />
          </div>

          {/* Data Upload */}
          <DataUpload
            onUploadStart={handleUploadStart}
            onUploadComplete={handleUploadComplete}
          />

          {/* Storage Progress */}
          <StorageProgress
            isActive={isProcessing}
            result={storageResult}
            onReset={handleReset}
          />
        </div>

        {/* How it Works */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Our automated relayer handles the entire cross-chain storage process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Calculate Cost', desc: 'Estimate WAL tokens needed for your data size' },
                { step: '2', title: 'Bridge USDC', desc: 'Transfer USDC from Arbitrum to Sui via CCTP' },
                { step: '3', title: 'Swap Tokens', desc: 'Convert USDC to WAL tokens on Sui DEX' },
                { step: '4', title: 'Store Data', desc: 'Upload your data to Walrus Protocol storage' },
              ].map((item, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto font-semibold text-sm">
                    {item.step}
                  </div>
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <p>Built with Walrus Protocol, Sui Network, and Arbitrum One</p>
          <p className="mt-2">Powered by CCTP for seamless cross-chain transfers</p>
        </div>
      </footer>
    </div>
  );
}