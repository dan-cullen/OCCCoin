require("@nomicfoundation/hardhat-toolbox");

async function main() {
  const [deployer] = await ethers.getSigners();

	console.log(
	"Deploying contracts with the account:",
	deployer.address
	);
	
  const OCCCoin = await ethers.getContractFactory("OCCCoin");
  const occc = await OCCCoin.deploy();
  await occc.deployed();
  console.log("USDCoin deployed to:", occc.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
