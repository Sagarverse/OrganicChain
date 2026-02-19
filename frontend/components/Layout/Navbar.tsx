import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaLeaf, FaWallet, FaUser } from 'react-icons/fa';
import { connectWallet, getCurrentAccount, formatAddress } from '../../utils/blockchain';

const Navbar: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
    
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    const currentAccount = await getCurrentAccount();
    setAccount(currentAccount);
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <motion.nav
      className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <FaLeaf className="text-primary-400 text-3xl group-hover:rotate-12 transition-transform" />
          <span className="text-2xl font-bold gradient-text">
            OrganicChain
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/farmer" className="nav-link hover:text-primary-400 transition-colors">
            Farmer
          </Link>
          <Link href="/processor" className="nav-link hover:text-primary-400 transition-colors">
            Processor
          </Link>
          <Link href="/retailer" className="nav-link hover:text-primary-400 transition-colors">
            Retailer
          </Link>
          <Link href="/inspector" className="nav-link hover:text-primary-400 transition-colors">
            Inspector
          </Link>
          <Link href="/consumer" className="nav-link hover:text-primary-400 transition-colors">
            Verify Product
          </Link>
        </div>

        {/* Wallet Connection */}
        <div>
          {account ? (
            <motion.div
              className="glass-button flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaUser className="text-sm" />
              <span>{formatAddress(account)}</span>
            </motion.div>
          ) : (
            <motion.button
              onClick={handleConnect}
              disabled={isConnecting}
              className="glass-button flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaWallet />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
