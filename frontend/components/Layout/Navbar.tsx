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

  const navLinks = [
    { href: '/farmer', label: 'Farmer' },
    { href: '/processor', label: 'Processor' },
    { href: '/retailer', label: 'Retailer' },
    { href: '/inspector', label: 'Inspector' },
    { href: '/location', label: 'Tracking' },
    { href: '/admin', label: 'Admin' },
    { href: '/consumer', label: 'Verify' },
  ];

  return (
    <motion.nav
      className="navbar-liquid-glass"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="navbar-container">
        {/* Logo Section */}
        <motion.div
          className="navbar-logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="navbar-logo-icon">
              <FaLeaf className="text-emerald-400" />
            </div>
            <span className="navbar-logo-text hidden sm:inline">OrganicChain</span>
          </Link>
        </motion.div>

        {/* Navigation Links */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <motion.div key={link.href} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
              <Link href={link.href} className="navbar-link">
                {link.label}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Wallet Connection Section */}
        <div className="navbar-actions">
          {account ? (
            <motion.div
              className="navbar-wallet-button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 0 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaUser className="text-white text-sm" />
              <span>{formatAddress(account)}</span>
            </motion.div>
          ) : (
            <motion.button
              onClick={handleConnect}
              disabled={isConnecting}
              className={`navbar-wallet-button ${isConnecting ? 'disabled' : ''}`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 0 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaWallet className="text-white text-sm" />
              <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
