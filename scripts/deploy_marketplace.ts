import fs from "fs";
import prompts from "prompts";
import { Migration } from "./migration";
import { Address, toNano } from "locklift";

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
    contract: "Marketplace",
    publicKey: signer.publicKey,
    initParams: {
      _nonce: locklift.utils.getRandomNonce(),
    },
    constructorParams: {
        sendRemainingGasTo: new Address("0:bf6adad7315850d05e010c55ea46f84e0aecfb4788783a31fc0694a7a6436883"),
        sale_cost: toNano(1),
        listing_cost: toNano(1)
    },
    value: locklift.utils.toNano(2),
  });

  // migration.store(collection, "Collection");
  console.log(`Markeptlace deployed at: ${collection.address.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
