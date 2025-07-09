// test/minimalTest.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Minimal Test", function () {
  it("should access ethers.utils", async function () {
    console.log(ethers.utils);
    const value = ethers.utils.parseUnits("10000", 6);
    expect(value.toString()).to.equal("10000000000");
  });
});
