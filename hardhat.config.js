require("@nomicfoundation/hardhat-toolbox");
// require('@nomiclabs/hardhat-ethers');
require("@nomicfoundation/hardhat-ethers");
// require('@nomiclabs/hardhat-etherscan');
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();

const Sepolia_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const { PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  settings: {
    optimizer: {
      enabled: true, // 如果你在部署时启用了优化，确保这里也启用
      runs: 200      // 与部署时的设置一致
    }
  },
  networks: {
    dev: { url: 'http://localhost:8545' },
    Sepolia: {
      url: Sepolia_RPC_URL,
      accounts: [PRIVATE_KEY] // Use your private key here
    },
  },
  mocha: {
    timeout: 10000
  },
};