// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentStorage {
    address public owner;
    uint256 public uploadFee = 0.001 ether; // Fee for uploading a document
    
    struct Document {
        string ipfsHash;
        address owner;
        mapping(address => bool) authorizedDoctors;
    }
    
    struct Doctor {
        bool isRegistered;
        string name;
        string specialization;
    }
    
    mapping(address => Doctor) public doctors;
    mapping(string => Document) private documents;
    mapping(address => string[]) private userDocuments;
    mapping(address => string[]) private doctorAccessibleDocuments;
    
    event DocumentStored(address indexed user, string ipfsHash);
    event FeeUpdated(uint256 newFee);
    event DoctorRegistered(address indexed doctor, string name, string specialization);
    event AccessGranted(address indexed patient, address indexed doctor, string ipfsHash);
    event AccessRevoked(address indexed patient, address indexed doctor, string ipfsHash);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyDoctor() {
        require(doctors[msg.sender].isRegistered, "Only registered doctors can call this function");
        _;
    }

    function registerDoctor(string memory _name, string memory _specialization) external {
        require(!doctors[msg.sender].isRegistered, "Doctor already registered");
        doctors[msg.sender] = Doctor(true, _name, _specialization);
        emit DoctorRegistered(msg.sender, _name, _specialization);
    }

    function setUploadFee(uint256 _newFee) external onlyOwner {
        uploadFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    function storeDocument(string memory _ipfsHash) external payable {
        require(msg.value >= uploadFee, "Insufficient payment");
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");
        
        Document storage newDoc = documents[_ipfsHash];
        newDoc.ipfsHash = _ipfsHash;
        newDoc.owner = msg.sender;
        
        userDocuments[msg.sender].push(_ipfsHash);
        emit DocumentStored(msg.sender, _ipfsHash);

        if (msg.value > uploadFee) {
            payable(msg.sender).transfer(msg.value - uploadFee);
        }
    }

    function grantAccess(address _doctor, string memory _ipfsHash) external {
        require(documents[_ipfsHash].owner == msg.sender, "Only document owner can grant access");
        require(doctors[_doctor].isRegistered, "Doctor is not registered");
        
        documents[_ipfsHash].authorizedDoctors[_doctor] = true;
        doctorAccessibleDocuments[_doctor].push(_ipfsHash);
        emit AccessGranted(msg.sender, _doctor, _ipfsHash);
    }

    function revokeAccess(address _doctor, string memory _ipfsHash) external {
        require(documents[_ipfsHash].owner == msg.sender, "Only document owner can revoke access");
        documents[_ipfsHash].authorizedDoctors[_doctor] = false;
        
        // Remove from doctor's accessible documents
        string[] storage docList = doctorAccessibleDocuments[_doctor];
        for (uint i = 0; i < docList.length; i++) {
            if (keccak256(bytes(docList[i])) == keccak256(bytes(_ipfsHash))) {
                docList[i] = docList[docList.length - 1];
                docList.pop();
                break;
            }
        }
        
        emit AccessRevoked(msg.sender, _doctor, _ipfsHash);
    }

    function getUserDocuments() external view returns (string[] memory) {
        return userDocuments[msg.sender];
    }

    function getDoctorAccessibleDocuments() external view onlyDoctor returns (string[] memory) {
        return doctorAccessibleDocuments[msg.sender];
    }

    function canAccessDocument(address _doctor, string memory _ipfsHash) external view returns (bool) {
        return documents[_ipfsHash].authorizedDoctors[_doctor];
    }

    function getDocumentOwner(string memory _ipfsHash) external view returns (address) {
        return documents[_ipfsHash].owner;
    }

    function getDocumentDetails(string memory _ipfsHash) external view returns (address) {
        return documents[_ipfsHash].owner;
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
