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

    it("should allow a merchant to register", async function () {
      const addresses = [addr1.address, addr2.address];

      await expect(merchantContract.registerMerchant())
        .to.emit(merchantContract, "MerchantRegistered")
        .withArgs(owner.address);

      const storedAddresses = await merchantContract.getAddresses();
      expect(storedAddresses).to.deep.equal([]);
    });

    it("should not allow the same merchant to register twice", async function () {
      const addresses = [addr1.address, addr2.address];
  
      // Register the merchant for the first time
      await merchantContract.registerMerchant();
  
      // Attempt to register the merchant again
      await expect(merchantContract.registerMerchant()).to.be.revertedWith("Merchant already registered");
    });
  })

  describe("updateAddresses Checks", function () {
    it("should clear old addresses and allow a registered merchant to update their addresses", async function () {
      const initialAddresses = [addr1.address, addr2.address];
      const newAddresses = [addr3.address];
  
      // Register merchant with initial addresses
      await merchantContract.registerMerchant();
      await merchantContract.updateAddresses(initialAddresses)

      const storeInitAddresses = await merchantContract.getAddresses();
      expect(storeInitAddresses).to.deep.equal(initialAddresses);

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

  })

  describe("validate Checks", function () {

    it("should return true if the address is valid for a registered merchant", async function () {
      const addresses = [addr1.address, addr2.address];

      // Register the merchant with initial addresses
      await merchantContract.registerMerchant();

      await merchantContract.updateAddresses(addresses)


      // Validate one of the registered addresses
      const isValid = await merchantContract.validateAddress(owner.address, addr1.address);
      expect(isValid).to.be.true;
    });

    it("should return false if the address is not valid for a registered merchant", async function () {
        const addresses = [addr1.address, addr2.address];

        // Register the merchant with initial addresses
        await merchantContract.registerMerchant();

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

      await merchantContract.registerMerchant();
      await merchantContract.updateAddresses(addresses)

      await expect(merchantContract.connect(addr1).getAddresses())
        .to.be.revertedWith("Merchant not registered");
      
      const storedAddresses = await merchantContract.getAddresses();
      expect(storedAddresses).to.deep.equal(addresses);
    });

  })
  
  describe("addItem Checks", function () {
    it ("should revert if the merchant is not registered", async function () {
      const itemId = "1";
      await expect(merchantContract.addItem(itemId))
      .to.be.revertedWith("Merchant not registered");
    })

    it("should allow a registered merchant to add an item", async function () {
      const itemId = "1";
      await merchantContract.registerMerchant();

      // 添加 item
      await expect(merchantContract.addItem(itemId))
        .to.emit(merchantContract, "ItemAdded")
        .withArgs(owner.address, itemId);

      // 检查商户的 item 列表
      const items = await merchantContract.getItems();
      expect(items).to.deep.equal([itemId]);

      // 验证 itemId 到商户地址的映射
      const merchantAddress = await merchantContract.findMerchantByItem(itemId);
      expect(merchantAddress).to.equal(owner.address);
    });
  })

  describe("findMerchantByItem Checks", function () {

    it("should return the correct items for a registered merchant", async function () {
      const itemId1 = "3";
      const itemId2 = "4";
      await merchantContract.registerMerchant();

      // 添加多个 items
      await merchantContract.addItem(itemId1);
      await merchantContract.addItem(itemId2);

      // 获取商户的所有 items
      const items = await merchantContract.getItems();
      expect(items).to.deep.equal([itemId1, itemId2]);

      // 验证 itemId 到商户地址的映射
      expect(await merchantContract.findMerchantByItem(itemId1)).to.equal(owner.address);
      expect(await merchantContract.findMerchantByItem(itemId2)).to.equal(owner.address);
    });
  })

});


