import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { OrganicSupplyChain } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("OrganicSupplyChain - Comprehensive Tests", function () {
  let organicChain: OrganicSupplyChain;
  
  let admin: SignerWithAddress;
  let farmer: SignerWithAddress;
  let processor: SignerWithAddress;
  let retailer: SignerWithAddress;
  let inspector: SignerWithAddress;
  let consumer: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const FARMER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("FARMER_ROLE"));
  const PROCESSOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROCESSOR_ROLE"));
  const RETAILER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RETAILER_ROLE"));
  const INSPECTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("INSPECTOR_ROLE"));
  const UPGRADER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("UPGRADER_ROLE"));

  beforeEach(async function () {
    [admin, farmer, processor, retailer, inspector, consumer, unauthorized] = 
      await ethers.getSigners();

    const OrganicSupplyChain = await ethers.getContractFactory("OrganicSupplyChain");
    organicChain = await upgrades.deployProxy(
      OrganicSupplyChain,
      [],
      { initializer: "initialize", kind: "uups" }
    ) as unknown as OrganicSupplyChain;

    await organicChain.waitForDeployment();

    await organicChain.connect(admin).grantFarmerRole(farmer.address);
    await organicChain.connect(admin).grantProcessorRole(processor.address);
    await organicChain.connect(admin).grantRetailerRole(retailer.address);
    await organicChain.connect(admin).grantInspectorRole(inspector.address);
  });

  describe("Deployment & Initialization", function () {
    it("Should deploy successfully", async function () {
      expect(await organicChain.getAddress()).to.be.properAddress;
    });

    it("Should set admin as DEFAULT_ADMIN_ROLE", async function () {
      const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
      expect(await organicChain.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should set admin as UPGRADER_ROLE", async function () {
      expect(await organicChain.hasRole(UPGRADER_ROLE, admin.address)).to.be.true;
    });

    it("Should return correct version", async function () {
      expect(await organicChain.version()).to.equal("1.0.0");
    });

    it("Should start with zero products", async function () {
      expect(await organicChain.getTotalProducts()).to.equal(0);
    });

    it("Should start with zero batches", async function () {
      expect(await organicChain.getTotalBatches()).to.equal(0);
    });
  });

  describe("Role Management", function () {
    it("Should grant FARMER_ROLE correctly", async function () {
      expect(await organicChain.hasRole(FARMER_ROLE, farmer.address)).to.be.true;
    });

    it("Should grant PROCESSOR_ROLE correctly", async function () {
      expect(await organicChain.hasRole(PROCESSOR_ROLE, processor.address)).to.be.true;
    });

    it("Should grant RETAILER_ROLE correctly", async function () {
      expect(await organicChain.hasRole(RETAILER_ROLE, retailer.address)).to.be.true;
    });

    it("Should grant INSPECTOR_ROLE correctly", async function () {
      expect(await organicChain.hasRole(INSPECTOR_ROLE, inspector.address)).to.be.true;
    });

    it("Should reject role grants from non-admin", async function () {
      await expect(
        organicChain.connect(farmer).grantFarmerRole(unauthorized.address)
      ).to.be.reverted;
    });

    it("Should allow admin to grant multiple roles", async function () {
      await organicChain.connect(admin).grantFarmerRole(consumer.address);
      await organicChain.connect(admin).grantProcessorRole(consumer.address);
      
      expect(await organicChain.hasRole(FARMER_ROLE, consumer.address)).to.be.true;
      expect(await organicChain.hasRole(PROCESSOR_ROLE, consumer.address)).to.be.true;
    });
  });

  describe("Product Registration", function () {
    const productName = "Organic Avocados";
    const cropType = 1;
    const certHash = "QmTest123...";
    const latitude = "34.0522";
    const longitude = "-118.2437";
    let plantedDate: number;

    beforeEach(async function () {
      plantedDate = await time.latest() - 30 * 24 * 60 * 60;
    });

    it("Should allow farmer to register product", async function () {
      const tx = await organicChain.connect(farmer).registerProduct(
        productName, cropType, certHash, latitude, longitude, plantedDate
      );

      await expect(tx)
        .to.emit(organicChain, "ProductRegistered")
        .withArgs(1, productName, farmer.address, plantedDate);
    });

    it("Should reject product registration from non-farmer", async function () {
      await expect(
        organicChain.connect(unauthorized).registerProduct(
          productName, cropType, certHash, latitude, longitude, plantedDate
        )
      ).to.be.revertedWithCustomError(organicChain, "UnauthorizedAccess");
    });

    it("Should increment product ID", async function () {
      await organicChain.connect(farmer).registerProduct(
        productName, cropType, certHash, latitude, longitude, plantedDate
      );
      expect(await organicChain.getTotalProducts()).to.equal(1);

      await organicChain.connect(farmer).registerProduct(
        "Organic Tomatoes", 0, certHash, latitude, longitude, plantedDate
      );
      expect(await organicChain.getTotalProducts()).to.equal(2);
    });

    it("Should set initial authenticity score to 100", async function () {
      await organicChain.connect(farmer).registerProduct(
        productName, cropType, certHash, latitude, longitude, plantedDate
      );
      const score = await organicChain.getAuthenticityScore(1);
      expect(score).to.equal(100);
    });

    it("Should track farmer's products", async function () {
      await organicChain.connect(farmer).registerProduct(
        productName, cropType, certHash, latitude, longitude, plantedDate
      );
      const products = await organicChain.getFarmerProducts(farmer.address);
      expect(products.length).to.equal(1);
      expect(products[0]).to.equal(1);
    });

    it("Should set farmer as initial custodian", async function () {
      await organicChain.connect(farmer).registerProduct(
        productName, cropType, certHash, latitude, longitude, plantedDate
      );
      const product = await organicChain.products(1);
      expect(product.currentCustodian).to.equal(farmer.address);
    });

    it("Should store GPS coordinates", async function () {
      await organicChain.connect(farmer).registerProduct(
        productName, cropType, certHash, latitude, longitude, plantedDate
      );
      const product = await organicChain.products(1);
      expect(product.farmLocation.latitude).to.equal(latitude);
      expect(product.farmLocation.longitude).to.equal(longitude);
    });
  });

  describe("Product Status Updates", function () {
    let productId: number;

    beforeEach(async function () {
      const plantedDate = await time.latest() - 30 * 24 * 60 * 60;
      await organicChain.connect(farmer).registerProduct(
        "Organic Avocados", 1, "QmTest123", "34.0522", "-118.2437", plantedDate
      );
      productId = 1;
    });

    it("Should allow farmer to update to Harvested status", async function () {
      const tx = await organicChain.connect(farmer).updateProductStatus(productId, 1);
      await expect(tx).to.emit(organicChain, "ProductStatusUpdated");
    });

    it("Should set harvest date when status updated to Harvested", async function () {
      await organicChain.connect(farmer).updateProductStatus(productId, 1);
      const product = await organicChain.products(productId);
      expect(product.harvestDate).to.be.gt(0);
    });

    it("Should reject status update from non-owner for harvesting", async function () {
      await expect(
        organicChain.connect(unauthorized).updateProductStatus(productId, 1)
      ).to.be.revertedWithCustomError(organicChain, "UnauthorizedAccess");
    });

    it("Should reject status update for non-existent product", async function () {
      await expect(
        organicChain.connect(farmer).updateProductStatus(999, 1)
      ).to.be.revertedWithCustomError(organicChain, "ProductNotFound");
    });

    it("Should update authenticity score on status change", async function () {
      await organicChain.connect(farmer).updateProductStatus(productId, 1);
      const score = await organicChain.getAuthenticityScore(productId);
      expect(score).to.be.lte(100);
    });
  });

  describe("Batch Management", function () {
    let productId: number;

    beforeEach(async function () {
      const plantedDate = await time.latest() - 60 * 24 * 60 * 60;
      await organicChain.connect(farmer).registerProduct(
        "Organic Avocados", 1, "QmTest123", "34.0522", "-118.2437", plantedDate
      );
      productId = 1;
      await organicChain.connect(farmer).updateProductStatus(productId, 1);
    });

    it("Should allow processor to create batch", async function () {
      const tx = await organicChain.connect(processor).createBatch(
        productId, 1000, "Cardboard boxes, eco-friendly"
      );
      await expect(tx)
        .to.emit(organicChain, "BatchCreated")
        .withArgs(1, productId, processor.address, 1000);
    });

    it("Should reject batch creation from non-processor", async function () {
      await expect(
        organicChain.connect(farmer).createBatch(productId, 1000, "Boxes")
      ).to.be.revertedWithCustomError(organicChain, "UnauthorizedAccess");
    });

    it("Should reject batch creation for non-existent product", async function () {
      await expect(
        organicChain.connect(processor).createBatch(999, 1000, "Boxes")
      ).to.be.revertedWithCustomError(organicChain, "ProductNotFound");
    });

    it("Should increment batch ID", async function () {
      await organicChain.connect(processor).createBatch(productId, 1000, "Boxes");
      expect(await organicChain.getTotalBatches()).to.equal(1);

      await organicChain.connect(processor).createBatch(productId, 500, "Bags");
      expect(await organicChain.getTotalBatches()).to.equal(2);
    });

    it("Should link batch to product", async function () {
      await organicChain.connect(processor).createBatch(productId, 1000, "Boxes");
      const [product] = await organicChain.getProductHistory(productId);
      expect(product.batchIds.length).to.equal(1);
      expect(product.batchIds[0]).to.equal(1);
    });
  });

  describe("Sensor Data", function () {
    let batchId: number;

    beforeEach(async function () {
      const plantedDate = await time.latest() - 60 * 24 * 60 * 60;
      await organicChain.connect(farmer).registerProduct(
        "Organic Avocados", 1, "QmTest123", "34.0522", "-118.2437", plantedDate
      );
      await organicChain.connect(farmer).updateProductStatus(1, 1);
      await organicChain.connect(processor).createBatch(1, 1000, "Boxes");
      batchId = 1;
    });

    it("Should allow adding sensor data", async function () {
      const tx = await organicChain.connect(processor).addSensorData(batchId, 2550, 6500);
      await expect(tx)
        .to.emit(organicChain, "SensorDataRecorded")
        .withArgs(batchId, 2550, 6500, false);
    });

    it("Should detect temperature anomaly (too hot)", async function () {
      const tx = await organicChain.connect(processor).addSensorData(batchId, 5000, 6500);
      await expect(tx)
        .to.emit(organicChain, "SensorDataRecorded")
        .withArgs(batchId, 5000, 6500, true);
    });

    it("Should detect temperature anomaly (too cold)", async function () {
      const tx = await organicChain.connect(processor).addSensorData(batchId, -2000, 6500);
      await expect(tx)
        .to.emit(organicChain, "SensorDataRecorded")
        .withArgs(batchId, -2000, 6500, true);
    });

    it("Should detect humidity anomaly", async function () {
      const tx = await organicChain.connect(processor).addSensorData(batchId, 2500, 15000);
      await expect(tx)
        .to.emit(organicChain, "SensorDataRecorded")
        .withArgs(batchId, 2500, 15000, true);
    });

    it("Should reduce authenticity score on anomaly", async function () {
      const initialScore = await organicChain.getAuthenticityScore(1);
      await organicChain.connect(processor).addSensorData(batchId, 5000, 6500);
      const newScore = await organicChain.getAuthenticityScore(1);
      expect(newScore).to.be.lt(initialScore);
    });

    it("Should reject sensor data for non-existent batch", async function () {
      await expect(
        organicChain.connect(processor).addSensorData(999, 2500, 6500)
      ).to.be.revertedWithCustomError(organicChain, "BatchNotFound");
    });

    it("Should store multiple sensor readings", async function () {
      await organicChain.connect(processor).addSensorData(batchId, 2500, 6500);
      await organicChain.connect(processor).addSensorData(batchId, 2600, 6800);
      await organicChain.connect(processor).addSensorData(batchId, 2400, 6200);

      const batch = await organicChain.getBatchDetails(batchId);
      expect(batch.sensorLogs.length).to.equal(3);
    });
  });

  describe("Location Tracking", function () {
    let batchId: number;

    beforeEach(async function () {
      const plantedDate = await time.latest() - 60 * 24 * 60 * 60;
      await organicChain.connect(farmer).registerProduct(
        "Organic Avocados", 1, "QmTest123", "34.0522", "-118.2437", plantedDate
      );
      await organicChain.connect(farmer).updateProductStatus(1, 1);
      await organicChain.connect(processor).createBatch(1, 1000, "Boxes");
      batchId = 1;
    });

    it("Should allow updating batch location", async function () {
      const tx = await organicChain.connect(processor).updateBatchLocation(
        batchId, "40.7128", "-74.0060"
      );
      await expect(tx).to.emit(organicChain, "LocationUpdated");
    });

    it("Should track multiple location updates", async function () {
      await organicChain.connect(processor).updateBatchLocation(batchId, "34.0522", "-118.2437");
      await organicChain.connect(processor).updateBatchLocation(batchId, "36.7783", "-119.4179");
      await organicChain.connect(processor).updateBatchLocation(batchId, "40.7128", "-74.0060");

      const batch = await organicChain.getBatchDetails(batchId);
      expect(batch.locationHistory.length).to.equal(3);
    });

    it("Should reject location update for non-existent batch", async function () {
      await expect(
        organicChain.connect(processor).updateBatchLocation(999, "40.7128", "-74.0060")
      ).to.be.revertedWithCustomError(organicChain, "BatchNotFound");
    });
  });

  describe("Custody Transfer", function () {
    let batchId: number;

    beforeEach(async function () {
      const plantedDate = await time.latest() - 60 * 24 * 60 * 60;
      await organicChain.connect(farmer).registerProduct(
        "Organic Avocados", 1, "QmTest123", "34.0522", "-118.2437", plantedDate
      );
      await organicChain.connect(farmer).updateProductStatus(1, 1);
      await organicChain.connect(processor).createBatch(1, 1000, "Boxes");
      batchId = 1;
    });

    it("Should allow current custodian to transfer custody", async function () {
      const tx = await organicChain.connect(farmer).transferCustody(batchId, retailer.address);
      await expect(tx).to.emit(organicChain, "CustodyTransferred");
    });

    it("Should update product custodian", async function () {
      await organicChain.connect(farmer).transferCustody(batchId, retailer.address);
      const product = await organicChain.products(1);
      expect(product.currentCustodian).to.equal(retailer.address);
    });

    it("Should reject transfer from non-custodian", async function () {
      await expect(
        organicChain.connect(unauthorized).transferCustody(batchId, retailer.address)
      ).to.be.revertedWithCustomError(organicChain, "InvalidTransfer");
    });

    it("Should allow chain of custody transfers", async function () {
      await organicChain.connect(farmer).transferCustody(batchId, processor.address);
      let product = await organicChain.products(1);
      expect(product.currentCustodian).to.equal(processor.address);

      await organicChain.connect(processor).transferCustody(batchId, retailer.address);
      product = await organicChain.products(1);
      expect(product.currentCustodian).to.equal(retailer.address);
    });
  });

  describe("Certificate Management", function () {
    let productId: number;

    beforeEach(async function () {
      const plantedDate = await time.latest() - 60 * 24 * 60 * 60;
      await organicChain.connect(farmer).registerProduct(
        "Organic Avocados", 1, "QmTest123", "34.0522", "-118.2437", plantedDate
      );
      productId = 1;
    });

    it("Should allow adding certificate", async function () {
      const validUntil = (await time.latest()) + 365 * 24 * 60 * 60;
      const tx = await organicChain.connect(farmer).addCertificate(
        productId, "USDA Organic", validUntil, "QmCert123..."
      );
      await expect(tx).to.emit(organicChain, "CertificateAdded");
    });

    it("Should allow inspector to approve certificate", async function () {
      const validUntil = (await time.latest()) + 365 * 24 * 60 * 60;
      await organicChain.connect(farmer).addCertificate(productId, "USDA Organic", validUntil, "QmCert123");

      const tx = await organicChain.connect(inspector).approveCertificate(1);
      await expect(tx).to.emit(organicChain, "CertificateApproved");
    });

    it("Should reject certificate approval from non-inspector", async function () {
      const validUntil = (await time.latest()) + 365 * 24 * 60 * 60;
      await organicChain.connect(farmer).addCertificate(productId, "USDA Organic", validUntil, "QmCert123");

      await expect(
        organicChain.connect(farmer).approveCertificate(1)
      ).to.be.revertedWithCustomError(organicChain, "UnauthorizedAccess");
    });

    it("Should store certificate details correctly", async function () {
      const issuer = "USDA Organic";
      const validUntil = (await time.latest()) + 365 * 24 * 60 * 60;
      const docHash = "QmCert123";

      await organicChain.connect(farmer).addCertificate(productId, issuer, validUntil, docHash);
      const cert = await organicChain.getCertificate(1);
      expect(cert.issuer).to.equal(issuer);
      expect(cert.documentHash).to.equal(docHash);
      expect(cert.approved).to.be.false;
    });

    it("Should mark certificate as approved", async function () {
      const validUntil = (await time.latest()) + 365 * 24 * 60 * 60;
      await organicChain.connect(farmer).addCertificate(productId, "USDA Organic", validUntil, "QmCert123");

      await organicChain.connect(inspector).approveCertificate(1);
      const cert = await organicChain.getCertificate(1);
      expect(cert.approved).to.be.true;
      expect(cert.approvedBy).to.equal(inspector.address);
    });

    it("Should add certificate to batch", async function () {
      await organicChain.connect(farmer).updateProductStatus(productId, 1);
      await organicChain.connect(processor).createBatch(productId, 1000, "Boxes");
      
      const validUntil = (await time.latest()) + 365 * 24 * 60 * 60;
      await organicChain.connect(farmer).addCertificate(productId, "USDA Organic", validUntil, "QmCert123");
      await organicChain.connect(processor).addCertificateToBatch(1, 1);

      const batch = await organicChain.getBatchDetails(1);
      expect(batch.certificateIds.length).to.equal(1);
      expect(batch.certificateIds[0]).to.equal(1);
    });
  });

  describe("Authenticity Verification", function () {
    let productId: number;

    beforeEach(async function () {
      const plantedDate = await time.latest() - 60 * 24 * 60 * 60;
      await organicChain.connect(farmer).registerProduct(
        "Organic Avocados", 1, "QmTest123", "34.0522", "-118.2437", plantedDate
      );
      productId = 1;
    });

    it("Should return high score for clean product", async function () {
      const [isAuthentic, score, details] = await organicChain.verifyProduct(productId);
      expect(isAuthentic).to.be.true;
      expect(score).to.be.gte(90);
      expect(details).to.include("Excellent");
    });

    it("Should reduce score for multiple anomalies", async function () {
      await organicChain.connect(farmer).updateProductStatus(productId, 1);
      await organicChain.connect(processor).createBatch(productId, 1000, "Boxes");

      await organicChain.connect(processor).addSensorData(1, 5000, 6500);
      await organicChain.connect(processor).addSensorData(1, 6000, 6500);
      await organicChain.connect(processor).addSensorData(1, -2000, 6500);

      const score = await organicChain.getAuthenticityScore(productId);
      expect(score).to.be.lt(90);
    });

    it("Should mark recalled product as not authentic", async function () {
      await organicChain.connect(inspector).recallProduct(productId, "Contamination");
      const [isAuthentic, score] = await organicChain.verifyProduct(productId);
      expect(isAuthentic).to.be.false;
      expect(score).to.equal(0);
    });
  });

  describe("Product Recall", function () {
    let productId: number;

    beforeEach(async function () {
      const plantedDate = await time.latest() - 60 * 24 * 60 * 60;
      await organicChain.connect(farmer).registerProduct(
        "Organic Avocados", 1, "QmTest123", "34.0522", "-118.2437", plantedDate
      );
      productId = 1;
    });

    it("Should allow inspector to recall product", async function () {
      const tx = await organicChain.connect(inspector).recallProduct(productId, "Contamination detected");
      await expect(tx).to.emit(organicChain, "ProductRecalled");
    });

    it("Should allow farmer to recall own product", async function () {
      const tx = await organicChain.connect(farmer).recallProduct(productId, "Quality issue");
      await expect(tx).to.emit(organicChain, "ProductRecalled");
    });

    it("Should reject recall from unauthorized user", async function () {
      await expect(
        organicChain.connect(unauthorized).recallProduct(productId, "No reason")
      ).to.be.revertedWithCustomError(organicChain, "UnauthorizedAccess");
    });

    it("Should set authenticity score to 0 on recall", async function () {
      await organicChain.connect(inspector).recallProduct(productId, "Contamination");
      const score = await organicChain.getAuthenticityScore(productId);
      expect(score).to.equal(0);
    });

    it("Should set status to Recalled", async function () {
      await organicChain.connect(inspector).recallProduct(productId, "Contamination");
      const product = await organicChain.products(productId);
      expect(product.status).to.equal(7);
    });

    it("Should mark product as recalled", async function () {
      await organicChain.connect(inspector).recallProduct(productId, "Contamination");
      const product = await organicChain.products(productId);
      expect(product.recalled).to.be.true;
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      const plantedDate = await time.latest() - 60 * 24 * 60 * 60;
      
      await organicChain.connect(farmer).registerProduct(
        "Product 1", 1, "QmTest1", "34.0", "-118.0", plantedDate
      );

      await organicChain.connect(farmer).registerProduct(
        "Product 2", 0, "QmTest2", "35.0", "-119.0", plantedDate
      );

      await organicChain.connect(farmer).updateProductStatus(1, 1);
      await organicChain.connect(processor).createBatch(1, 1000, "Boxes");
    });

    it("Should get product history with batches", async function () {
      const [product, batches] = await organicChain.getProductHistory(1);
      expect(product.id).to.equal(1);
      expect(product.name).to.equal("Product 1");
      expect(batches.length).to.equal(1);
      expect(batches[0].batchId).to.equal(1);
    });

    it("Should get farmer's products", async function () {
      const products = await organicChain.getFarmerProducts(farmer.address);
      expect(products.length).to.equal(2);
      expect(products[0]).to.equal(1);
      expect(products[1]).to.equal(2);
    });

    it("Should get batch details", async function () {
      const batch = await organicChain.getBatchDetails(1);
      expect(batch.batchId).to.equal(1);
      expect(batch.productId).to.equal(1);
      expect(batch.processor).to.equal(processor.address);
    });

    it("Should get total products count", async function () {
      expect(await organicChain.getTotalProducts()).to.equal(2);
    });

    it("Should get total batches count", async function () {
      expect(await organicChain.getTotalBatches()).to.equal(1);
    });
  });

  describe("Pausable Functionality", function () {
    it("Should allow admin to pause contract", async function () {
      await organicChain.connect(admin).pause();
      const plantedDate = await time.latest() - 30 * 24 * 60 * 60;
      await expect(
        organicChain.connect(farmer).registerProduct(
          "Product", 1, "QmTest", "34.0", "-118.0", plantedDate
        )
      ).to.be.reverted;
    });

    it("Should allow admin to unpause contract", async function () {
      await organicChain.connect(admin).pause();
      await organicChain.connect(admin).unpause();

      const plantedDate = await time.latest() - 30 * 24 * 60 * 60;
      await expect(
        organicChain.connect(farmer).registerProduct(
          "Product", 1, "QmTest", "34.0", "-118.0", plantedDate
        )
      ).to.not.be.reverted;
    });

    it("Should reject pause from non-admin", async function () {
      await expect(
        organicChain.connect(farmer).pause()
      ).to.be.reverted;
    });
  });

  describe("Upgradeability (UUPS)", function () {
    it("Should upgrade to new implementation", async function () {
      const OrganicSupplyChainV2 = await ethers.getContractFactory("OrganicSupplyChain");
      
      const upgraded = await upgrades.upgradeProxy(
        await organicChain.getAddress(),
        OrganicSupplyChainV2
      );

      expect(await upgraded.version()).to.equal("1.0.0");
    });

    it("Should preserve state after upgrade", async function () {
      const plantedDate = await time.latest() - 30 * 24 * 60 * 60;
      await organicChain.connect(farmer).registerProduct(
        "Product Before Upgrade", 1, "QmTest", "34.0", "-118.0", plantedDate
      );

      const OrganicSupplyChainV2 = await ethers.getContractFactory("OrganicSupplyChain");
      const upgraded = await upgrades.upgradeProxy(
        await organicChain.getAddress(),
        OrganicSupplyChainV2
      ) as unknown as OrganicSupplyChain;

      const product = await upgraded.products(1);
      expect(product.name).to.equal("Product Before Upgrade");
      expect(await upgraded.getTotalProducts()).to.equal(1);
    });

    it("Should reject upgrade from non-upgrader", async function () {
      const OrganicSupplyChainV2 = await ethers.getContractFactory(
        "OrganicSupplyChain",
        farmer
      );

      await expect(
        upgrades.upgradeProxy(
          await organicChain.getAddress(),
          OrganicSupplyChainV2
        )
      ).to.be.reverted;
    });
  });

  describe("Edge Cases & Security", function () {
    it("Should reject operations on non-existent product", async function () {
      await expect(
        organicChain.getAuthenticityScore(999)
      ).to.be.revertedWithCustomError(organicChain, "ProductNotFound");
    });

    it("Should reject operations on non-existent batch", async function () {
      await expect(
        organicChain.getBatchDetails(999)
      ).to.be.revertedWithCustomError(organicChain, "BatchNotFound");
    });

    it("Should reject operations on non-existent certificate", async function () {
      await expect(
        organicChain.getCertificate(999)
      ).to.be.revertedWithCustomError(organicChain, "InvalidCertificate");
    });

    it("Should handle empty product arrays", async function () {
      const products = await organicChain.getFarmerProducts(unauthorized.address);
      expect(products.length).to.equal(0);
    });

    it("Should handle empty batch arrays", async function () {
      const batches = await organicChain.getCustodianBatches(unauthorized.address);
      expect(batches.length).to.equal(0);
    });

    it("Should handle product with no batches", async function () {
      const plantedDate = await time.latest() - 30 * 24 * 60 * 60;
      await organicChain.connect(farmer).registerProduct(
        "Product", 1, "QmTest", "34.0", "-118.0", plantedDate
      );

      const [product, batches] = await organicChain.getProductHistory(1);
      expect(product.batchIds.length).to.equal(0);
      expect(batches.length).to.equal(0);
    });
  });
});
