'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Loader2, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { relayerService, RelayerSteps } from '@/lib/relayer-service';
import { toast } from 'sonner';

interface StorageProgressProps {
  isActive: boolean;
  result: any;
  onReset: () => void;
}

export function StorageProgress({ isActive, result, onReset }: StorageProgressProps) {
  const [steps, setSteps] = useState<RelayerSteps>({
    calculateCost: false,
    transferUSDC: false,
    swapToWAL: false,
    storeData: false,
  });
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const currentSteps = relayerService.getSteps();
      setSteps(currentSteps);

      // Determine current step
      const stepArray = Object.values(currentSteps);
      const completedSteps = stepArray.filter(Boolean).length;
      setCurrentStep(completedSteps);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const progressSteps = [
    {
      key: 'calculateCost',
      title: 'Calculate Storage Cost',
      description: 'Estimating WAL tokens needed for data storage',
    },
    {
      key: 'transferUSDC',
      title: 'Transfer USDC',
      description: 'Moving USDC from Arbitrum to Sui via CCTP',
    },
    {
      key: 'swapToWAL',
      title: 'Swap to WAL',
      description: 'Converting USDC to WAL tokens on Sui DEX',
    },
    {
      key: 'storeData',
      title: 'Store on Walrus',
      description: 'Saving data to Walrus Protocol storage',
    },
  ];

  const getStepIcon = (stepKey: string, index: number) => {
    if (steps[stepKey as keyof RelayerSteps]) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (index === currentStep && isActive) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    } else if (result && !result.success && index === currentStep) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    return <Circle className="w-5 h-5 text-gray-300" />;
  };

  const getStepStatus = (stepKey: string, index: number) => {
    if (steps[stepKey as keyof RelayerSteps]) return 'completed';
    if (index === currentStep && isActive) return 'active';
    if (result && !result.success && index === currentStep) return 'error';
    return 'pending';
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const progress = (currentStep / progressSteps.length) * 100;

  if (!isActive && !result) return null;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Storage Progress</span>
              {result?.success && <CheckCircle className="w-5 h-5 text-green-500" />}
              {result && !result.success && <AlertCircle className="w-5 h-5 text-red-500" />}
            </CardTitle>
            <CardDescription>
              Cross-chain relayer processing your storage request
            </CardDescription>
          </div>
          {(result || !isActive) && (
            <Button variant="outline" size="sm" onClick={onReset}>
              New Storage
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          {progressSteps.map((step, index) => {
            const status = getStepStatus(step.key, index);
            return (
              <div
                key={step.key}
                className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                  status === 'active'
                    ? 'bg-blue-50 border border-blue-200'
                    : status === 'completed'
                    ? 'bg-green-50 border border-green-200'
                    : status === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50'
                }`}
              >
                {getStepIcon(step.key, index)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-sm">{step.title}</p>
                    <Badge
                      variant={
                        status === 'completed'
                          ? 'default'
                          : status === 'active'
                          ? 'secondary'
                          : status === 'error'
                          ? 'destructive'
                          : 'outline'
                      }
                      className="text-xs"
                    >
                      {status === 'completed'
                        ? 'Done'
                        : status === 'active'
                        ? 'Processing'
                        : status === 'error'
                        ? 'Failed'
                        : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {result && result.success && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-800 text-sm">Storage Successful!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 text-sm">
                {result.blobId && (
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <p className="font-medium text-green-800">Blob ID</p>
                      <p className="text-gray-600 font-mono text-xs">
                        {result.blobId.slice(0, 16)}...{result.blobId.slice(-8)}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.blobId, 'Blob ID')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://aggregator.walrus-testnet.walrus.space/v1/${result.blobId}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white rounded border">
                    <p className="text-xs text-gray-600">USDC Spent</p>
                    <p className="font-semibold text-green-800">{result.cost.usdcAmount}</p>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <p className="text-xs text-gray-600">WAL Used</p>
                    <p className="font-semibold text-green-800">{result.cost.walAmount}</p>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <p className="text-xs text-gray-600">Gas Fees</p>
                    <p className="font-semibold text-green-800">{result.cost.gasFees}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && !result.success && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Storage Failed</p>
                  <p className="text-sm text-red-600">{result.error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}