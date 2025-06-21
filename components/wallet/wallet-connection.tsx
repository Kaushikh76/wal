'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, ChevronRight, LogOut, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function WalletConnection() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await login();
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!ready) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!authenticated) {
    return (
      <Card className="w-full max-w-md border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <CardTitle>Connect Your Wallets</CardTitle>
          <CardDescription>
            Connect both EVM (Arbitrum) and Sui wallets to store data on Walrus Protocol
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {isConnecting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm">Wallet Connected</CardTitle>
              <CardDescription className="text-xs">{user?.email?.address || 'Anonymous'}</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-500 hover:text-gray-700"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.wallet && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                EVM Wallet (Arbitrum)
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyAddress(user.wallet.address)}
                className="h-6 px-2 text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
            <div className="bg-gray-50 rounded-md p-2 text-sm font-mono">
              {formatAddress(user.wallet.address)}
            </div>
          </div>
        )}
        
        {/* Sui Wallet placeholder - in real implementation, you'd integrate with Sui wallet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              Sui Wallet
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              disabled
            >
              Not Connected
            </Button>
          </div>
          <div className="bg-gray-50 rounded-md p-2 text-sm text-gray-500 text-center">
            Connect Sui wallet to proceed
          </div>
        </div>
      </CardContent>
    </Card>
  );
}