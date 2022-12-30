const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
async function storeImage(imageFilePath) {
  const fullImagePath = path.resolve(imageFilePath);
  const files = fs.readdirSync(fullImagePath);
  console.log(files);
}

module.exports = { storeImage };
