// ***********************************************************
// This file is processed and loaded automatically before test files.
// 
// You can add custom commands and overwrite existing commands.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Prevent TypeScript errors for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to mock wallet connection
       * @example cy.connectWallet('0x1234...5678')
       */
      connectWallet(address?: string): Chainable<void>;
      
      /**
       * Custom command to mock contract interaction
       * @example cy.mockContract('registerProduct', mockData)
       */
      mockContract(method: string, returnValue: any): Chainable<void>;
      
      /**
       * Custom command to wait for blockchain transaction
       * @example cy.waitForTransaction()
       */
      waitForTransaction(): Chainable<void>;
    }
  }
}
