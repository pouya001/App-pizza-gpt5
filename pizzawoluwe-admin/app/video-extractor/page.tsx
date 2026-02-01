'use client';

import { useState, useRef, useCallback } from 'react';
import Shell from '../../src/components/Shell';
import Tesseract from 'tesseract.js';

interface Transaction {
  orderNumber: string;
  date: string;
  amount: string;
  paymentMethod: string;
  rawText?: string;
}

export default function VideoExtractorPage() {
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [ocrProgress, setOcrProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSource(url);
      setTransactions([]);
      setLogs([]);
      addLog(`Video uploaded: ${file.name}`);
    }
  };

  const parseTransactionFromText = (text: string): Transaction[] => {
    const results: Transaction[] = [];

    // Pattern to match ORDER #XXXXXX - €XX.XX
    const orderPattern = /ORDER\s*#?\s*(\d+)\s*[-–]\s*[€$]?\s*([\d.,]+)/gi;
    // Pattern to match date AT DD/MM/YYYY HH:MM
    const datePattern = /AT\s+(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2})/gi;
    // Pattern for payment method
    const paymentPattern = /PAYMENT\s*METHOD:\s*(CARD\s*PAYMENT|CASH\s*PAYMENT|[A-Z\s]+PAYMENT)/gi;

    // Split text by ORDER to handle multiple transactions per frame
    const sections = text.split(/(?=ORDER)/i);

    for (const section of sections) {
      if (!section.trim()) continue;

      const orderMatch = section.match(/ORDER\s*#?\s*(\d+)\s*[-–]\s*[€$]?\s*([\d.,]+)/i);
      const dateMatch = section.match(/AT\s+(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2})/i);
      const paymentMatch = section.match(/PAYMENT\s*METHOD:\s*(CARD\s*PAYMENT|CASH\s*PAYMENT|[A-Z\s]+PAYMENT)/i);

      if (orderMatch) {
        results.push({
          orderNumber: orderMatch[1],
          date: dateMatch ? dateMatch[1] : '',
          amount: `€${orderMatch[2].replace(',', '.')}`,
          paymentMethod: paymentMatch ? paymentMatch[1].trim() : '',
          rawText: section.substring(0, 200)
        });
      }
    }

    return results;
  };

  const extractFrameAndOCR = async (
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    time: number,
    worker: Tesseract.Worker
  ): Promise<Transaction[]> => {
    return new Promise((resolve) => {
      video.currentTime = time;

      video.onseeked = async () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve([]);
          return;
        }

        // Draw the video frame on canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data from canvas
        const imageData = canvas.toDataURL('image/png');

        try {
          const result = await worker.recognize(imageData);
          const text = result.data.text;

          if (text.trim()) {
            const parsed = parseTransactionFromText(text);
            resolve(parsed);
          } else {
            resolve([]);
          }
        } catch (error) {
          console.error('OCR error:', error);
          resolve([]);
        }
      };
    });
  };

  const processVideo = async () => {
    if (!videoRef.current || !canvasRef.current || !videoSource) {
      addLog('Error: Video not loaded');
      return;
    }

    setIsProcessing(true);
    setTransactions([]);
    setProgress(0);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Wait for video metadata to load
    await new Promise<void>((resolve) => {
      if (video.readyState >= 1) {
        resolve();
      } else {
        video.onloadedmetadata = () => resolve();
      }
    });

    const duration = video.duration;
    const frameInterval = 0.5; // Extract frame every 0.5 seconds
    const totalFramesToProcess = Math.floor(duration / frameInterval);

    setTotalFrames(totalFramesToProcess);
    addLog(`Video duration: ${duration.toFixed(2)}s, Processing ${totalFramesToProcess} frames`);

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    addLog('Initializing OCR engine...');

    // Initialize Tesseract worker
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setOcrProgress(Math.round(m.progress * 100));
        }
      }
    });

    addLog('OCR engine ready. Starting frame extraction...');

    const allTransactions: Transaction[] = [];

    for (let i = 0; i < totalFramesToProcess; i++) {
      const time = i * frameInterval;
      setCurrentFrame(i + 1);
      setProgress(Math.round(((i + 1) / totalFramesToProcess) * 100));

      const frameTransactions = await extractFrameAndOCR(video, canvas, time, worker);

      if (frameTransactions.length > 0) {
        allTransactions.push(...frameTransactions);
        setTransactions([...allTransactions]);
        addLog(`Frame ${i + 1}/${totalFramesToProcess}: Found ${frameTransactions.length} transaction(s)`);
      }
    }

    await worker.terminate();

    addLog(`Processing complete! Found ${allTransactions.length} transactions total.`);
    setIsProcessing(false);
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Order Number', 'Date', 'Amount', 'Payment Method'];
    const rows = transactions.map(t => [
      t.orderNumber,
      t.date,
      t.amount,
      t.paymentMethod
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleYoutubeUrl = () => {
    if (!youtubeUrl) return;

    // Note: Direct YouTube video playback is restricted by CORS
    // For YouTube videos, user would need to download the video first
    // or use a backend service to fetch the video
    addLog('Note: YouTube videos cannot be processed directly due to browser restrictions.');
    addLog('Please download the video first and upload it as a file.');
    alert('YouTube videos cannot be processed directly in the browser. Please download the video first using a service like yt-dlp, then upload the file.');
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Video Transaction Extractor</h1>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Source Video</h2>

          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Video File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
            </div>

            {/* YouTube URL */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">or</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL (requires download first)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  onClick={handleYoutubeUrl}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Info
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                YouTube videos must be downloaded first. Use yt-dlp or similar tools.
              </p>
            </div>
          </div>
        </div>

        {/* Video Preview & Controls */}
        {videoSource && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Video Preview</h2>

            <div className="space-y-4">
              <video
                ref={videoRef}
                src={videoSource}
                controls
                className="w-full max-h-64 bg-black rounded-lg"
              />

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-4">
                <button
                  onClick={processVideo}
                  disabled={isProcessing}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Start Extraction'}
                </button>

                {transactions.length > 0 && (
                  <button
                    onClick={exportToCSV}
                    className="py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                  >
                    Export CSV
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Processing Progress</h2>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Frame {currentFrame} / {totalFrames}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600">
                OCR Progress: {ocrProgress}%
              </div>

              <div className="text-sm text-gray-600">
                Transactions found: {transactions.length}
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Extracted Transactions ({transactions.length})
              </h2>
              <button
                onClick={exportToCSV}
                className="py-2 px-4 bg-green-600 text-white text-sm rounded-lg font-semibold hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{transaction.orderNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {transaction.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {transaction.amount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.paymentMethod.toLowerCase().includes('card')
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {transaction.paymentMethod}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-gray-900 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-white">Processing Logs</h2>
            <div className="font-mono text-sm text-green-400 max-h-48 overflow-y-auto space-y-1">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
