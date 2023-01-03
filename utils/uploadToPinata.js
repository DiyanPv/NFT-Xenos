const pinataSDK = require("@pinata/sdk");
const path = require("path");
require(`dotenv`).config();
const fs = require("fs");
const pinataApiKey = process.env.API_KEY_PINATA;
const pinataSecret = process.env.API_SECRET_PINATA;
const pinata = pinataSDK(pinataApiKey, pinataSecret);
async function storeImage(imageFilePath) {
  const fullImagePath = path.resolve(imageFilePath);
  const files = fs.readdirSync(fullImagePath);
  let responsess = [];
  for (let fileIndex in files) {
    const readableStreamFile = fs.createReadStream(
      `${fullImagePath}/${files[fileIndex]}`
    );
    try {
      const response = await pinata.pinFileToIPFS(readableStreamFile);
      console.log(`Uploading to IPFS..! ${response}`);
      responsess.push(response);
    } catch (err) {
      console.log(err);
    }
  }
  return { responsess, files };
}

async function storeTokenUriMetaData(metaData) {
  try {
    const response = await pinata.pinJSONToIPFS(metaData);
    console.log(`Uploading JSON to IPFS`);
    return response;
  } catch (err) {
    console.log(err);
  }
  return null;
}

module.exports = { storeImage, storeTokenUriMetaData };
