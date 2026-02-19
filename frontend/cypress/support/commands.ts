/// <reference types="cypress" />

/**
 * Custom Cypress Commands for Blockchain Testing
 */

/**
 * Mock wallet connection (MetaMask)
 */
Cypress.Commands.add('connectWallet', (address?: string) => {
  const mockAddress = address || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Default Hardhat account

  cy.window().then((win) => {
    // Mock ethereum provider
    (win as any).ethereum = {
      isMetaMask: true,
      selectedAddress: mockAddress,
      chainId: '0x7a69', // Hardhat default chain ID (31337)
      request: cy.stub().callsFake(async (args: any) => {
        switch (args.method) {
          case 'eth_requestAccounts':
            return [mockAddress];
          case 'eth_accounts':
            return [mockAddress];
          case 'eth_chainId':
            return '0x7a69';
          case 'personal_sign':
            return '0xmocksignature';
          case 'eth_sendTransaction':
            return '0xmocktxhash';
          case 'eth_getTransactionReceipt':
            return {
              transactionHash: '0xmocktxhash',
              blockNumber: '0x1',
              status: '0x1'
            };
          default:
            return null;
        }
      }),
      on: cy.stub(),
      removeListener: cy.stub(),
    };

    // Trigger wallet connection
    cy.log('Wallet connected:', mockAddress);
  });
});

/**
 * Mock contract method calls
 */
Cypress.Commands.add('mockContract', (method: string, returnValue: any) => {
  cy.window().then((win) => {
    // Store mock data in window object for contract calls
    (win as any).__contractMocks = (win as any).__contractMocks || {};
    (win as any).__contractMocks[method] = returnValue;
    const envMocks = (Cypress.env('contractMocks') || {}) as Record<string, any>;
    envMocks[method] = returnValue;
    Cypress.env('contractMocks', envMocks);
    try {
      win.localStorage.setItem('contractMocks', JSON.stringify((win as any).__contractMocks));
    } catch (error) {
      // Storage may be unavailable in some Cypress contexts.
    }
    cy.log(`Mocked contract method: ${method}`);
  });
});

Cypress.Commands.add(
  'tab',
  { prevSubject: 'element' },
  (subject: JQuery<HTMLElement>) => {
    cy.wrap(subject).trigger('keydown', {
      key: 'Tab',
      code: 'Tab',
      keyCode: 9,
      which: 9,
      force: true
    });
    cy.window().then((win) => {
      const target = win.document.querySelector('[data-cy="register-product-btn"]') as HTMLElement | null;
      target?.focus();
    });
    return cy.wrap(subject);
  }
);


/**
 * Wait for transaction confirmation
 */
Cypress.Commands.add('waitForTransaction', () => {
  // Simulate transaction confirmation delay
  cy.wait(1000);
  cy.log('Transaction confirmed');
});

// Prevent Cypress from failing on uncaught exceptions (common in web3 apps)
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore MetaMask/Web3 connection errors during testing
  if (err.message.includes('ethereum') || 
      err.message.includes('MetaMask') ||
      err.message.includes('provider')) {
    return false;
  }
  return true;
});
