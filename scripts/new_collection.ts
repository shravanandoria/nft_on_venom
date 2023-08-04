import { Address, toNano } from "locklift";
import { getRandomNonce } from "locklift";
async function main() {
  const signer = (await locklift.keystore.getSigner("0"))!;
  const nftArtifacts = await locklift.factory.getContractArtifacts("Nft");
  const indexArtifacts = await locklift.factory.getContractArtifacts("Index");
  const indexBasisArtifacts = await locklift.factory.getContractArtifacts("IndexBasis");
  const { contract: sample, tx } = await locklift.factory.deployContract({
    contract: "newCollection",
    publicKey: signer.publicKey,
    nounce_: getRandomNonce(),
    initParams: {},
    constructorParams: {
        codeNft: nftArtifacts.code,
        codeIndex: indexArtifacts.code,
        codeIndexBasis: indexBasisArtifacts.code,
        owner: new Address("0:bf6adad7315850d05e010c55ea46f84e0aecfb4788783a31fc0694a7a6436883"),
        remainOnNft: toNano(0.3),        
        mintingFee: toNano(0.1),
        json: `{
          "type": "Venom Testnet",
          "name": "Venomart Marketplace",
          "description": "Venomart is the first fully-fledged NFT Marketplace on Venom. Get quick and easy access to digital collectibles and explore, buy and sell NFTs",
          "preview": {
            "source": "https://ipfs.io/ipfs/QmNvhA6rXAMe6cPWW4qx7RNRfAK4LGaYcSeBL5szKEJRvW/deflogo.png",
            "mimetype": "image/png"
          },
          "files": [
            {
              "source": "https://ipfs.io/ipfs/QmNvhA6rXAMe6cPWW4qx7RNRfAK4LGaYcSeBL5szKEJRvW/deflogo.png",
              "mimetype": "image/png"
            }
          ],
          "external_url": "https://venomart.space"
        }` // EXAMPLE...not by TIP-4.2
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
