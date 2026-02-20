/// <reference types="cypress" />

describe('Consumer Product Verification', () => {
  beforeEach(() => {
    // Mock product data
    cy.mockContract('verifyProduct', {
      isAuthentic: true,
      score: 95,
      details: 'Good - Product meets authenticity standards'
    });

    cy.mockContract('getProductHistory', {
      product: {
        id: 1,
        name: 'Organic Hass Avocados',
        cropType: 1,
        status: 'Delivered',
        farmer: '0xFarmerAddress',
        currentCustodian: '0xRetailerAddress',
        authenticityScore: 95,
        plantedDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
        harvestDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
        recalled: false
      },
      batches: [
        {
          batchId: 1,
          processor: '0xProcessorAddress',
          quantity: 500,
          locationHistory: [
            { latitude: '34.0522', longitude: '-118.2437', timestamp: Date.now() }
          ],
          sensorLogs: [
            { temperature: 2500, humidity: 7000, anomaly: false, timestamp: Date.now() }
          ]
        }
      ]
    });

    cy.visit('/consumer');
  });

  it('should load the consumer verification page', () => {
    cy.contains('Verify Product').should('be.visible');
    cy.contains('Organic Supply Chain').should('be.visible');
  });

  describe('QR Code Scanner', () => {
    it('should display QR scanner button', () => {
      cy.get('[data-cy="scan-qr-btn"]').should('be.visible');
      cy.get('[data-cy="scan-qr-btn"]').should('contain', 'Scan QR Code');
    });

    it('should open camera on QR scan button click', () => {
      cy.get('[data-cy="scan-qr-btn"]').click();
      cy.get('[data-cy="qr-scanner-modal"]').should('be.visible');
    });

    it('should allow manual product ID entry', () => {
      cy.get('[data-cy="manual-entry-btn"]').click();
      cy.get('input[name="productId"]').should('be.visible');
    });
  });

  describe('Product Verification', () => {
    beforeEach(() => {
      // Enter product ID manually
      cy.get('[data-cy="manual-entry-btn"]').click();
      cy.get('input[name="productId"]').type('1');
      cy.get('button[type="submit"]').click();
      cy.waitForTransaction();
    });

    it('should display product information', () => {
      cy.contains('Organic Hass Avocados').should('be.visible');
      cy.contains('Product #1').should('be.visible');
    });

    it('should show authenticity score with visual indicator', () => {
      cy.get('[data-cy="authenticity-score"]').should('contain', '95');
      cy.get('[data-cy="score-indicator"]').should('have.class', 'score-high');
    });

    it('should display verification badge for authentic products', () => {
      cy.get('[data-cy="authentic-badge"]').should('be.visible');
      cy.contains('Verified Authentic').should('be.visible');
    });

    it('should show product status', () => {
      cy.contains('Delivered').should('be.visible');
    });

    it('should display farm information', () => {
      cy.contains('Farm Location').should('be.visible');
      cy.get('[data-cy="farm-coordinates"]').should('exist');
    });

    it('should show planting and harvest dates', () => {
      cy.contains('Planted').should('be.visible');
      cy.contains('Harvested').should('be.visible');
    });
  });

  describe('Supply Chain Timeline', () => {
    beforeEach(() => {
      cy.get('[data-cy="manual-entry-btn"]').click();
      cy.get('input[name="productId"]').type('1');
      cy.get('button[type="submit"]').click();
      cy.waitForTransaction();
    });

    it('should display supply chain timeline', () => {
      cy.get('[data-cy="timeline"]').should('be.visible');
    });

    it('should show all lifecycle stages', () => {
      cy.get('[data-cy="timeline"]').within(() => {
        cy.contains('Planted').should('be.visible');
        cy.contains('Harvested').should('be.visible');
        cy.contains('Processed').should('be.visible');
        cy.contains('Delivered').should('be.visible');
      });
    });

    it('should display timestamps for each stage', () => {
      cy.get('[data-cy="timeline-event"]').each(($event) => {
        cy.wrap($event).find('[data-cy="timestamp"]').should('exist');
      });
    });
  });

  describe('Batch Information', () => {
    beforeEach(() => {
      cy.get('[data-cy="manual-entry-btn"]').click();
      cy.get('input[name="productId"]').type('1');
      cy.get('button[type="submit"]').click();
      cy.waitForTransaction();
      cy.get('[data-cy="view-batch-btn"]').click();
    });

    it('should display batch details', () => {
      cy.contains('Batch #1').should('be.visible');
      cy.contains('500').should('be.visible'); // Quantity
    });

    it('should show sensor data', () => {
      cy.get('[data-cy="sensor-data"]').should('be.visible');
      cy.contains('Temperature').should('be.visible');
      cy.contains('Humidity').should('be.visible');
    });

    it('should display location tracking map', () => {
      cy.get('[data-cy="location-map"]').should('be.visible');
    });

    it('should show no anomalies for clean products', () => {
      cy.get('[data-cy="anomaly-alert"]').should('not.exist');
    });
  });

  describe('Fraud Detection', () => {
    beforeEach(() => {
      // Mock fraudulent product
      cy.mockContract('verifyProduct', {
        isAuthentic: false,
        score: 35,
        details: 'Poor - Multiple anomalies detected'
      });

      cy.mockContract('getProductHistory', {
        product: {
          id: 2,
          name: 'Suspicious Organic Kale',
          authenticityScore: 35,
          recalled: false
        },
        batches: [
          {
            batchId: 2,
            sensorLogs: [
              { temperature: 5000, humidity: 9500, anomaly: true, timestamp: Date.now() }
            ]
          }
        ]
      });

      cy.get('[data-cy="manual-entry-btn"]').click();
      cy.get('input[name="productId"]').type('2');
      cy.get('button[type="submit"]').click();
      cy.waitForTransaction();
    });

    it('should show warning for low authenticity score', () => {
      cy.get('[data-cy="warning-badge"]').should('be.visible');
      cy.contains('Verification Failed').should('be.visible');
    });

    it('should display authenticity score in red', () => {
      cy.get('[data-cy="authenticity-score"]').should('have.css', 'color', 'rgb(239, 68, 68)'); // red
    });

    it('should show anomaly alerts', () => {
      cy.get('[data-cy="anomaly-alert"]').should('be.visible');
      cy.contains('anomaly', { matchCase: false }).should('be.visible');
    });

    it('should display fraud indicators', () => {
      cy.contains('Multiple anomalies detected').should('be.visible');
    });
  });

  describe('Recalled Products', () => {
    beforeEach(() => {
      cy.mockContract('getProductHistory', {
        product: {
          id: 3,
          name: 'Recalled Product',
          recalled: true,
          authenticityScore: 0
        },
        batches: []
      });

      cy.get('[data-cy="manual-entry-btn"]').click();
      cy.get('input[name="productId"]').type('3');
      cy.get('button[type="submit"]').click();
      cy.waitForTransaction();
    });

    it('should show recall notice', () => {
      cy.get('[data-cy="recall-notice"]').should('be.visible');
      cy.contains('PRODUCT RECALLED').should('be.visible');
    });

    it('should display recall warning prominently', () => {
      cy.get('[data-cy="recall-notice"]').should('have.css', 'background-color', 'rgb(254, 226, 226)'); // red background
    });

    it('should set authenticity score to 0', () => {
      cy.get('[data-cy="authenticity-score"]').should('contain', '0');
    });
  });

  describe('Certificate Verification', () => {
    beforeEach(() => {
      cy.mockContract('getCertificate', {
        certificateId: 1,
        productId: 1,
        issuer: 'USDA Organic',
        validUntil: Date.now() + 365 * 24 * 60 * 60 * 1000,
        documentHash: 'QmCertHash123',
        approved: true,
        approvedBy: '0xInspectorAddress'
      });

      cy.get('[data-cy="manual-entry-btn"]').click();
      cy.get('input[name="productId"]').type('1');
      cy.get('button[type="submit"]').click();
      cy.waitForTransaction();
      cy.get('[data-cy="view-certificate-btn"]').click();
    });

    it('should display certificate information', () => {
      cy.contains('USDA Organic').should('be.visible');
      cy.contains('Certificate').should('be.visible');
    });

    it('should show approval status', () => {
      cy.contains('Approved').should('be.visible');
      cy.get('[data-cy="approval-badge"]').should('be.visible');
    });

    it('should display IPFS link to certificate', () => {
      cy.get('[data-cy="ipfs-link"]').should('have.attr', 'href').and('include', 'ipfs');
    });

    it('should show certificate validity period', () => {
      cy.contains('Valid Until').should('be.visible');
    });
  });

  describe('Share & Export', () => {
    beforeEach(() => {
      cy.get('[data-cy="manual-entry-btn"]').click();
      cy.get('input[name="productId"]').type('1');
      cy.get('button[type="submit"]').click();
      cy.waitForTransaction();
    });

    it('should have share button', () => {
      cy.get('[data-cy="share-btn"]').should('be.visible');
    });

    it('should show share modal with options', () => {
      cy.get('[data-cy="share-btn"]').click();
      cy.get('[data-cy="share-modal"]').should('be.visible');
      cy.contains('Twitter').should('be.visible');
      cy.contains('Facebook').should('be.visible');
    });

    it('should allow downloading verification report', () => {
      cy.get('[data-cy="download-report-btn"]').should('be.visible');
      cy.get('[data-cy="download-report-btn"]').click();
      // Verify download initiated
    });

    it('should copy product link to clipboard', () => {
      cy.get('[data-cy="copy-link-btn"]').click();
      cy.contains('Copied').should('be.visible');
    });
  });

  describe('Search & Browse', () => {
    it('should have search functionality', () => {
      cy.get('[data-cy="search-input"]').should('be.visible');
      cy.get('[data-cy="search-input"]').type('Avocado');
      cy.get('[data-cy="search-btn"]').click();
    });

    it('should display recent verifications', () => {
      cy.get('[data-cy="recent-verifications"]').should('be.visible');
    });

    it('should show featured products', () => {
      cy.get('[data-cy="featured-products"]').within(() => {
        cy.get('[data-cy="product-card"]').should('have.length.at.least', 1);
      });
    });
  });

  describe('Mobile Experience', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should be mobile responsive', () => {
      cy.get('[data-cy="scan-qr-btn"]').should('be.visible');
      cy.get('main').should('be.visible');
    });

    it('should have mobile-optimized layout', () => {
    });

    it('should support touch gestures for timeline', () => {
      cy.get('[data-cy="manual-entry-btn"]').click();
      cy.get('input[name="productId"]').type('1');
      cy.get('button[type="submit"]').click();
      cy.waitForTransaction();

      cy.get('[data-cy="timeline"]').should('be.visible');
      // Swipe gestures would be tested here
    });
  });

  describe('Performance & Loading', () => {
    it('should show loading skeleton while fetching data', () => {
      cy.get('[data-cy="manual-entry-btn"]').click();
      cy.get('input[name="productId"]').type('1');
      cy.get('button[type="submit"]').click();

      cy.get('[data-cy="loading-skeleton"]').should('be.visible');
    });

    it('should handle slow network gracefully', () => {
      cy.intercept('/api/**', (req) => {
        req.on('response', (res) => {
          res.setDelay(3000);
        });
      });

      cy.get('[data-cy="manual-entry-btn"]').click();
      cy.get('input[name="productId"]').type('1');
      cy.get('button[type="submit"]').click();

      cy.get('[data-cy="loading-spinner"]', { timeout: 5000 }).should('be.visible');
    });
  });
});
