import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { QrReader } from 'react-qr-reader';
import { motion } from 'framer-motion';
import { FaQrcode, FaCamera, FaTimesCircle } from 'react-icons/fa';
import GlassCard from '../components/Layout/GlassCard';

export default function ScanPage() {
    const [data, setData] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const router = useRouter();

    // Ensure this only runs on client to avoid hydration issues with camera
    useEffect(() => {
        setIsScanning(true);
    }, []);

    const handleScan = (result: any, error: any) => {
        if (result) {
            const scannedText = result?.text || result;
            setData(scannedText);
            setIsScanning(false);

            // Auto-navigate if it's a URL to our product page
            if (scannedText.includes('/consumer/')) {
                // Extract the productId from the URL
                const parts = scannedText.split('/consumer/');
                if (parts.length > 1) {
                    const productId = parts[1].split('?')[0].split('#')[0];
                    router.push(`/consumer/${productId}`);
                }
            } else {
                // Just generic text, maybe an ID. Let's try to parse as ID.
                if (!isNaN(Number(scannedText))) {
                    router.push(`/consumer/${scannedText}`);
                }
            }
        }

        if (error && error.message !== 'No QR code found') {
            console.warn("QR Scan Error:", error);
        }
    };

    const resetScan = () => {
        setData(null);
        setError(null);
        setIsScanning(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <GlassCard className="overflow-hidden border-primary-500/30">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <FaQrcode className="text-3xl text-primary-400 animate-pulse" />
                            </div>
                            <h1 className="text-3xl font-bold gradient-text">Verify Product</h1>
                            <p className="text-gray-400 mt-2">Scan an OrganicChain QR code from a product label to view its complete blockchain history.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                                <FaTimesCircle className="text-red-400 mt-1" />
                                <p className="text-sm text-red-200">{error}</p>
                            </div>
                        )}

                        <div className="relative rounded-2xl overflow-hidden bg-black/50 aspect-square border-2 border-primary-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)_inset]">
                            {isScanning ? (
                                <>
                                    <QrReader
                                        onResult={handleScan}
                                        constraints={{ facingMode: 'environment' }}
                                        containerStyle={{ width: '100%', height: '100%' }}
                                        videoStyle={{ objectFit: 'cover' }}
                                    />

                                    {/* Neon Scanner Reticle */}
                                    <div className="absolute inset-0 pointer-events-none border-[4px] border-primary-400/50 m-8 rounded-xl z-10" />
                                    <motion.div
                                        className="absolute left-8 right-8 h-1 bg-primary-400 blur-sm z-20"
                                        animate={{ top: ['2rem', 'calc(100% - 2rem)', '2rem'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                    />
                                    <div className="absolute inset-x-0 bottom-4 text-center z-10 bg-black/40 py-2 backdrop-blur-md">
                                        <p className="text-xs text-primary-300 flex items-center justify-center gap-2">
                                            <FaCamera className="animate-pulse" /> Point camera at QR Code
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                                        <FaQrcode className="text-4xl text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Scan Successful</h3>
                                    <div className="bg-black/40 p-3 rounded-lg w-full overflow-hidden text-center border border-gray-700">
                                        <p className="text-xs text-green-400 font-mono break-words">{data}</p>
                                    </div>

                                    <button
                                        onClick={resetScan}
                                        className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm font-semibold transition-colors border border-gray-600 w-full"
                                    >
                                        Scan Another Code
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 text-center text-xs text-gray-500">
                            OrganicChain guarantees secure, tamper-proof verifications directly from the blockchain.
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
}
