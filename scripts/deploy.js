const hre = require("hardhat");

async function main() {
  const DocumentStorage = await hre.ethers.getContractFactory("DocumentStorage");
  const documentStorage = await DocumentStorage.deploy();

  await documentStorage.deployed();

  console.log("DocumentStorage deployed to:", documentStorage.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
