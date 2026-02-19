// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

/**
 * @title OrganicSupplyChain
 * @dev Advanced supply chain traceability system for organic produce
 * @notice This contract implements role-based access control, product lifecycle tracking,
 * certification management, and fraud detection mechanisms
 */
contract OrganicSupplyChain is 
    Initializable, 
    AccessControlUpgradeable, 
    UUPSUpgradeable, 
    PausableUpgradeable,
    ReentrancyGuardUpgradeable 
{
    // ============ Custom Errors ============
    error UnauthorizedAccess();
    error InvalidProductId();
    error InvalidBatchId();
    error InvalidCertificate();
    error ProductNotFound();
    error BatchNotFound();
    error InvalidOperation();
    error CertificateExpired();
    error InvalidTransfer();

    // ============ Roles ============
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant INSPECTOR_ROLE = keccak256("INSPECTOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // ============ Enums ============
    enum ProductStatus { 
        Planted, 
        Harvested, 
        Processing, 
        Processed, 
        Packaged, 
        InTransit, 
        Delivered, 
        Recalled 
    }

    enum CropType { 
        Vegetables, 
        Fruits, 
        Grains, 
        Herbs, 
        Other 
    }

    // ============ Structs ============
    struct GPSCoordinates {
        string latitude;
        string longitude;
        uint256 timestamp;
    }

    struct Certificate {
        uint256 certId;
        string issuer;
        uint256 issueDate;
        uint256 validUntil;
        string documentHash; // IPFS hash
        bool approved;
        bool rejected;
        address approvedBy;
        string rejectionReason;
    }

    struct SensorData {
        uint256 timestamp;
        int16 temperature; // Celsius * 100 (e.g., 2550 = 25.50°C)
        uint16 humidity; // Percentage * 100
        bool anomalyDetected;
    }

    struct Batch {
        uint256 batchId;
        uint256 productId;
        address processor;
        uint256 processedDate;
        uint256 quantity; // in kilograms
        GPSCoordinates[] locationHistory;
        SensorData[] sensorLogs;
        uint256[] certificateIds;
        string packagingDetails;
        string processingLocation;
        string processingNotes;
        string processingCertHash;
        ProductStatus status;
    }

    struct Product {
        uint256 id;
        string name;
        CropType cropType;
        address farmer;
        string organicCertification; // IPFS hash
        GPSCoordinates farmLocation;
        uint256 plantedDate;
        uint256 expectedHarvestDate;
        uint256 harvestDate;
        uint256 harvestQuantity;
        string harvestNotes;
        ProductStatus status;
        uint256[] batchIds;
        address currentCustodian;
        uint256 transferDate;
        uint256 receivedDate;
        uint256 expiryDate;
        uint256 retailPrice;
        string retailNotes;
        bool recalled;
        uint256 authenticityScore; // 0-100
    }

    // ============ State Variables ============
    uint256 private _productIdCounter;
    uint256 private _batchIdCounter;
    uint256 private _certificateIdCounter;

    mapping(uint256 => Product) public products;
    mapping(uint256 => Batch) public batches;
    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public farmerProducts;
    mapping(address => uint256[]) public custodianBatches;
    
    // For fraud detection
    mapping(uint256 => uint256) public productUpdates;

    // ============ Events ============
    event ProductRegistered(
        uint256 indexed productId,
        string name,
        address indexed farmer,
        uint256 plantedDate
    );

    event ProductStatusUpdated(
        uint256 indexed productId,
        ProductStatus oldStatus,
        ProductStatus newStatus,
        uint256 timestamp
    );

    event ProductHarvested(
        uint256 indexed productId,
        uint256 harvestDate,
        uint256 quantity,
        address indexed farmer,
        string notes
    );

    event DeliveryAccepted(
        uint256 indexed productId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    event BatchCreated(
        uint256 indexed batchId,
        uint256 indexed productId,
        address indexed processor,
        uint256 quantity
    );

    event BatchCompleted(
        uint256 indexed batchId,
        uint256 indexed productId,
        uint256 timestamp
    );

    event BatchProcessed(
        uint256 indexed batchId,
        uint256 indexed productId,
        address indexed processor,
        uint256 timestamp
    );

    event CustodyTransferred(
        uint256 indexed batchId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    event ProductCustodyTransferred(
        uint256 indexed productId,
        address indexed from,
        address indexed to,
        string notes,
        uint256 timestamp
    );

    event ProductReceived(
        uint256 indexed productId,
        address indexed retailer,
        uint256 receivedDate,
        uint256 expiryDate,
        uint256 retailPrice,
        string notes
    );

    event CertificateAdded(
        uint256 indexed certificateId,
        uint256 indexed productId,
        string issuer,
        uint256 validUntil
    );

    event CertificateApproved(
        uint256 indexed certificateId,
        address indexed inspector
    );

    event CertificateRejected(
        uint256 indexed certificateId,
        address indexed inspector,
        string reason
    );

    event SensorDataRecorded(
        uint256 indexed batchId,
        int16 temperature,
        uint16 humidity,
        bool anomaly
    );

    event LocationUpdated(
        uint256 indexed batchId,
        string latitude,
        string longitude,
        uint256 timestamp
    );

    event ProductRecalled(
        uint256 indexed productId,
        string reason,
        uint256 timestamp
    );

    event TamperFlagged(
        uint256 indexed productId,
        address indexed reporter,
        string reason,
        uint256 timestamp
    );

    event AuthenticityScoreUpdated(
        uint256 indexed productId,
        uint256 newScore
    );
    event ProductDeleted(
        uint256 indexed productId,
        address indexed deletedBy,
        uint256 timestamp
    );

    event BatchDeleted(
        uint256 indexed batchId,
        address indexed deletedBy,
        uint256 timestamp
    );
    // ============ Modifiers ============
    modifier onlyFarmer() {
        if (!hasRole(FARMER_ROLE, msg.sender)) revert UnauthorizedAccess();
        _;
    }

    modifier onlyProcessor() {
        if (!hasRole(PROCESSOR_ROLE, msg.sender)) revert UnauthorizedAccess();
        _;
    }

    modifier onlyRetailer() {
        if (!hasRole(RETAILER_ROLE, msg.sender)) revert UnauthorizedAccess();
        _;
    }

    modifier onlyInspector() {
        if (!hasRole(INSPECTOR_ROLE, msg.sender)) revert UnauthorizedAccess();
        _;
    }

    modifier productExists(uint256 productId) {
        if (productId == 0 || productId > _productIdCounter) revert ProductNotFound();
        _;
    }

    modifier batchExists(uint256 batchId) {
        if (batchId == 0 || batchId > _batchIdCounter) revert BatchNotFound();
        _;
    }

    // ============ Initialization ============
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    // ============ Role Management ============
    function grantFarmerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(FARMER_ROLE, account);
    }

    function grantProcessorRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(PROCESSOR_ROLE, account);
    }

    function grantRetailerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(RETAILER_ROLE, account);
    }

    function grantInspectorRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(INSPECTOR_ROLE, account);
    }

    // ============ Product Management ============
    /**
     * @notice Register a new organic product
     * @param name Product name
     * @param cropType Type of crop
     * @param organicCertHash IPFS hash of organic certification
     * @param latitude Farm latitude
     * @param longitude Farm longitude
     * @param plantedDate Timestamp when planted
     */
    function registerProduct(
        string memory name,
        CropType cropType,
        string memory organicCertHash,
        string memory latitude,
        string memory longitude,
        uint256 plantedDate,
        uint256 expectedHarvestDate
    ) external onlyFarmer whenNotPaused returns (uint256) {
        _productIdCounter++;
        uint256 productId = _productIdCounter;

        GPSCoordinates memory farmLocation = GPSCoordinates({
            latitude: latitude,
            longitude: longitude,
            timestamp: block.timestamp
        });

        Product storage newProduct = products[productId];
        newProduct.id = productId;
        newProduct.name = name;
        newProduct.cropType = cropType;
        newProduct.farmer = msg.sender;
        newProduct.organicCertification = organicCertHash;
        newProduct.farmLocation = farmLocation;
        newProduct.plantedDate = plantedDate;
        newProduct.expectedHarvestDate = expectedHarvestDate;
        newProduct.status = ProductStatus.Planted;
        newProduct.currentCustodian = msg.sender;
        newProduct.authenticityScore = 100; // Start with perfect score

        farmerProducts[msg.sender].push(productId);

        emit ProductRegistered(productId, name, msg.sender, plantedDate);
        
        return productId;
    }

    /**
     * @notice Update product status
     */
    function updateProductStatus(
        uint256 productId,
        ProductStatus newStatus
    ) external productExists(productId) whenNotPaused {
        Product storage product = products[productId];
        
        // Validate permissions based on status
        if (newStatus == ProductStatus.Harvested && msg.sender != product.farmer) {
            revert UnauthorizedAccess();
        }
        
        ProductStatus oldStatus = product.status;
        product.status = newStatus;

        if (newStatus == ProductStatus.Harvested) {
            product.harvestDate = block.timestamp;
        }

        productUpdates[productId]++;
        _updateAuthenticityScore(productId);

        emit ProductStatusUpdated(productId, oldStatus, newStatus, block.timestamp);
    }

    /**
     * @notice Mark product as harvested (Farmer only)
     * @param productId Product ID
     * @param estimatedQuantity Estimated harvest quantity in kg
     */
    function harvestProduct(
        uint256 productId,
        uint256 estimatedQuantity,
        string memory notes
    ) external productExists(productId) whenNotPaused {
        Product storage product = products[productId];
        
        // Only farmer can harvest their own product
        if (msg.sender != product.farmer) {
            revert UnauthorizedAccess();
        }
        
        // Must be in Planted status
        if (product.status != ProductStatus.Planted) {
            revert InvalidOperation();
        }
        
        ProductStatus oldStatus = product.status;
        product.status = ProductStatus.Harvested;
        product.harvestDate = block.timestamp;
        product.harvestQuantity = estimatedQuantity;
        product.harvestNotes = notes;

        productUpdates[productId]++;
        _updateAuthenticityScore(productId);

        emit ProductHarvested(productId, block.timestamp, estimatedQuantity, msg.sender, notes);
        emit ProductStatusUpdated(productId, oldStatus, ProductStatus.Harvested, block.timestamp);
    }

    /**
     * @notice Accept delivery of a product (Processor/Retailer)
     * @param productId Product ID
     */
    function acceptDelivery(
        uint256 productId
    ) external productExists(productId) whenNotPaused {
        Product storage product = products[productId];
        
        // Must have processor or retailer role
        if (!hasRole(PROCESSOR_ROLE, msg.sender) && !hasRole(RETAILER_ROLE, msg.sender)) {
            revert UnauthorizedAccess();
        }
        
        address previousCustodian = product.currentCustodian;
        product.currentCustodian = msg.sender;

        emit DeliveryAccepted(productId, previousCustodian, msg.sender, block.timestamp);
    }

    /**
     * @notice Transfer custody of a product to a new custodian with notes
     * @param productId Product ID
     * @param newCustodian New custodian address
     * @param notes Transfer notes
     */
    function transferCustody(
        uint256 productId,
        address newCustodian,
        string memory notes
    ) external productExists(productId) whenNotPaused {
        Product storage product = products[productId];

        if (msg.sender != product.currentCustodian) {
            revert InvalidTransfer();
        }

        address previousCustodian = product.currentCustodian;
        product.currentCustodian = newCustodian;
        product.transferDate = block.timestamp;

        ProductStatus oldStatus = product.status;
        product.status = ProductStatus.InTransit;

        productUpdates[productId]++;
        _updateAuthenticityScore(productId);

        emit ProductCustodyTransferred(productId, previousCustodian, newCustodian, notes, block.timestamp);
        emit ProductStatusUpdated(productId, oldStatus, ProductStatus.InTransit, block.timestamp);
    }

    /**
     * @notice Receive a product at retail and record retail data
     * @param productId Product ID
     * @param receivedDate Date received (unix timestamp)
     * @param expiryDate Expiry date (unix timestamp)
     * @param retailPrice Retail price (in smallest currency units)
     * @param notes Retail notes
     */
    function receiveProduct(
        uint256 productId,
        uint256 receivedDate,
        uint256 expiryDate,
        uint256 retailPrice,
        string memory notes
    ) external productExists(productId) whenNotPaused {
        Product storage product = products[productId];

        if (!hasRole(RETAILER_ROLE, msg.sender)) {
            revert UnauthorizedAccess();
        }

        if (product.currentCustodian != msg.sender) {
            revert InvalidTransfer();
        }

        if (product.status != ProductStatus.InTransit && product.status != ProductStatus.Processed) {
            revert InvalidOperation();
        }

        product.receivedDate = receivedDate;
        product.expiryDate = expiryDate;
        product.retailPrice = retailPrice;
        product.retailNotes = notes;

        ProductStatus oldStatus = product.status;
        product.status = ProductStatus.Delivered;

        productUpdates[productId]++;
        _updateAuthenticityScore(productId);

        emit ProductReceived(productId, msg.sender, receivedDate, expiryDate, retailPrice, notes);
        emit ProductStatusUpdated(productId, oldStatus, ProductStatus.Delivered, block.timestamp);
    }

    // ============ Batch Management ============
    /**
     * @notice Process a harvested product into a batch (Processor only)
     * @param productId Product ID
     * @param quantity Quantity in kg
     * @param processingLocation Location of processing facility
     * @param temperatures Temperature readings (Celsius * 100)
     * @param humidities Humidity readings (Percentage * 100)
     * @param processingNotes Processing notes
     * @param processingCertHash Optional processing certificate IPFS hash
     */
    function processBatch(
        uint256 productId,
        uint256 quantity,
        string memory processingLocation,
        int16[] memory temperatures,
        uint16[] memory humidities,
        string memory processingNotes,
        string memory processingCertHash
    ) external onlyProcessor productExists(productId) whenNotPaused returns (uint256) {
        Product storage product = products[productId];

        if (product.status != ProductStatus.Harvested) {
            revert InvalidOperation();
        }

        _batchIdCounter++;
        uint256 batchId = _batchIdCounter;

        Batch storage newBatch = batches[batchId];
        newBatch.batchId = batchId;
        newBatch.productId = productId;
        newBatch.processor = msg.sender;
        newBatch.processedDate = block.timestamp;
        newBatch.quantity = quantity;
        newBatch.processingLocation = processingLocation;
        newBatch.processingNotes = processingNotes;
        newBatch.processingCertHash = processingCertHash;
        newBatch.status = ProductStatus.Processed;

        products[productId].batchIds.push(batchId);
        custodianBatches[msg.sender].push(batchId);

        // Record sensor data if provided
        uint256 readings = temperatures.length;
        if (humidities.length < readings) {
            readings = humidities.length;
        }

        for (uint256 i = 0; i < readings; i++) {
            bool anomaly = false;
            if (temperatures[i] < -1000 || temperatures[i] > 4000) {
                anomaly = true;
            }
            if (humidities[i] > 10000) {
                anomaly = true;
            }

            SensorData memory data = SensorData({
                timestamp: block.timestamp,
                temperature: temperatures[i],
                humidity: humidities[i],
                anomalyDetected: anomaly
            });

            newBatch.sensorLogs.push(data);
            emit SensorDataRecorded(batchId, temperatures[i], humidities[i], anomaly);

            if (anomaly && product.authenticityScore > 5) {
                product.authenticityScore -= 5;
                emit AuthenticityScoreUpdated(productId, product.authenticityScore);
            }
        }

        // Update product status to Processed and set custodian to processor
        ProductStatus oldStatus = product.status;
        product.status = ProductStatus.Processed;
        product.currentCustodian = msg.sender;

        productUpdates[productId]++;
        _updateAuthenticityScore(productId);

        emit BatchCreated(batchId, productId, msg.sender, quantity);
        emit BatchProcessed(batchId, productId, msg.sender, block.timestamp);
        emit ProductStatusUpdated(productId, oldStatus, ProductStatus.Processed, block.timestamp);

        return batchId;
    }

    /**
     * @notice Create a new batch for processing
     */
    function createBatch(
        uint256 productId,
        uint256 quantity,
        string memory packagingDetails
    ) external onlyProcessor productExists(productId) whenNotPaused returns (uint256) {
        _batchIdCounter++;
        uint256 batchId = _batchIdCounter;

        Batch storage newBatch = batches[batchId];
        newBatch.batchId = batchId;
        newBatch.productId = productId;
        newBatch.processor = msg.sender;
        newBatch.processedDate = block.timestamp;
        newBatch.quantity = quantity;
        newBatch.packagingDetails = packagingDetails;
        newBatch.status = ProductStatus.Processing;

        products[productId].batchIds.push(batchId);
        custodianBatches[msg.sender].push(batchId);

        // Update product status to Processing
        Product storage product = products[productId];
        ProductStatus oldStatus = product.status;
        product.status = ProductStatus.Processing;
        emit ProductStatusUpdated(productId, oldStatus, ProductStatus.Processing, block.timestamp);

        emit BatchCreated(batchId, productId, msg.sender, quantity);
        
        return batchId;
    }

    /**
     * @notice Complete batch processing (Processor only)
     * @param batchId Batch ID
     */
    function completeBatchProcessing(
        uint256 batchId
    ) external onlyProcessor batchExists(batchId) whenNotPaused {
        Batch storage batch = batches[batchId];
        
        // Only the processor who created the batch can complete it
        if (msg.sender != batch.processor) {
            revert UnauthorizedAccess();
        }
        
        // Must be in Processing status
        if (batch.status != ProductStatus.Processing) {
            revert InvalidOperation();
        }
        
        batch.status = ProductStatus.Processed;
        
        // Update product status to Processed
        uint256 productId = batch.productId;
        Product storage product = products[productId];
        ProductStatus oldStatus = product.status;
        product.status = ProductStatus.Processed;

        emit BatchCompleted(batchId, productId, block.timestamp);
        emit ProductStatusUpdated(productId, oldStatus, ProductStatus.Processed, block.timestamp);
    }

    /**
     * @notice Add sensor data to a batch
     */
    function addSensorData(
        uint256 batchId,
        int16 temperature,
        uint16 humidity
    ) external batchExists(batchId) whenNotPaused {
        Batch storage batch = batches[batchId];
        
        // Simple anomaly detection
        bool anomaly = false;
        if (temperature < -1000 || temperature > 4000) { // -10°C to 40°C
            anomaly = true;
        }
        if (humidity > 10000) { // > 100%
            anomaly = true;
        }

        SensorData memory data = SensorData({
            timestamp: block.timestamp,
            temperature: temperature,
            humidity: humidity,
            anomalyDetected: anomaly
        });

        batch.sensorLogs.push(data);

        emit SensorDataRecorded(batchId, temperature, humidity, anomaly);

        if (anomaly) {
            // Reduce authenticity score if anomaly detected
            uint256 productId = batch.productId;
            if (products[productId].authenticityScore > 5) {
                products[productId].authenticityScore -= 5;
                emit AuthenticityScoreUpdated(productId, products[productId].authenticityScore);
            }
        }
    }

    /**
     * @notice Update batch location during transport
     */
    function updateBatchLocation(
        uint256 batchId,
        string memory latitude,
        string memory longitude
    ) external batchExists(batchId) whenNotPaused {
        Batch storage batch = batches[batchId];

        GPSCoordinates memory location = GPSCoordinates({
            latitude: latitude,
            longitude: longitude,
            timestamp: block.timestamp
        });

        batch.locationHistory.push(location);

        emit LocationUpdated(batchId, latitude, longitude, block.timestamp);
    }

    /**
     * @notice Transfer custody of a batch
     */
    function transferCustody(
        uint256 batchId,
        address newCustodian
    ) external batchExists(batchId) whenNotPaused {
        Batch storage batch = batches[batchId];
        Product storage product = products[batch.productId];

        if (msg.sender != product.currentCustodian) {
            revert InvalidTransfer();
        }

        address previousCustodian = product.currentCustodian;
        product.currentCustodian = newCustodian;
        custodianBatches[newCustodian].push(batchId);

        emit CustodyTransferred(batchId, previousCustodian, newCustodian, block.timestamp);
    }

    // ============ Certificate Management ============
    /**
     * @notice Add a certificate to a product
     */
    function addCertificate(
        uint256 productId,
        string memory issuer,
        uint256 validUntil,
        string memory documentHash
    ) external productExists(productId) whenNotPaused returns (uint256) {
        _certificateIdCounter++;
        uint256 certId = _certificateIdCounter;

        Certificate storage cert = certificates[certId];
        cert.certId = certId;
        cert.issuer = issuer;
        cert.issueDate = block.timestamp;
        cert.validUntil = validUntil;
        cert.documentHash = documentHash;
        cert.approved = false;

        emit CertificateAdded(certId, productId, issuer, validUntil);
        
        return certId;
    }

    /**
     * @notice Approve a certificate (inspector only)
     */
    function approveCertificate(
        uint256 certificateId
    ) external onlyInspector whenNotPaused {
        if (certificateId == 0 || certificateId > _certificateIdCounter) {
            revert InvalidCertificate();
        }

        Certificate storage cert = certificates[certificateId];
        require(!cert.rejected, "Certificate already rejected");
        cert.approved = true;
        cert.approvedBy = msg.sender;

        emit CertificateApproved(certificateId, msg.sender);
    }

    /**
     * @notice Reject a certificate (inspector only)
     */
    function rejectCertificate(
        uint256 certificateId,
        string memory reason
    ) external onlyInspector whenNotPaused {
        if (certificateId == 0 || certificateId > _certificateIdCounter) {
            revert InvalidCertificate();
        }

        Certificate storage cert = certificates[certificateId];
        require(!cert.approved, "Cannot reject approved certificate");
        cert.rejected = true;
        cert.rejectionReason = reason;
        cert.approvedBy = msg.sender;

        emit CertificateRejected(certificateId, msg.sender, reason);
    }

    /**
     * @notice Add certificate to batch
     */
    function addCertificateToBatch(
        uint256 batchId,
        uint256 certificateId
    ) external batchExists(batchId) whenNotPaused {
        if (certificateId == 0 || certificateId > _certificateIdCounter) {
            revert InvalidCertificate();
        }

        Batch storage batch = batches[batchId];
        batch.certificateIds.push(certificateId);
    }

    // ============ Verification & Fraud Detection ============
    /**
     * @notice Flag a product as tampered (admin/inspector demo)
     * @param productId Product ID
     * @param reason Reason for tamper flag
     */
    function flagTamper(
        uint256 productId,
        string memory reason
    ) external productExists(productId) whenNotPaused {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender) && !hasRole(INSPECTOR_ROLE, msg.sender)) {
            revert UnauthorizedAccess();
        }

        Product storage product = products[productId];
        if (product.authenticityScore > 15) {
            product.authenticityScore -= 15;
        } else {
            product.authenticityScore = 0;
        }

        productUpdates[productId]++;
        emit AuthenticityScoreUpdated(productId, product.authenticityScore);
        emit TamperFlagged(productId, msg.sender, reason, block.timestamp);
    }

    /**
     * @notice Calculate authenticity score based on multiple factors
     */
    function _updateAuthenticityScore(uint256 productId) internal {
        Product storage product = products[productId];
        uint256 score = 100;

        // Check time consistency
        if (product.harvestDate > 0 && product.harvestDate < product.plantedDate) {
            score -= 30; // Major inconsistency
        }

        // Check for too many updates (potential tampering)
        if (productUpdates[productId] > 20) {
            score -= 15;
        }

        // Check batch consistency
        uint256 batchCount = product.batchIds.length;
        for (uint256 i = 0; i < batchCount; i++) {
            Batch storage batch = batches[product.batchIds[i]];
            
            // Check for sensor anomalies
            uint256 sensorCount = batch.sensorLogs.length;
            uint256 anomalyCount = 0;
            for (uint256 j = 0; j < sensorCount; j++) {
                if (batch.sensorLogs[j].anomalyDetected) {
                    anomalyCount++;
                }
            }
            
            if (sensorCount > 0 && (anomalyCount * 100 / sensorCount) > 20) {
                score -= 10; // More than 20% anomalies
            }
        }

        if (score < 0) score = 0;
        if (score != product.authenticityScore) {
            product.authenticityScore = score;
            emit AuthenticityScoreUpdated(productId, score);
        }
    }

    /**
     * @notice Get authenticity score for a product
     */
    function getAuthenticityScore(
        uint256 productId
    ) external view productExists(productId) returns (uint256) {
        return products[productId].authenticityScore;
    }

    /**
     * @notice Verify product authenticity
     */
    function verifyProduct(
        uint256 productId
    ) external view productExists(productId) returns (
        bool isAuthentic,
        uint256 score,
        string memory details
    ) {
        Product storage product = products[productId];
        score = product.authenticityScore;
        isAuthentic = score >= 70 && !product.recalled;
        
        if (score >= 90) {
            details = "Excellent - Fully verified with no issues";
        } else if (score >= 70) {
            details = "Good - Minor inconsistencies detected";
        } else if (score >= 50) {
            details = "Warning - Multiple issues detected";
        } else {
            details = "Critical - High risk of fraud or tampering";
        }
        
        return (isAuthentic, score, details);
    }

    // ============ Product Recall ============
    /**
     * @notice Recall a product
     */
    function recallProduct(
        uint256 productId,
        string memory reason
    ) external productExists(productId) whenNotPaused {
        if (!hasRole(INSPECTOR_ROLE, msg.sender) && 
            msg.sender != products[productId].farmer) {
            revert UnauthorizedAccess();
        }

        Product storage product = products[productId];
        product.recalled = true;
        product.status = ProductStatus.Recalled;
        product.authenticityScore = 0;

        emit ProductRecalled(productId, reason, block.timestamp);
    }

    // ============ Query Functions ============
    /**
     * @notice Get product IDs ready for processing (Harvested)
     */
    function getAvailableBatches() external view returns (uint256[] memory) {
        uint256 total = _productIdCounter;
        uint256 count = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (products[i].status == ProductStatus.Harvested) {
                count++;
            }
        }

        uint256[] memory available = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (products[i].status == ProductStatus.Harvested) {
                available[index] = i;
                index++;
            }
        }

        return available;
    }

    /**
     * @notice Get complete product history
     */
    function getProductHistory(
        uint256 productId
    ) external view productExists(productId) returns (
        Product memory product,
        Batch[] memory productBatches
    ) {
        Product storage prod = products[productId];
        uint256 batchCount = prod.batchIds.length;
        
        Batch[] memory batchArray = new Batch[](batchCount);
        for (uint256 i = 0; i < batchCount; i++) {
            batchArray[i] = batches[prod.batchIds[i]];
        }
        
        return (prod, batchArray);
    }

    /**
     * @notice Get batch details
     */
    function getBatchDetails(
        uint256 batchId
    ) external view batchExists(batchId) returns (Batch memory) {
        return batches[batchId];
    }

    /**
     * @notice Get farmer's products
     */
    function getFarmerProducts(
        address farmer
    ) external view returns (uint256[] memory) {
        return farmerProducts[farmer];
    }

    /**
     * @notice Get custodian's batches
     */
    function getCustodianBatches(
        address custodian
    ) external view returns (uint256[] memory) {
        return custodianBatches[custodian];
    }

    /**
     * @notice Get certificate details
     */
    function getCertificate(
        uint256 certificateId
    ) external view returns (Certificate memory) {
        if (certificateId == 0 || certificateId > _certificateIdCounter) {
            revert InvalidCertificate();
        }
        return certificates[certificateId];
    }

    /**
     * @notice Get all pending certificates (inspector view)
     */
    function getPendingCertificates() external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // First count pending certificates
        for (uint256 i = 1; i <= _certificateIdCounter; i++) {
            if (!certificates[i].approved && !certificates[i].rejected) {
                count++;
            }
        }
        
        // Build array of pending certificate IDs
        uint256[] memory pending = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _certificateIdCounter; i++) {
            if (!certificates[i].approved && !certificates[i].rejected) {
                pending[index] = i;
                index++;
            }
        }
        
        return pending;
    }

    /**
     * @notice Get total certificates count
     */
    function getTotalCertificates() external view returns (uint256) {
        return _certificateIdCounter;
    }

    /**
     * @notice Get total products count
     */
    function getTotalProducts() external view returns (uint256) {
        return _productIdCounter;
    }

    /**
     * @notice Get total batches count
     */
    function getTotalBatches() external view returns (uint256) {
        return _batchIdCounter;
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Delete a product record (admin only)
     * @param productId The product ID to delete
     */
    function deleteProduct(uint256 productId) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        whenNotPaused 
    {
        if (productId == 0 || productId > _productIdCounter) {
            revert InvalidProductId();
        }
        
        Product storage product = products[productId];
        if (product.farmer == address(0)) {
            revert ProductNotFound();
        }

        // Mark as deleted by setting farmer to zero address
        delete products[productId];
        
        emit ProductDeleted(productId, msg.sender, block.timestamp);
    }

    /**
     * @notice Delete a batch record (admin only)
     * @param batchId The batch ID to delete
     */
    function deleteBatch(uint256 batchId) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        whenNotPaused 
    {
        if (batchId == 0 || batchId > _batchIdCounter) {
            revert InvalidBatchId();
        }
        
        Batch storage batch = batches[batchId];
        if (batch.processor == address(0)) {
            revert BatchNotFound();
        }

        // Mark as deleted by clearing batch data
        delete batches[batchId];
        
        emit BatchDeleted(batchId, msg.sender, block.timestamp);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}

    // ============ Version ============
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}
