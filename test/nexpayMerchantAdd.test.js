// const {
//   time,
//   loadFixture,
// } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("MerchantContract", function () {
  let MerchantContract, MerchantContractV2;
  let proxy;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {

    MerchantContract = await ethers.getContractFactory("NexpayMerchantAdd");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    proxy = await upgrades.deployProxy(MerchantContract, [], { initializer: 'initialize', from: addr1.address });
    await proxy.waitForDeployment();

    priceBigNumber = ethers.parseEther("0.5"); // Set mint price to 0.1 ETH
  });

  it("Print adds", async function() {
    const implementation = await upgrades.erc1967.getImplementationAddress(proxy.target);
    console.log("Proxy Address:", proxy.target);
    console.log("Implementation Address:", implementation);
    expect(await proxy.owner()).to.equal(owner.address)

  })

  describe("updateAddresses Checks", function () {
    it("should clear old addresses and allow a registered merchant to update their addresses", async function () {
      const initialAddresses = [addr1.address, addr2.address];
      const newAddresses = [addr3.address];
  
      // Register merchant with initial addresses
      await proxy.updateAddresses(initialAddresses)

      // Update merchant addresses with new addresses
      await proxy.updateAddresses(newAddresses)
      
      // Check that the stored addresses match the new addresses
      const storedAddresses = await proxy.getAddresses();
      expect(storedAddresses).to.deep.equal(newAddresses);
    });

  })

  describe("validate Checks", function () {

    it("should return true if the address is valid for a registered merchant", async function () {
      const addresses = [addr1.address, addr2.address];

      await proxy.updateAddresses(addresses)


      // Validate one of the registered addresses
      const isValid = await proxy.validateAddress(owner.address, addr1.address);
      expect(isValid).to.be.true;
    });

    it("should return false if the address is not valid for a registered merchant", async function () {
        const addresses = [addr1.address, addr2.address];

        // Validate an address that is not in the registered addresses
        const isValid = await proxy.validateAddress(owner.address, addr3.address);
        expect(isValid).to.be.false;
    });
  })

  describe("getAddresses Checks", function () {
    it("should only allow registered merchants to get their addresses", async function () {
      const addresses = [addr1.address, addr2.address];

      
      await proxy.updateAddresses(addresses)
      console.log(await proxy.connect(addr1).getAddresses())
      // await expect()
      //   .to.be.revertedWith("Merchant not registered");
      
      const storedAddresses = await proxy.getAddresses();
      expect(storedAddresses).to.deep.equal(addresses);
    });

  })
  
  describe("addItem Checks", function () {
    it ("should revert if the merchant does not have at least one address associated", async function () {
      const itemId = "1";
      await expect(proxy.addItem(itemId))
      .to.be.revertedWith("Merchant must have at least one address associated");
    })

    it("should allow a registered merchant to add an item", async function () {

      const addresses = [addr1.address, addr2.address];
      await proxy.updateAddresses(addresses)

      const itemId = "1";
      
      // 添加 item
      await proxy.addItem(itemId)
      
      // 检查商户的 item 列表
      const items = await proxy.getItems();
      expect(items).to.deep.equal([itemId]);

      // 验证 itemId 到商户地址的映射
      const merchantAddress = await proxy.findMerchantByItem(itemId);
      expect(merchantAddress).to.equal(owner.address);

      const addresses_c = await proxy.getAddressesByItem(itemId);
      expect(JSON.stringify(addresses_c)).to.equal(JSON.stringify(addresses));

    });
  })

  describe("findMerchantByItem Checks", function () {

    it("should return the correct items for a registered merchant", async function () {
      const addresses = [addr1.address, addr2.address];
      await proxy.updateAddresses(addresses)
      
      const itemId1 = "3";
      const itemId2 = "4";
      

      // 添加多个 items
      await proxy.addItem(itemId1);
      await proxy.addItem(itemId2);

      // 获取商户的所有 items
      const items = await proxy.getItems();
      expect(items).to.deep.equal([itemId1, itemId2]);

      // 验证 itemId 到商户地址的映射
      expect(await proxy.findMerchantByItem(itemId1)).to.equal(owner.address);
      expect(await proxy.findMerchantByItem(itemId2)).to.equal(owner.address);
    });
  })

  describe("Upgradeable Tests", function () {

    it("should upgrade to V2 and use new functionality", async function () {
      // 部署 V2 版本合约
      MerchantContractV2 = await ethers.getContractFactory("NexpayMerchantAddV2");

      proxy = await upgrades.upgradeProxy(proxy.target, MerchantContractV2);
  
      // 测试新功能
      const response = await proxy.newFunction();
      expect(response).to.equal("New functionality in V2");
  
      // 测试原有功能是否依旧可用
      await proxy.connect(owner).updateAddresses([addr1.address]);
      const addresses = await proxy.getAddresses();
      expect(addresses).to.include(addr1.address);
  
      await proxy.connect(owner).addItem("item2");
      const items = await proxy.getItems();
      expect(items).to.include("item2");
  
      const associatedAddresses = await proxy.getAddressesByItem("item2");
      expect(associatedAddresses).to.include(addr1.address);
    });
  
  })

});


