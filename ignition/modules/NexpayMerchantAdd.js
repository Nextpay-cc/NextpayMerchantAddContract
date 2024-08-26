const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("NexpayMerchantAdd", (m) => {
    // Get the deployer account
    const deployer = m.getAccount(0);
    console.log("Deployer account:", deployer.address);
    const merchantContract = m.contract("NexpayMerchantAdd", [], { proxy: true });
    return { merchantContract };
});