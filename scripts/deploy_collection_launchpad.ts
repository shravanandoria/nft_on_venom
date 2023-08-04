import { toNano } from "locklift";

async function main() {
    const signer = (await locklift.keystore.getSigner("0"))!;
    const nftArtifacts = await locklift.factory.getContractArtifacts("Nft");
    const indexArtifacts = await locklift.factory.getContractArtifacts("Index");
    const indexBasisArtifacts = await locklift.factory.getContractArtifacts("IndexBasis");
    const { contract: sample, tx } = await locklift.factory.deployContract({
      contract: "launchpad_collection",
      publicKey: signer.publicKey,
      initParams: {},
      constructorParams: {
          codeNft: nftArtifacts.code,
          json: `{
            "type": "Venom Network | Testnet",
            "name": "Venomart Passes",
            "description": "Exclusive Passes On Venomart Marketplace",
            "preview": {
              "source": "https://ipfs.io/ipfs/QmNRgw61q81mUb2dRarA6NBFqdE3E9rsYYhRWfdfgcPMnL/earlypass.gif",
              "mimetype": "image/gif"
            },
            "files": [
              {
                "source": "https://ipfs.io/ipfs/QmNRgw61q81mUb2dRarA6NBFqdE3E9rsYYhRWfdfgcPMnL/earlypass.gif",
                "mimetype": "image/gif"
              }
            ],
            "external_url": "https://venomart.space"
          }`, // EXAMPLE...not by TIP-4.2
          codeIndex: indexArtifacts.code,
          codeIndexBasis: indexBasisArtifacts.code,
          _minting_fees: toNano(0.1),
          _owner: "0:bf6adad7315850d05e010c55ea46f84e0aecfb4788783a31fc0694a7a6436883"
      },
      value: locklift.utils.toNano(1),
    });
  
    console.log(`Collection deployed at: ${sample.address.toString()}`);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(e => {
      console.log(e);
      process.exit(1);
    });
  