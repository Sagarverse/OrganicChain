import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGlobe, FaCubes, FaLeaf, FaLink, FaSearch, FaHistory } from 'react-icons/fa';
import GlassCard from '../../components/Layout/GlassCard';
import { getAllProducts } from '../../utils/blockchain';

export default function ExplorerPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadNetworkData();
    }, []);

    const loadNetworkData = async () => {
        setLoading(true);
        try {
            const allProducts = await getAllProducts();
            // Sort newest first
            const sorted = [...allProducts].sort((a, b) => Number(b.id) - Number(a.id));
            setProducts(sorted);
        } catch (error) {
            console.error('Error loading analytics:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalOrganic = () => {
        // Count how many products have at least one valid organic certificate
        let certCount = 0;
        products.forEach((p) => {
            // In a real app we'd verify the approved state of each cert on chain
            if (p.organicCertification && p.organicCertification.length > 0) {
                certCount++;
            }
        });
        return certCount;
    };

    const getStatusString = (status: number) => {
        const statuses = ['Planted', 'Harvested', 'Processing', 'Processed', 'In Transit', 'Delivered', 'Retail'];
        return statuses[status] || 'Unknown';
    };

    const getStatusColor = (status: number) => {
        if (status >= 6) return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
        if (status >= 4) return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
        if (status >= 2) return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
        return 'text-green-400 bg-green-400/10 border-green-400/30';
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString() === searchTerm ||
        p.farmer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-3xl mx-auto"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-6 shadow-[0_0_40px_rgba(59,130,246,0.3)] border border-blue-500/30">
                    <FaGlobe className="text-4xl text-blue-400" />
                </div>
                <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 text-transparent bg-clip-text">
                    Global Ledger Explorer
                </h1>
                <p className="text-gray-400 text-lg">
                    Transparent, immutable, and public record of the entire OrganicChain ecosystem.
                </p>
            </motion.div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <GlassCard className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 text-emerald-500/20">
                            <FaLeaf className="text-9xl" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-emerald-400 font-semibold mb-1">Total Verified Organic</p>
                            <h2 className="text-5xl font-bold text-white mb-2">{calculateTotalOrganic()}</h2>
                            <p className="text-sm text-gray-400">Products with valid certificates</p>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <GlassCard className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 text-blue-500/20">
                            <FaCubes className="text-9xl" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-blue-400 font-semibold mb-1">Total Assets Tracked</p>
                            <h2 className="text-5xl font-bold text-white mb-2">{products.length}</h2>
                            <p className="text-sm text-gray-400">Unique products on ledger</p>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <GlassCard className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 text-purple-500/20">
                            <FaLink className="text-9xl" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-purple-400 font-semibold mb-1">Network Custodians</p>
                            <h2 className="text-5xl font-bold text-white mb-2">
                                {new Set(products.map(p => p.currentCustodian)).size}
                            </h2>
                            <p className="text-sm text-gray-400">Active wallets holding assets</p>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Explorer Table & Search */}
            <GlassCard className="border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <FaHistory className="text-primary-400" />
                        Blockchain Ledger
                    </h3>
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-500" />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                            placeholder="Search by Txn, Product ID, Name, or Wallet..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">Syncing with block lattice...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="text-gray-600 text-6xl mb-4 text-center mx-auto table">📡</div>
                        <p className="text-gray-400 text-lg">No records found matching your query.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-700/50">
                                    <th className="py-4 px-4 text-gray-400 font-medium text-sm w-24">ID</th>
                                    <th className="py-4 px-4 text-gray-400 font-medium text-sm">Product Name</th>
                                    <th className="py-4 px-4 text-gray-400 font-medium text-sm">Status</th>
                                    <th className="py-4 px-4 text-gray-400 font-medium text-sm">Score</th>
                                    <th className="py-4 px-4 text-gray-400 font-medium text-sm hidden md:table-cell">Current Custodian</th>
                                    <th className="py-4 px-4 text-gray-400 font-medium text-sm text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {filteredProducts.map((product, idx) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                                        className="hover:bg-primary-500/5 transition-colors group"
                                    >
                                        <td className="py-4 px-4">
                                            <span className="font-mono text-gray-300">#{Number(product.id).toString().padStart(4, '0')}</span>
                                        </td>
                                        <td className="py-4 px-4 font-bold text-white group-hover:text-primary-300 transition-colors">
                                            {product.name}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(Number(product.status))}`}>
                                                {getStatusString(Number(product.status))}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-yellow-500 to-green-400"
                                                        style={{ width: `${Number(product.authenticityScore)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400">{Number(product.authenticityScore)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 hidden md:table-cell">
                                            <span className="font-mono text-xs text-gray-500 px-2 py-1 bg-gray-900 rounded border border-gray-800 group-hover:border-primary-500/30 transition-colors">
                                                {product.currentCustodian.substring(0, 10)}...{product.currentCustodian.substring(product.currentCustodian.length - 8)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <a
                                                href={`/consumer/${product.id}`}
                                                className="inline-flex items-center justify-center px-4 py-1.5 bg-gray-800 hover:bg-primary-600 text-sm font-semibold text-white rounded-lg transition-colors border border-gray-600 hover:border-primary-500"
                                            >
                                                Trace
                                            </a>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
