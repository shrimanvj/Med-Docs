// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentStorage {
    address public owner;
    uint256 public uploadFee = 0.001 ether; // Fee for uploading a document
    mapping(address => string[]) private userDocuments;
    
    event DocumentStored(address indexed user, string ipfsHash);
    event FeeUpdated(uint256 newFee);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function setUploadFee(uint256 _newFee) external onlyOwner {
        uploadFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    function storeDocument(string memory _ipfsHash) external payable {
        require(msg.value >= uploadFee, "Insufficient payment");
        
        userDocuments[msg.sender].push(_ipfsHash);
        emit DocumentStored(msg.sender, _ipfsHash);

        // Return excess payment if any
        if (msg.value > uploadFee) {
            payable(msg.sender).transfer(msg.value - uploadFee);
        }
    }

    function getUserDocuments() external view returns (string[] memory) {
        return userDocuments[msg.sender];
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
