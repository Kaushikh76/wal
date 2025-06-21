'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, File, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { relayerService } from '@/lib/relayer-service';

interface DataUploadProps {
  onUploadStart: () => void;
  onUploadComplete: (result: any) => void;
}

export function DataUpload({ onUploadStart, onUploadComplete }: DataUploadProps) {
  const [textData, setTextData] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [costEstimate, setCostEstimate] = useState<{
    usdcCost: string;
    walCost: string;
    dataSize: number;
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    toast.success(`${acceptedFiles.length} file(s) added`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const calculateCost = async () => {
    let data: string | Blob;
    
    if (activeTab === 'text' && textData) {
      data = textData;
    } else if (activeTab === 'files' && uploadedFiles.length > 0) {
      // For multiple files, we'll estimate based on the first file
      data = uploadedFiles[0];
    } else {
      toast.error('Please provide data to estimate cost');
      return;
    }

    try {
      const estimate = await relayerService.estimateStorageCost(data);
      setCostEstimate(estimate);
      toast.success('Cost estimated successfully');
    } catch (error) {
      console.error('Cost estimation failed:', error);
      toast.error('Failed to estimate cost');
    }
  };

  const handleStore = async () => {
    if (!costEstimate) {
      toast.error('Please calculate cost first');
      return;
    }

    let data: string | Blob;
    let dataType: 'text' | 'image' | 'file';

    if (activeTab === 'text' && textData) {
      data = textData;
      dataType = 'text';
    } else if (activeTab === 'files' && uploadedFiles.length > 0) {
      data = uploadedFiles[0]; // For now, store one file at a time
      dataType = uploadedFiles[0].type.startsWith('image/') ? 'image' : 'file';
    } else {
      toast.error('No data to store');
      return;
    }

    setIsProcessing(true);
    onUploadStart();

    try {
      const result = await relayerService.processStorageRequest({
        data,
        dataType,
        userAddress: '0x1234...', // Would come from connected wallet
        suiAddress: '0x5678...', // Would come from connected Sui wallet
      });

      if (result.success) {
        toast.success('Data stored successfully!');
        onUploadComplete(result);
        
        // Reset form
        setTextData('');
        setUploadedFiles([]);
        setCostEstimate(null);
      } else {
        toast.error(result.error || 'Storage failed');
      }
    } catch (error) {
      console.error('Storage failed:', error);
      toast.error('Storage operation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('text/')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Store Data on Walrus</span>
        </CardTitle>
        <CardDescription>
          Upload text, images, or files to decentralized storage via cross-chain relayer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Files</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-data">Text Content</Label>
              <Textarea
                id="text-data"
                placeholder="Enter the text you want to store on Walrus Protocol..."
                value={textData}
                onChange={(e) => setTextData(e.target.value)}
                rows={6}
                className="resize-none"
              />
              {textData && (
                <p className="text-sm text-gray-500">
                  Characters: {textData.length} • Size: {formatFileSize(new Blob([textData]).size)}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Support for images, documents, and more (max 10MB each)
                  </p>
                </div>
              )}
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file)}
                        <span className="text-sm font-medium">{file.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(file.size)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {costEstimate && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Data Size</p>
                  <p className="font-semibold">{formatFileSize(costEstimate.dataSize)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">WAL Cost</p>
                  <p className="font-semibold">{costEstimate.walCost} WAL</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">USDC Cost</p>
                  <p className="font-semibold">{costEstimate.usdcCost} USDC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-2">
          <Button
            onClick={calculateCost}
            variant="outline"
            disabled={
              isProcessing ||
              (activeTab === 'text' && !textData) ||
              (activeTab === 'files' && uploadedFiles.length === 0)
            }
            className="flex-1"
          >
            Calculate Cost
          </Button>
          <Button
            onClick={handleStore}
            disabled={!costEstimate || isProcessing}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Storing...</span>
              </div>
            ) : (
              'Store Data'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}