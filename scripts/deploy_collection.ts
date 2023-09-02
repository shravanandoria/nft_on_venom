import fs from "fs";
import prompts from "prompts";
import { Migration } from "./migration";
import { Address } from "locklift";

const migration = new Migration();

export type AddressN = `0:${string}`;
export const isValidAddress = (address: string): address is AddressN => /^(?:-1|0):[0-9a-fA-F]{64}$/.test(address);

async function main() {
  const Nft = await locklift.factory.getContractArtifacts("Nft");
  const Index = await locklift.factory.getContractArtifacts("Index");
  const IndexBasis = await locklift.factory.getContractArtifacts("IndexBasis");
  const signer = (await locklift.keystore.getSigner("0"))!;
  // const account = await migration.loadAccount("Account1");

  // const defaultMetadata = fs.readFileSync("collection-metadata.json", "utf8");


  console.log("Deploying collection...");
  
  const { contract: collection, tx } = await locklift.factory.deployContract({
    contract: "CollectionDrop",
    publicKey: signer.publicKey,
    initParams: {
      nonce_: locklift.utils.getRandomNonce(),
    },
    constructorParams: {
      codeIndex: Index.code,
      codeIndexBasis: IndexBasis.code,
      codeNft: Nft.code,
      owner: new Address("0:bf6adad7315850d05e010c55ea46f84e0aecfb4788783a31fc0694a7a6436883"),
      remainOnNft: locklift.utils.toNano(0.3),
      mintingFee: locklift.utils.toNano(1),
      json:`{
        "type": "Venom Testnet",
        "name": "Shravan test",
        "description": "Voracious alligators getting set to defend their swamp on the Venom Blockchain",
        "preview": {
          "source": "https://media.istockphoto.com/id/1146517111/photo/taj-mahal-mausoleum-in-agra.jpg?s=612x612&w=0&k=20&c=vcIjhwUrNyjoKbGbAQ5sOcEzDUgOfCsm9ySmJ8gNeRk=",
          "mimetype": "image/jpg"
        },
        "files": [
          {
            "source": "https://media.istockphoto.com/id/1146517111/photo/taj-mahal-mausoleum-in-agra.jpg?s=612x612&w=0&k=20&c=vcIjhwUrNyjoKbGbAQ5sOcEzDUgOfCsm9ySmJ8gNeRk=",
            "mimetype": "image/jpg"
          }
        ],
        "external_url": "https://venomart.space"
      }`,
    },
    value: locklift.utils.toNano(3),
  });

  // migration.store(collection, "Collection");
  console.log(`Collection deployed at: ${collection.address.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
