import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants';
import GlassCard from '../components/Layout/GlassCard';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

export default function DiagnosticPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnostics: DiagnosticResult[] = [];

    // Check 1: MetaMask Installation
    if (typeof window.ethereum !== 'undefined') {
      diagnostics.push({
        name: 'MetaMask Installation',
        status: 'success',
        message: 'MetaMask is installed',
      });
    } else {
      diagnostics.push({
        name: 'MetaMask Installation',
        status: 'error',
        message: 'MetaMask is not installed',
        details: 'Please install MetaMask from https://metamask.io',
      });
      setResults(diagnostics);
      setIsRunning(false);
      return;
    }

    // Check 2: Network Connection
    try {
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      if (Number(network.chainId) === 31337) {
        diagnostics.push({
          name: 'Network Connection',
          status: 'success',
          message: 'Connected to Hardhat Local (Chain ID: 31337)',
        });
      } else {
        diagnostics.push({
          name: 'Network Connection',
          status: 'error',
          message: `Wrong network detected (Chain ID: ${network.chainId})`,
          details: 'Please switch to Hardhat Local network in MetaMask',
        });
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'Network Connection',
        status: 'error',
        message: 'Failed to connect to network',
        details: error.message,
      });
    }

    // Check 3: Wallet Connection
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_accounts', []);
      
      if (accounts.length > 0) {
        const balance = await provider.getBalance(accounts[0]);
        const ethBalance = Number(balance) / 1e18;
        
        diagnostics.push({
          name: 'Wallet Connection',
          status: 'success',
          message: `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          details: `Balance: ${ethBalance.toFixed(4)} ETH`,
        });
      } else {
        diagnostics.push({
          name: 'Wallet Connection',
          status: 'warning',
          message: 'No wallet connected',
          details: 'Click "Connect Wallet" in the navigation bar',
        });
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'Wallet Connection',
        status: 'error',
        message: 'Failed to check wallet connection',
        details: error.message,
      });
    }

    // Check 4: Smart Contract
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === '0x') {
        diagnostics.push({
          name: 'Smart Contract',
          status: 'error',
          message: 'Contract not found at address',
          details: `Address: ${CONTRACT_ADDRESS}. Make sure Hardhat node is running and contract is deployed.`,
        });
      } else {
        try {
          const totalProducts = await contract.getTotalProducts();
          diagnostics.push({
            name: 'Smart Contract',
            status: 'success',
            message: 'Contract is accessible',
            details: `Address: ${CONTRACT_ADDRESS}, Total Products: ${totalProducts.toString()}`,
          });
        } catch (error: any) {
          diagnostics.push({
            name: 'Smart Contract',
            status: 'warning',
            message: 'Contract found but method call failed',
            details: error.message,
          });
        }
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'Smart Contract',
        status: 'error',
        message: 'Failed to check contract',
        details: error.message,
      });
    }

    // Check 5: Role Assignment
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_accounts', []);
      
      if (accounts.length > 0) {
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const account = accounts[0];
        
        // Check for FARMER_ROLE
        const FARMER_ROLE = '0x' + Buffer.from('FARMER_ROLE', 'utf8').toString('hex').padStart(64, '0');
        
        try {
          const hasFarmerRole = await contract.hasRole(FARMER_ROLE, account);
          
          if (hasFarmerRole) {
            diagnostics.push({
              name: 'Farmer Role',
              status: 'success',
              message: 'Account has FARMER_ROLE',
              details: 'You can register products',
            });
          } else {
            diagnostics.push({
              name: 'Farmer Role',
              status: 'warning',
              message: 'Account does not have FARMER_ROLE',
              details: 'Use Account #0 (0xf39F...2266) or Account #1 (0x7099...79C8) for farmer operations',
            });
          }
        } catch (error: any) {
          diagnostics.push({
            name: 'Farmer Role',
            status: 'info',
            message: 'Could not check role',
            details: 'Role check method may not be available',
          });
        }
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'Farmer Role',
        status: 'info',
        message: 'Skipped role check',
        details: 'No wallet connected',
      });
    }

    // Check 6: Local Services
    try {
      const response = await fetch('http://127.0.0.1:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        }),
      });
      
      if (response.ok) {
        diagnostics.push({
          name: 'Hardhat Node',
          status: 'success',
          message: 'Hardhat node is running',
          details: 'Local blockchain is accessible at http://127.0.0.1:8545',
        });
      } else {
        diagnostics.push({
          name: 'Hardhat Node',
          status: 'error',
          message: 'Hardhat node is not responding',
          details: 'Run: cd blockchain && npx hardhat node',
        });
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'Hardhat Node',
        status: 'error',
        message: 'Cannot connect to Hardhat node',
        details: 'Make sure Hardhat node is running: cd blockchain && npx hardhat node',
      });
    }

    setResults(diagnostics);
    setIsRunning(false);
  };

  // Removed auto-run to prevent continuous refresh and allow scrolling

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">System Diagnostics</h1>
          <p className="text-gray-400">Check your setup and troubleshoot issues</p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            {isRunning ? 'Running Tests...' : 'Run Diagnostics'}
          </button>
          
          <a
            href="/METAMASK_SETUP.md"
            target="_blank"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            📖 Setup Guide
          </a>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <GlassCard key={index}>
              <div className="flex items-start gap-4">
                <div className="text-3xl">{getStatusIcon(result.status)}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{result.name}</h3>
                  <p className={`${getStatusColor(result.status)} mb-2`}>
                    {result.message}
                  </p>
                  {result.details && (
                    <p className="text-sm text-gray-400 bg-black/30 p-3 rounded font-mono">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {results.length === 0 && !isRunning && (
          <GlassCard>
            <p className="text-center text-gray-400">
              Click "Run Diagnostics" to check your setup
            </p>
          </GlassCard>
        )}

        {/* Quick Fixes */}
        <div className="mt-8">
          <GlassCard>
            <h2 className="text-2xl font-bold mb-4">Quick Fixes</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-primary-400 mb-2">
                  MetaMask Not Installed
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  Install MetaMask browser extension from{' '}
                  <a
                    href="https://metamask.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 underline"
                  >
                    metamask.io
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary-400 mb-2">
                  Wrong Network
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  Add Hardhat Local network to MetaMask:
                </p>
                <ul className="text-sm text-gray-400 list-disc list-inside space-y-1 bg-black/30 p-3 rounded font-mono">
                  <li>Network Name: Hardhat Local</li>
                  <li>RPC URL: http://127.0.0.1:8545</li>
                  <li>Chain ID: 31337</li>
                  <li>Currency Symbol: ETH</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary-400 mb-2">
                  Missing FARMER_ROLE
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  Import one of these test accounts to MetaMask:
                </p>
                <ul className="text-sm text-gray-400 space-y-2 bg-black/30 p-3 rounded font-mono">
                  <li>
                    <strong>Farmer Account:</strong><br />
                    Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8<br />
                    Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary-400 mb-2">
                  Hardhat Node Not Running
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  Start the local blockchain:
                </p>
                <pre className="text-sm text-gray-400 bg-black/30 p-3 rounded font-mono">
                  cd blockchain && npx hardhat node
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary-400 mb-2">
                  Contract Not Deployed
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  Deploy the smart contract:
                </p>
                <pre className="text-sm text-gray-400 bg-black/30 p-3 rounded font-mono">
                  cd blockchain && npx hardhat run scripts/deploy.ts --network localhost
                </pre>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
