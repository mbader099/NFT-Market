// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {

    uint public tokenCount;
    
    constructor() ERC721("Mo NFT", "MNFT"){}


    function mint(string memory _tokenURI) external returns(uint){
        tokenCount++;
        //mints NFT to address
        _safeMint(msg.sender, tokenCount);

        //Sets metadata for newly mintedNFT
        _setTokenURI(tokenCount, _tokenURI);

        return (tokenCount);


    }
}
