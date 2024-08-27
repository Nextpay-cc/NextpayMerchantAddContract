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

  describe("register Checks", function () {

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
      const addresses2 = [addr3.address];

      await merchantContract.registerMerchant(addresses);
      await expect(merchantContract.registerMerchant(addresses2)).to.be.revertedWith("Merchant already registered");
    });

    it("should not allow the same merchant to register twice", async function () {
      const addresses = [addr1.address, addr2.address];
  
      // Register the merchant for the first time
      await merchantContract.registerMerchant(addresses);
  
      // Attempt to register the merchant again
      await expect(merchantContract.registerMerchant(addresses)).to.be.revertedWith("Merchant already registered");
    });

    it("should revert if no addresses are provided during registration", async function () {
      // Attempt to register a merchant with an empty address array
      await expect(merchantContract.registerMerchant([])).to.be.revertedWith("Must provide at least one address");
    });
  })

  describe("updateAddresses Checks", function () {
    it("should clear old addresses and allow a registered merchant to update their addresses", async function () {
      const initialAddresses = [addr1.address, addr2.address];
      const newAddresses = [addr3.address];
  
      // Register merchant with initial addresses
      await merchantContract.registerMerchant(initialAddresses);
  
      // Update merchant addresses with new addresses
      await expect(merchantContract.updateAddresses(newAddresses))
        .to.emit(merchantContract, "AddressesUpdated")
        .withArgs(owner.address, newAddresses);
  
      // Check that the stored addresses match the new addresses
      const storedAddresses = await merchantContract.getAddresses();
      expect(storedAddresses).to.deep.equal(newAddresses);
    });
  
    it("should revert if the merchant is not registered", async function () {
      const newAddresses = [addr3.address];
  
      // Attempt to update addresses without registering
      await expect(merchantContract.updateAddresses(newAddresses))
        .to.be.revertedWith("Merchant not registered");
    });

    it("should revert if no addresses are provided", async function () {
      const initialAddresses = [addr1.address, addr2.address];
      
      // Register merchant with initial addresses
      await merchantContract.registerMerchant(initialAddresses);
  
      // Attempt to update with an empty array
      await expect(merchantContract.updateAddresses([]))
        .to.be.revertedWith("Must provide at least one address");
    });

  })

  describe("getAddresses Checks", function () {

    it("should return true if the address is valid for a registered merchant", async function () {
      const addresses = [addr1.address, addr2.address];

      // Register the merchant with initial addresses
      await merchantContract.registerMerchant(addresses);

      // Validate one of the registered addresses
      const isValid = await merchantContract.validateAddress(owner.address, addr1.address);
      expect(isValid).to.be.true;
    });

    it("should return false if the address is not valid for a registered merchant", async function () {
        const addresses = [addr1.address, addr2.address];

        // Register the merchant with initial addresses
        await merchantContract.registerMerchant(addresses);

        // Validate an address that is not in the registered addresses
        const isValid = await merchantContract.validateAddress(owner.address, addr3.address);
        expect(isValid).to.be.false;
    });

    it("should revert if the merchant is not registered", async function () {
        // Attempt to validate an address for an unregistered merchant
        await expect(merchantContract.validateAddress(addr3.address, addr1.address))
          .to.be.revertedWith("Merchant not registered");
    });
  })

  describe("getAddresses Checks", function () {
    it("should only allow registered merchants to get their addresses", async function () {
      const addresses = [addr1.address, addr2.address];

      await merchantContract.registerMerchant(addresses);
      
      await expect(merchantContract.connect(addr1).getAddresses())
        .to.be.revertedWith("Merchant not registered");
      
      const storedAddresses = await merchantContract.getAddresses();
      expect(storedAddresses).to.deep.equal(addresses);
    });

  })
  

});


