import { LockliftConfig } from "locklift";
import { FactorySource } from "./build/factorySource";

declare global {
  const locklift: import("locklift").Locklift<FactorySource>;
}

// For Devnet
const VENOM_DEVNET_ENDPOINT = process.env.VENOM_DEVNET_ENDPOINT || "https://jrpc-devnet.venom.foundation/rpc";
const VENOM_DEVNET_TRACE_ENDPOINT =
  process.env.VENOM_DEVNET_TRACE_ENDPOINT || "https://gql-devnet.venom.foundation/graphql";

// For Testnet
const VENOM_TESTNET_ENDPOINT = " https://jrpc-testnet.venom.foundation/rpc";
// const VENOM_TESTNET_ENDPOINT = process.env.VENOM_TESTNET_ENDPOINT || "https://jrpc-devnet.venom.foundation/rpc";
const VENOM_TESTNET_TRACE_ENDPOINT =
  process.env.VENOM_TESTNET_TRACE_ENDPOINT || "https://gql-devnet.venom.foundation/graphql";

const PHRASE: string | undefined = process.env.VENOM_WALLET_PHRASE || "";
const VERIFY_SECRET_KEY = process.env.VENOM_VERIFY_SECRET_KEY || "";
const VERIFY_API_KEY = process.env.VENOM_VERIFY_API_KEY || "";

const config: LockliftConfig = {
  compiler: {
    version: "0.61.2",

    externalContracts: {
      // TIP3 Standard
      "./indexes": ['Index', 'IndexBasis'],
      "node_modules/@broxus/tip3/build": ["TokenRoot", "TokenWallet"],
    },
  },
  linker: {
    version: "0.15.48",
  },
  networks: {
    venom_devnet: {
      connection: {
        id: 1000,
        type: "jrpc",
        group: "dev",
        data: {
          endpoint: VENOM_TESTNET_ENDPOINT,
        },
      },
      giver: {
        address: "address",
        phrase: "phrase",
        accountId: 0,
      },
      tracing: {
        endpoint: VENOM_TESTNET_TRACE_ENDPOINT,
      },
      keys: {
        // phrase: "action inject penalty envelope rabbit element slim tornado dinner pizza off blood",
        amount: 20,
      },
    },
    venom_testnet: {
      connection: {
        id: 1000,
        type: "jrpc",
        group: "dev",
        data: {
          endpoint: " https://jrpc-testnet.venom.foundation/rpc",
        },
      },
      giver: {
        address: "0:bf6adad7315850d05e010c55ea46f84e0aecfb4788783a31fc0694a7a6436883", // Your wallet address which phrase mention below
        phrase: "flame correct inner pair cube stadium tiny hope rebel erupt arena media", // Your wallet phrase
        accountId: 0,
      },
      tracing: {
        endpoint: " https://jrpc-testnet.venom.foundation/rpc",
      },
      keys: {
        // phrase: "action inject penalty envelope rabbit element slim tornado dinner pizza off blood",
        amount: 20,
      },
    },
  },
  mocha: {
    timeout: 2000000,
  },

  
};

export default config;
