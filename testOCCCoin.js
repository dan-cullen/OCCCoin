const { expect } = require("chai");
const { ethers } = require("hardhat"); // Use Hardhat's ethers
const { verifyBankDeposit, verifyRedemption, verifyKyc } = require("./mockBankApi");
console.log(ethers.utils); // Add this before line 7
describe("OCCCoin Integration Tests", function () {
  let occCoin, mockReserveFeed, owner, minter, user;
const initialReserveBalance = ethers.utils.parseUnits("10000", 6);

  beforeEach(async () => {
    const MockReserveFeed = await ethers.getContractFactory("MockReserveFeed");
    mockReserveFeed = await MockReserveFeed.deploy(initialReserveBalance);
    await mockReserveFeed.deployed();

    const OCCCoin = await ethers.getContractFactory("OCCCoin");
    [owner, minter, user] = await ethers.getSigners();
    occCoin = await OCCCoin.deploy(mockReserveFeed.address);
    await occCoin.deployed();

    await occCoin.grantRole(await occCoin.MINTER_ROLE(), minter.address);
  });

  it("should mint tokens after verifying bank deposit and reserve", async () => {
    const depositAmount = 1000;
    const transactionId = "tx123";
    const depositResult = verifyBankDeposit(transactionId, depositAmount);
    const kycResult = verifyKyc(user.address);
console.log("KYCresult:",kycResult);
    expect(depositResult.success).to.equal(true);
    expect(kycResult.success).to.equal(true);

    await occCoin.connect(minter).mint(user.address, ethers.utils.parseUnits(depositAmount.toString(), 6));
    expect(await occCoin.balanceOf(user.address)).to.equal(ethers.utils.parseUnits(depositAmount.toString(), 6));
    expect(await occCoin.totalSupply()).to.equal(ethers.utils.parseUnits(depositAmount.toString(), 6));
  });

  it("should fail to mint if reserve is insufficient", async () => {
    const depositAmount = 20000;
    const transactionId = "tx124";
    const depositResult = verifyBankDeposit(transactionId, depositAmount);
    const kycResult = verifyKyc(user.address);

    expect(depositResult.success).to.equal(true);
    expect(kycResult.success).to.equal(true);

    await expect(
      occCoin.connect(minter).mint(user.address, ethers.utils.parseUnits(depositAmount.toString(), 6))
    ).to.be.revertedWith("OCCCoin: Insufficient reserves");
  });

  it("should burn tokens and process redemption", async () => {
    const depositAmount = 1000;
    const redeemAmount = 500;
    const transactionId = "tx125";

    const depositResult = verifyBankDeposit(transactionId, depositAmount);
    const kycResult = verifyKyc(user.address);
    expect(depositResult.success).to.equal(true);
    expect(kycResult.success).to.equal(true);

    await occCoin.connect(minter).mint(user.address, ethers.utils.parseUnits(depositAmount.toString(), 6));

    await occCoin.connect(user).approve(minter.address, ethers.utils.parseUnits(redeemAmount.toString(), 6));
    const redemptionResult = verifyRedemption(transactionId, redeemAmount);
    expect(redemptionResult.success).to.equal(true);

    await occCoin.connect(minter).burnFrom(user.address, ethers.utils.parseUnits(redeemAmount.toString(), 6));
    expect(await occCoin.balanceOf(user.address)).to.equal(ethers.utils.parseUnits((depositAmount - redeemAmount).toString(), 6));
    expect(await occCoin.totalSupply()).to.equal(ethers.utils.parseUnits((depositAmount - redeemAmount).toString(), 6));
  });

  it("should fail to mint to blacklisted address", async () => {
    const depositAmount = 1000;
    const transactionId = "tx126";

    await occCoin.blacklist(user.address);
    expect(await occCoin.isBlacklisted(user.address)).to.equal(true);

    const depositResult = verifyBankDeposit(transactionId, depositAmount);
    const kycResult = verifyKyc(user.address);
    expect(depositResult.success).to.equal(true);
    expect(kycResult.success).to.equal(true);

    await expect(
      occCoin.connect(minter).mint(user.address, ethers.utils.parseUnits(depositAmount.toString(), 6))
    ).to.be.revertedWith("OCCCoin: Account is blacklisted");
  });

  it("should update reserve balance and allow minting", async () => {
    const depositAmount = 5000;
    const transactionId = "tx127";

    await mockReserveFeed.setReserveBalance(ethers.utils.parseUnits("20000", 6));

    const depositResult = verifyBankDeposit(transactionId, depositAmount);
    const kycResult = verifyKyc(user.address);
    expect(depositResult.success).to.equal(true);
    expect(kycResult.success).to.equal(true);

    await occCoin.connect(minter).mint(user.address, ethers.utils.parseUnits(depositAmount.toString(), 6));
    expect(await occCoin.balanceOf(user.address)).to.equal(ethers.utils.parseUnits(depositAmount.toString(), 6));
  });
});
