import { expect } from "chai";
import { Contract,getRandomNonce,Address,WalletTypes, Signer, toNano } from "locklift";
import { FactorySource } from "../build/factorySource";
import { Account } from "everscale-standalone-client";
import { ContractData } from "locklift/internal/factory";
import { zeroAddress } from "locklift"; 
let marketplace: Contract<FactorySource["Marketplace"]>;
let collection: Contract<FactorySource["Collection"]>;
let signer: any;
let someAccount: Account;
let nft: Contract<FactorySource["Nft"]>;
let tokenRoot: Contract<FactorySource["TokenRoot"]>

const TOKEN_ROOT_ADDRESS = new Address("0:2853e2a7190d7a2d887622645fb379ab09a2c8712ece150142335e14520c8525")

describe("Test Marketplace Contract", async function () {

  let nftArtifacts: ContractData<any>
  let indexArtifacts: ContractData<any>
  let indexBasisArtifacts: ContractData<any>

  before(async () => {
    signer = (await locklift.keystore.getSigner("0"))!;
    nftArtifacts = await locklift.factory.getContractArtifacts("Nft");
    indexArtifacts = await locklift.factory.getContractArtifacts("Index");
    indexBasisArtifacts = await locklift.factory.getContractArtifacts("IndexBasis");
    someAccount = await locklift.factory.accounts.addExistingAccount({
      type: WalletTypes.WalletV3,
      publicKey: signer.publicKey
    });
  });


  describe("Contracts", async function () {
    it("Load contract factory", async function () {
      const sampleData = await locklift.factory.getContractArtifacts("Marketplace");

      expect(sampleData.code).not.to.equal(undefined, "Code should be available");
      expect(sampleData.abi).not.to.equal(undefined, "ABI should be available");
      expect(sampleData.tvc).not.to.equal(undefined, "tvc should be available");
    });    

    it("Deploy Collection contract", async function () {      
    //COLLECTION CONTRACT DEPLOY
    const { contract: collectionContract } = await locklift.factory.deployContract({
      contract: "Collection",
      publicKey: signer.publicKey,
      initParams: {},
      constructorParams: {
        codeNft: nftArtifacts.code,
        json: `{"collection":"tutorial"}`, // EXAMPLE...not by TIP-4.2
        codeIndex: indexArtifacts.code,
        codeIndexBasis: indexBasisArtifacts.code
      },
      value: locklift.utils.toNano(0.5),
    });
    collection = collectionContract;

    expect(await locklift.provider.getBalance(collection.address).then(balance => Number(balance))).to.be.above(0);
  })
  it("Deploy Tokenroot contract", async function () {      

    //TokenRoot CONTRACT DEPLOY
    const { contract: tokenRootAdded } = await locklift.factory.deployContract({
      contract: "TokenRoot",
      publicKey: signer.publicKey,
      initParams: {
        randomNonce_: 0,
        deployer_: zeroAddress,
        name_: "test",
        symbol_: "tst",
        decimals_: 3,
        rootOwner_: someAccount.address,
        walletCode_: (await locklift.factory.getContractArtifacts("TokenWallet")).code,
      },
      constructorParams: {
        initialSupplyTo: someAccount.address, // giving tokens to our participant right here and right now
        initialSupply: 100000000000,
        deployWalletValue: 100000000,
        mintDisabled: true,
        burnByRootDisabled: true,
        burnPaused: false,
        remainingGasTo: someAccount.address,
      },
      value: locklift.utils.toNano(2),
    });
    tokenRoot = tokenRootAdded;
    })

  it("Deploy Marketplace Collection contract", async function () {      

    //MARKETPLACE CONTRACT DEPLOY
    const { contract: marketplaceContract } = await locklift.factory.deployContract({
      contract: "Marketplace",
      publicKey: signer.publicKey,
      initParams: {
        _owner: someAccount.address,
        _nonce: getRandomNonce()
      },
      constructorParams: {
        tokenRoot: TOKEN_ROOT_ADDRESS,
        sendRemainingGasTo: someAccount.address
      },
      value: toNano(0.5),
    });
    marketplace = marketplaceContract;

    expect(await locklift.provider.getBalance(marketplace.address).then(balance => Number(balance))).to.be.above(0);
    })

    it("mints an nft", async () => {
      const res = await collection.methods.mintNft({json: JSON.stringify({"name": "shravan"})}).send({
        from: someAccount.address,
        amount: toNano(0.5)
      })
    
      const {nft: nftAddress} = await collection.methods.nftAddress({ answerId: 0, id: 0 }).call();
      nft = await locklift.factory.getDeployedContract("Nft", nftAddress)
      
    })

    it("transfer nft to marketplace", async () => {

      await nft.methods.transfer({to: marketplace.address, sendGasTo: someAccount.address, callbacks: [[marketplace.address, {value: toNano(2), payload: ""}]]}).send({
        from: someAccount.address,
        amount: toNano(1)
      })

      const res = await marketplace.methods.getAllNFTs().call();
      console.log({res})

    })
  })
})