// const {
//   time,
//   loadFixture,
// } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("MerchantContract", function () {
  let MerchantContract;
  let merchantContract;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {

    MerchantContract = await ethers.getContractFactory("NexpayMerchantAdd");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    merchantContract = await MerchantContract.deploy();


  
    priceBigNumber = ethers.parseEther("0.5"); // Set mint price to 0.1 ETH


  });

  it("should allow a merchant to register with addresses", async function () {
    const addresses = [addr1.address, addr2.address];

    await expect(merchantContract.registerMerchant(addresses))
      .to.emit(merchantContract, "MerchantRegistered")
      .withArgs(owner.address, addresses);

    const storedAddresses = await merchantContract.getAddresses();
    expect(storedAddresses).to.deep.equal(addresses);
  });

  it("should not allow the same merchant to register twice", async function () {
    const addresses = [addr1.address, addr2.address];

    await merchantContract.registerMerchant(addresses);
    await expect(merchantContract.registerMerchant(addresses)).to.be.revertedWith("Merchant already registered");
  });

  it("should allow a merchant to update their addresses", async function () {
    const initialAddresses = [addr1.address, addr2.address];
    const newAddresses = [addr3.address];

    await merchantContract.registerMerchant(initialAddresses);
    await expect(merchantContract.updateAddresses(newAddresses))
      .to.emit(merchantContract, "AddressesUpdated")
      .withArgs(owner.address, newAddresses);

    const storedAddresses = await merchantContract.getAddresses();
    expect(storedAddresses).to.deep.equal(newAddresses);
  });

  it("should allow clients to validate an address", async function () {
    const addresses = [addr1.address, addr2.address];

    await merchantContract.registerMerchant(addresses);

    await expect(merchantContract.validateAddress(owner.address, addr1.address))
      .to.emit(merchantContract, "AddressValidated")
      .withArgs(owner.address, addr1.address);
    
    await expect(merchantContract.validateAddress(addr1.address, addr3.address))
      .to.be.revertedWith("Merchant not registered");
  });

  it("should revert if a client tries to validate an address of an unregistered merchant", async function () {
    await expect(merchantContract.validateAddress(owner.address, addr1.address))
      .to.be.revertedWith("Merchant not registered");
  });

  it("should only allow registered merchants to get their addresses", async function () {
    const addresses = [addr1.address, addr2.address];

    await merchantContract.registerMerchant(addresses);
    
    await expect(merchantContract.connect(addr1).getAddresses())
      .to.be.revertedWith("Merchant not registered");
    
    const storedAddresses = await merchantContract.getAddresses();
    expect(storedAddresses).to.deep.equal(addresses);
  });
 

});


