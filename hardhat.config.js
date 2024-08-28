require("@nomicfoundation/hardhat-toolbox");
// require('@nomiclabs/hardhat-ethers');
require("@nomicfoundation/hardhat-ethers");
// require('@nomiclabs/hardhat-etherscan');
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();
const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);

const Amoy_RPC_URL= "https://polygon-amoy.drpc.org"
const Sepolia_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const { PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  // settings: {
  //   optimizer: {
  //     enabled: true,
  //     runs: 200,
  //   },
  // },
  sourcify: {
    enabled: true
  },
  networks: {
    dev: { url: 'http://localhost:8545' },
    sepolia: {
      url: Sepolia_RPC_URL,
      accounts: [PRIVATE_KEY], // Use your private key here
    },
    amoy: {
      url: Amoy_RPC_URL,
      accounts: [PRIVATE_KEY] // Use your private key here
    },
  },
  mocha: {
    timeout: 10000
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY // npx hardhat verify --network amoy 0x 
  }
};