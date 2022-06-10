const { expect } = require("chai"); 
const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString()) 
const fromWei = (num) => ethers.utils.formatEther(num) 

describe("NFTMarkerplace",  function(){
   
    let deployer, addr1, addr2, nft, marketplace
    let feePercent = 1
    let URI = "Sample URI"

    beforeEach(async function(){
    const NFT = await ethers.getContractFactory("NFT")
    const Marketplace = await ethers.getContractFactory("Marketplace");
    [deployer, addr1, addr2] = await ethers.getSigners()

    nft = await NFT.deploy()
    marketplace = await Marketplace.deploy(feePercent)

    });

    describe("Deployment" , function(){
        it("Should track name and symbol of the NFT collection", async function(){
            expect(await nft.name()).to.equal("Mo NFT")
            expect(await nft.symbol()).to.equal("MNFT")
        })


        it("Should track feeAccount and feePercent of the marketplace", async function(){
            expect(await marketplace.feeAccount()).to.equal(deployer.address)
            expect(await marketplace.feePercent()).to.equal(feePercent)
        })
    })  

    describe("Minting NFT", function(){
        it("Should track each minted NFT", async function(){
            await nft.connect(addr1).mint(URI)
            expect(await nft.tokenCount()).to.equal(1)
            expect(await nft.balanceOf(addr1.address)).to.equal(1)
            expect(await nft.tokenURI(1)).to.equal(URI)

            await nft.connect(addr2).mint(URI)
            expect(await nft.tokenCount()).to.equal(2)
            expect(await nft.balanceOf(addr2.address)).to.equal(1)
            expect(await nft.tokenURI(2)).to.equal(URI)

        })
        
    })    
    describe("Making Marketplace items", function(){
        beforeEach(async function(){
            //addr1 mints nft 
            await nft.connect(addr1).mint(URI)
            //add1 approves marketplace to spend nft
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
        })

        it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async function(){
            //addr1 offers their nft at the price of 1 ether
            await expect(marketplace.connect(addr1).makeItem(nft.address, 1, toWei(1)))
                .to.emit(marketplace, "Offered")
                .withArgs(
                    1,
                    nft.address,
                    1,
                    toWei(1),
                    addr1.address
                )
            //Owner of NFT should now be the marketplace
            expect(await nft.ownerOf(1)).to.equal(marketplace.address)
            //Item count should now be equal to 1
            expect(await marketplace.itemCount()).to.equal(1)
            //Get Item from items mapping then check fields to ensure they're correct
            const item = await marketplace.items(1)
            expect(item.itemId).to.equal(1)
            expect(item.nft).to.equal(nft.address)
            expect(item.tokenId).to.equal(1)
            expect(item.price).to.equal(toWei(1))
            expect(item.sold).to.equal(false)
        })

        it("should fail if the price is set to zero", async function(){
            await expect(
                marketplace.connect(addr1).makeItem(nft.address, 1, 0)
            ).to.be.revertedWith("Price must be greater than zero")
        })
    })

})