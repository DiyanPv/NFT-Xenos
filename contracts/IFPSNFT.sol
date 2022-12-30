// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "hardhat/console.sol";
pragma solidity ^0.8.17;
//we are to get a random number, based on that number, we get a random NFT
//PUG (rare), SHIBA(medium rare), Golden Retriever(common)

//errors
error NeedMoreETHToCall();
error WithdrawFailed();

//contract declaration
abstract contract RandomIFPSNFT is ERC721URIStorage, VRFConsumerBaseV2, Ownable {

    enum Breed {
        PUG,
        SHIBA_INU,
        G_RETRIEVER
    }

//VRF Helpers and Storage Variables
mapping(uint256 => address) public requestIdToSender;
VRFCoordinatorV2Interface private immutable i_vrfCoordinator; 
uint64 private immutable i_subscriptionId;
bytes32 private immutable i_keyHash;
uint32 private immutable i_callBackGasLimit;
uint16 private constant REQUEST_CONFIRMATIONS = 3;
uint32 private constant NUM_WORDS = 1;
uint256 public tokenCounter = 0;
string[] s_dogTokenURIs;
uint256 internal immutable i_mintFee;

//Events
event NftRequested(uint256 indexed requestId, address requester);
event NFTminted(Breed dogBreed, address minter);

constructor(address vrfCoordinatorV2, uint64 subscriptionId, bytes32 keyHash, uint32 callBackGas, string[3] memory dogs, uint256 mintFee) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IFPS NFT", "RINF"){
i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
i_subscriptionId = subscriptionId;
i_keyHash = keyHash;
s_dogTokenURIs = dogs;
i_callBackGasLimit = callBackGas;
i_mintFee = mintFee;
 }

// params are as follows (for requestRandomWords fn):
// keyHash
// s_subscriptionId
// requestConfirmations
// callBackGasLimit
// numWords 


function requestNFT() public payable returns(uint256 requestId){
    if(msg.value< i_mintFee){
        revert NeedMoreETHToCall();
    }
requestId = i_vrfCoordinator.requestRandomWords(i_keyHash, i_subscriptionId, REQUEST_CONFIRMATIONS, i_callBackGasLimit, NUM_WORDS);
requestIdToSender [requestId] = msg.sender;
}

function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
address dogOwner = requestIdToSender[requestId];
uint256 newTokenId = tokenCounter;
uint256 moddedRandomNum = randomWords[0] % 100;
Breed dogBreed = getBreed(moddedRandomNum);
_safeMint(dogOwner, newTokenId);
_setTokenURI(newTokenId, s_dogTokenURIs[uint256(dogBreed)]);
emit NFTminted(dogBreed, dogOwner);
}

function withdraw() public onlyOwner{
uint256 amount = address(this).balance;
(bool success,) = payable(msg.sender).call{value: amount}("");
if(!success){
    revert WithdrawFailed();
}
}


function getBreed(uint256 randomNum) public pure returns(Breed) {
uint256 cumulativeSum = 0;
uint8[3] memory chanceArray = getChances();
for(uint256 i =0; i<3; i++ ){
if(randomNum>= cumulativeSum && randomNum < cumulativeSum + chanceArray[i]){
    return Breed(i);
}
cumulativeSum += chanceArray[i];
}
}

function getChances() public pure returns (uint8[3] memory){
    return [10, 30, 100];
}

function getMintFee() public view returns(uint256){
    return i_mintFee;
}

function getDogTokenUris(uint256 index) public view returns(string memory){
return s_dogTokenURIs[index];
}

function getTokenCounter() public view returns(uint256){
    return tokenCounter;
}
}

//how to create an erc721 in solidity?