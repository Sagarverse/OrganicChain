/// <reference types="cypress" />

describe('Farmer Dashboard - Product Registration', () => {
  beforeEach(() => {
    // Visit farmer dashboard
    cy.visit('/farmer');
    
    // Mock wallet connection
    cy.connectWallet();
  });

  it('should load the farmer dashboard', () => {
    cy.contains('Farmer Dashboard').should('be.visible');
    cy.contains('Register New Product').should('be.visible');
  });

  it('should display wallet connection status', () => {
    cy.get('[data-cy="wallet-address"]').should('contain', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  });

  describe('Product Registration Form', () => {
    beforeEach(() => {
      // Open registration form/modal
      cy.get('[data-cy="register-product-btn"]').click();
    });

    it('should display all required form fields', () => {
      cy.get('input[name="productName"]').should('be.visible');
      cy.get('select[name="cropType"]').should('be.visible');
      cy.get('input[name="certificationHash"]').should('be.visible');
      cy.get('input[name="latitude"]').should('be.visible');
      cy.get('input[name="longitude"]').should('be.visible');
      cy.get('input[name="plantedDate"]').should('be.visible');
    });

    it('should show validation errors for empty required fields', () => {
      // Try to submit without filling fields
      cy.get('button[type="submit"]').click();
      
      // Check for validation messages
      cy.contains('required').should('exist');
    });

    it('should successfully register a new product', () => {
      // Fill out the form
      cy.get('input[name="productName"]').type('Organic Hass Avocados');
      cy.get('select[name="cropType"]').select('Fruits');
      cy.get('input[name="certificationHash"]').type('QmTestHashABC123');
      cy.get('input[name="latitude"]').type('34.0522');
      cy.get('input[name="longitude"]').type('-118.2437');
      
      // Set planted date to 30 days ago
      const plantedDate = new Date();
      plantedDate.setDate(plantedDate.getDate() - 30);
      cy.get('input[name="plantedDate"]').type(plantedDate.toISOString().split('T')[0]);

      // Mock contract response
      cy.mockContract('registerProduct', {
        productId: 1,
        transactionHash: '0xmocktxhash'
      });

      // Submit form
      cy.get('button[type="submit"]').click();

      // Wait for transaction
      cy.waitForTransaction();

      // Verify success message
      cy.contains('Product registered successfully').should('be.visible');
      
      // Verify product appears in list
      cy.contains('Organic Hass Avocados').should('be.visible');
    });

    it('should validate GPS coordinates format', () => {
      cy.get('input[name="latitude"]').type('invalid');
      cy.get('input[name="longitude"]').type('invalid');
      cy.get('button[type="submit"]').click();
      
      cy.contains('valid').should('exist');
    });

    it('should prevent future planting dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      cy.get('input[name="plantedDate"]').type(futureDate.toISOString().split('T')[0]);
      cy.get('button[type="submit"]').click();
      
      cy.contains('future').should('exist');
    });
  });

  describe('Product List View', () => {
    beforeEach(() => {
      // Mock existing products
      cy.mockContract('getFarmerProducts', [
        {
          id: 1,
          name: 'Organic Tomatoes',
          status: 'Planted',
          authenticityScore: 100
        },
        {
          id: 2,
          name: 'Wild Blueberries',
          status: 'Harvested',
          authenticityScore: 95
        }
      ]);

      cy.visit('/farmer');
    });

    it('should display list of farmer products', () => {
      cy.contains('Organic Tomatoes').should('be.visible');
      cy.contains('Wild Blueberries').should('be.visible');
    });

    it('should show product status', () => {
      cy.contains('Planted').should('be.visible');
      cy.contains('Harvested').should('be.visible');
    });

    it('should display authenticity scores', () => {
      cy.contains('100').should('be.visible');
      cy.contains('95').should('be.visible');
    });

    it('should allow filtering products by status', () => {
      cy.get('[data-cy="status-filter"]').select('Harvested');
      cy.contains('Organic Tomatoes').should('not.exist');
      cy.contains('Wild Blueberries').should('be.visible');
    });

    it('should allow searching products by name', () => {
      cy.get('[data-cy="search-input"]').type('Tomatoes');
      cy.contains('Organic Tomatoes').should('be.visible');
      cy.contains('Wild Blueberries').should('not.exist');
    });
  });

  describe('Product Details & Actions', () => {
    beforeEach(() => {
      cy.mockContract('getFarmerProducts', [
        {
          id: 1,
          name: 'Organic Tomatoes',
          status: 'Harvested',
          authenticityScore: 98
        }
      ]);

      cy.visit('/farmer');
      cy.contains('Organic Tomatoes').click();
    });

    it('should navigate to product detail page', () => {
      cy.url().should('include', '/product/1');
      cy.contains('Organic Tomatoes').should('be.visible');
    });

    it('should display product information', () => {
      cy.contains('Status').should('be.visible');
      cy.contains('Authenticity Score').should('be.visible');
      cy.contains('98').should('be.visible');
    });

    it('should allow updating product status', () => {
      cy.get('[data-cy="update-status-btn"]').click();
      cy.get('select[name="newStatus"]').select('Processing');
      cy.get('button[type="submit"]').click();

      cy.waitForTransaction();
      cy.contains('Status updated successfully').should('be.visible');
    });

    it('should show product history timeline', () => {
      cy.get('[data-cy="history-timeline"]').should('be.visible');
      cy.contains('Registered').should('be.visible');
      cy.contains('Harvested').should('be.visible');
    });
  });

  describe('Responsiveness & Mobile View', () => {
    it('should be responsive on mobile', () => {
      cy.viewport('iphone-x');
      cy.visit('/farmer');
      
      // Mobile menu should be visible
      cy.get('[data-cy="mobile-menu"]').should('be.visible');
      
      // Registration button should be accessible
      cy.get('[data-cy="register-product-btn"]').should('be.visible');
    });

    it('should be responsive on tablet', () => {
      cy.viewport('ipad-2');
      cy.visit('/farmer');
      
      cy.contains('Farmer Dashboard').should('be.visible');
      cy.get('[data-cy="register-product-btn"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle wallet disconnection', () => {
      cy.window().then((win) => {
        delete (win as any).ethereum;
      });

      cy.visit('/farmer');
      cy.contains('Connect Wallet').should('be.visible');
    });

    it('should handle contract errors gracefully', () => {
      cy.mockContract('registerProduct', {
        error: 'Transaction failed: insufficient funds'
      });

      cy.get('[data-cy="register-product-btn"]').click();
      cy.get('input[name="productName"]').type('Test Product');
      cy.get('button[type="submit"]').click();

      cy.contains('error', { matchCase: false }).should('be.visible');
    });

    it('should show loading state during transactions', () => {
      cy.get('[data-cy="register-product-btn"]').click();
      cy.get('input[name="productName"]').type('Test Product');
      cy.get('button[type="submit"]').click();

      cy.get('[data-cy="loading-spinner"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'register-product-btn');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-cy="register-product-btn"]').should('have.attr', 'aria-label');
      cy.get('input[name="productName"]').should('have.attr', 'aria-label');
    });

    it('should support screen readers', () => {
      cy.get('main').should('have.attr', 'role');
      cy.get('[role="alert"]').should('exist');
    });
  });
});
