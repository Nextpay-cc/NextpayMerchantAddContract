const { ethers, upgrades } = require("hardhat");

async function main() {
    MerchantContract = await ethers.getContractFactory("NexpayMerchantAdd");

    proxy = await upgrades.deployProxy(MerchantContract, [], { initializer: 'initialize' });
    await proxy.waitForDeployment();
    console.log(proxy.target)
}

main();