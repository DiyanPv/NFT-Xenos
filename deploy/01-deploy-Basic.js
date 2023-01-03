const { network, ethers } = require("hardhat");
require(`dotenv`).config();
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require(`../utils/verify`);

module.exports = async function ({ getNamedAccounts, deployments }) {
  if (developmentChains.includes(network.config.chainId)) {
    return;
  }
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = [];
  const firstNFT = await deploy("NFT", {
    from: deployer,
    args: args,
    log: true,
  });
  console.log(`Deployed at ${firstNFT.address}`);
  // if (!developmentChains.includes(network.name)) {
  //   await verify(firstNFT.address, args);
  // }
};

//Goerli NFT generated at https://goerli.etherscan.io/address/0x149fb1ee5d608a4b5cc8194b1d4cc213e76169fb

module.exports.tags = ["all", "main"];
