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
  etherscan: {
    // Your Etherscan API key for contract verification (optional)
    apiKey: ""
  }
};