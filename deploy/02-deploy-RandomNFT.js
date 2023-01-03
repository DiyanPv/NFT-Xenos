const { network, ethers } = require("hardhat");
require(`dotenv`).config();
const {
  storeImage,
  storeTokenUriMetaData,
} = require("../utils/uploadToPinata");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require(`../utils/verify`);
const imagesFolderLocation = "./images";
module.exports = async function ({ getNamedAccounts, deployments }) {
  let vrfCoordinatorV2Address, subscriptionId, tokenUris;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const metaDataInterface = {
    name: "",
    description: "",
    image: "",
    attributes: [],
  };
  if (process.env.UPLOAD_TO_PINATA === `true`) {
    console.log(`Uploading JSON to Pinata`);
    tokenUris = await handleTokenUris();
    return tokenUris;
  }
  if (developmentChains.includes(network.name)) {
    const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const VRFCoordinatorV2Mock = await ethers.getContractAt(
      "VRFCoordinatorV2Mock",
      address
    );
    vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address;
    const tx = await VRFCoordinatorV2Mock.createSubscription();
    const txReceipt = await tx.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].VRFCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }
  await storeImage(imagesFolderLocation);
  const args = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[chainId].gasLane,
    networkConfig[chainId].mintFee,
    networkConfig[chainId].callBackGasLimit,
  ];
};

async function handleTokenUris() {
  //1. Storing the image
  //2. Store metadata for NFT Uri
  tokenUris = [];
  const { responses: responsess, files } = await storeImage(
    imagesFolderLocation
  );
  for (let index in responsess) {
    let tokenUriMetaData = { ...metaDataInterface };
    tokenUriMetaData.name = files[index].replace(".png", "");
    tokenUriMetaData.description = `An adorable ${tokenUriMetaData.name} NFT`;
    tokenUriMetaData.image = `ipfs://${imageUploadResponses[index].IpfsHash}`;
    const metaDataUpload = await storeTokenUriMetaData(tokenUriMetaData);
    tokenUris.push(`ipfs://${metaDataUpload.IpfsHash}`);
  }
  console.log(tokenUris);

  return tokenUris;
}

module.exports.tags = ["randomnft"];
// API Key: 84e028e1a25d8b63ff67
//  API Secret: 45054c85735edd203c7b7fa0ef3037bd72ed4976e8e00b67e2ce7e99a34e7de6
//  JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2N2Y2YzI3Ny1lM2EzLTRkMGMtYjY2OC02YmVhNjdlMjNiNmUiLCJlbWFpbCI6ImRpZG8wMDlAYWJ2LmJnIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6Ijg0ZTAyOGUxYTI1ZDhiNjNmZjY3Iiwic2NvcGVkS2V5U2VjcmV0IjoiNDUwNTRjODU3MzVlZGQyMDNjN2I3ZmEwZWYzMDM3YmQ3MmVkNDk3NmU4ZTAwYjY3ZTJjZTdlOTlhMzRlN2RlNiIsImlhdCI6MTY3MjQxNjIwNn0.bPs18xInHq4raSOkfStfk9gY2iWc09zLFSX5_-npQ-A
