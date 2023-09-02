import { expect } from "chai";
import { Contract,getRandomNonce,Address,WalletTypes, Signer, toNano } from "locklift";
import { FactorySource } from "../build/factorySource";
import { Account } from "everscale-standalone-client";
import { ContractData } from "locklift/internal/factory";
import { zeroAddress } from "locklift"; 
let marketplace: Contract<FactorySource["Marketplace"]>;
let collection: Contract<FactorySource["newCollection"]>;
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
    // const { contract: collectionContract, tx } = await locklift.factory.deployContract({
    //   contract: "newCollection",
    //   publicKey: signer.publicKey,
    //   initParams: {
    //     nonce_: locklift.utils.getRandomNonce(),
    //   },
    //   constructorParams: {
    //     codeIndex: indexArtifacts.code,
    //     codeIndexBasis: indexBasisArtifacts.code,
    //     codeNft: nftArtifacts.code,
    //     owner: someAccount.address,
    //     remainOnNft: locklift.utils.toNano(1),
    //     mintingFee: locklift.utils.toNano(1),
    //     json: "hello world",
    //   },
    
    //   value: locklift.utils.toNano(2),
    // });

    const collectionContract = await locklift.factory.getDeployedContract("CollectionDrop", new Address("0:b906abecb4001b2e5c941e104beb07a25ffe5c1dfcce033df270e053da4cc639"))

    collection = collectionContract;
  
    expect(await locklift.provider.getBalance(collection.address).then(balance => Number(balance))).to.be.above(0);
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
        sendRemainingGasTo: someAccount.address
      },
      value: toNano(1.5),
    });
    marketplace = marketplaceContract;

    expect(await locklift.provider.getBalance(marketplace.address).then(balance => Number(balance))).to.be.above(0);
    })

    it("mints an nft", async () => {
      const res = await collection.methods.mint({_json: JSON.stringify({"name": "shravan"})}).send({
        from: someAccount.address,
        amount: toNano(0.5)
      })
  
      const nft_add = await collection.methods.nftAddress({ answerId: 0, id: 0 }).call();
      // console.log(nft.nft._address)
      
      const nftContract = await locklift.factory.getDeployedContract("Nft", new Address( nft_add.nft._address))
      nft = nftContract
    })

    it("change nft manager", async () => {
      // console.log({marketplace_address: marketplace.address._address, sendGas: someAccount.address._address})
      nft.methods.changeManager({newManager: new Address( marketplace.address._address), sendGasTo: new Address(someAccount.address._address), callbacks: [[new Address(marketplace.address._address),  {value: toNano(2), payload: ""}]]}).send({from: someAccount.address, amount: toNano(3)})
      await nft.methods.changeManager({newManager: marketplace.address, sendGasTo: someAccount.address, callbacks: [[marketplace.address, {value: toNano(2), payload: ""}]]})

      const new_manager = await nft.methods.getInfo({answerId: 0}).call()
      console.log({new_manager})

      const res = await marketplace.methods.get_nftId({answerId: 0}).call();
      console.log({res})
    })
  })
})