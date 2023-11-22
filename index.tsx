import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  http,
  Address,
  Hash,
  TransactionReceipt,
  createPublicClient,
  createWalletClient,
  custom,
  parseEther,
  stringify,
  toHex,
  formatEther,
} from "viem";
import { mainnet, goerli } from "viem/chains";
import contract from "./contract";
import { estimateCostFromSvg } from "./estimate.mjs";
import "viem/window";

const DEV = false;
const API_SERVER = DEV ? "http://localhost:8000" : "";

const publicClient = createPublicClient({
  chain: DEV ? goerli : mainnet,
  transport: http(),
});
const walletClient = createWalletClient({
  chain: DEV ? goerli : mainnet,
  transport: custom(window.ethereum!),
});

const estimateCost = async (setStateCallback, data) => {
  try {
    estimateCostFromSvg(data, { safe: false }).then((x) => {
      setStateCallback(x);
    });
  } catch (e) {}
};

const truncate = (x) => x.slice(0, 5) + "…" + x.slice(x.length - 4);

function Ethcreatures() {
  const [minting, setMinting] = useState<boolean>(false);
  const [item, setItem] = useState<any>({});
  const [account, setAccount] = useState<Address | null>();
  const [hash, setHash] = useState<Hash>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);

  // const addressInput = React.createRef<HTMLInputElement>();
  // const valueInput = React.createRef<HTMLInputElement>();
  const estimate = () =>
    estimateCost((x) => setEstimatedCost(x.cost), item.svg);

  useEffect(() => {
    if (mounted) return;

    setMounted(true);

    // initial
    estimate();

    handleReload();
    handleConnect();
  }, [mounted]);

  const handleReload = async () => {
    fetch(`${API_SERVER}/random?nomint=1&format=json`)
      .then((res) => res.json())
      .then(({ data }) => setItem(data))
      .then(() => estimate());
  };

  const handleConnect = async () => {
    const [address] = await walletClient.requestAddresses();
    setAccount(address);
  };

  const handleDisconnect = async () => {
    setAccount(null);
  };

  const handleMint = async () => {
    setMinting(true);
    sendTransaction();
    setMinting(false);

    // console.log(`data:image/svg+xml;base64,${btoa(item.svg)}`);
  };

  const PAUSE = true;
  const sendTransaction = async () => {
    // if (PAUSE) {
    //   alert(
    //     "Block 18140000 came and the mint has closed.\n\nWe will continue with a new contract and bigger mint window. The current supply is only 79 which is not enough for our plans."
    //   );
    //   return;
    // }
    if (!account) return;

    const token = await fetch(
      `${API_SERVER}/random?num=${item.index}&format=json`
    )
      .then((res) => res.json())
      .then((x) => x?.data);

    if (!token) {
      alert("something failed");
      return;
    }

    const { abi, address } = contract as { abi: any; address: Address };
    const hash = await walletClient.writeContract({
      abi,
      address,
      account,
      functionName: "ethscribe",
      args: [`data:image/svg+xml;base64,${btoa(token.svg)}`],
      value:
        account.toLowerCase() ===
        "0xA20C07F94A127fD76E61fbeA1019cCe759225002".toLowerCase()
          ? parseEther("0")
          : parseEther("0.001"),
    });

    setHash(hash);
  };

  useEffect(() => {
    (async () => {
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        setReceipt(receipt);
      }
    })();
  }, [hash]);

  const query = new URLSearchParams([
    DEV ? ["nomint", 1] : ["", ""],
    ["format", "svg"],
    item.index ? ["num", item.index] : ["_", ""],
  ]).toString();

  return (
    <Layout
      // src={`${API_SERVER}/random?nomint=1`}
      src={`${API_SERVER}/random?${query}`}
      handleConnect={handleConnect}
      handleReload={handleReload}
      account={account}
      hash={hash}
      receipt={receipt}
      estimatedCost={estimatedCost}
      data={item.svg}
    >
      <button
        disabled={minting}
        className="px-4 py-2.5 w-full bg-blue-500 text-white shadow-md font-bold cursor-pointer rounded-md text-2xl disabled:opacity-50"
        onClick={handleMint}
      >
        {minting ? "Minting..." : "Mint"}
      </button>
      <button
        className="px-4 py-2.5 w-full bg-red-500 text-white shadow-md font-bold cursor-pointer rounded-md text-2xl"
        onClick={handleDisconnect}
      >
        Disconnect
      </button>
      {/* </div> */}
    </Layout>
  );
}

function Layout({
  src,
  handleConnect,
  handleReload,
  account,
  children,
  hash,
  receipt,
  estimatedCost,
  data,
}) {
  const [cost, setCost] = useState<any>(estimatedCost);
  const estimate = () => estimateCost((x) => setCost(x.cost), data);

  return (
    <div className="border rounded-md shadow bg-white/50 p-5 mt-5">
      <h1 className="text-5xl font-extrabold underline">ESIP-3 Ethcreatures</h1>
      <nav>
        <ul className="flex gap-2 mt-4">
          <li>
            <a href="/genesis" className="text-blue-500">
              Genesis Collection
            </a>
          </li>
          <li>-</li>
          <li>
            <a
              href="https://twitter.com/wgw_eth/status/1702369958884159631"
              target="_blank"
              className="text-blue-500"
            >
              Twitter
            </a>
          </li>
          <li>-</li>
          <li>
            <a href="/auction" className="text-blue-500">
              Auction House (soon)
            </a>
          </li>
        </ul>
      </nav>
      <div className="mt-4 flex flex-col gap-4">
        <p>
          Genesis mint was from block 18135687 to 18140000. The new mint phase
          will begin at block 18144000 and will close at block 18160000.
        </p>
        <p>
          Thus, as an open edition, the mint will be open for the next ~53
          hours. After that we will build the rarity system and ranking scores.
        </p>
        <ul className="flex flex-col gap-2">
          <li>
            <strong>Genesis Contract:</strong>{" "}
            <a
              target="_blank"
              href="https://etherscan.io/address/0x963469bffce4534f1e7ed7217f7fb3740acb21d9"
              className="text-blue-500"
            >
              {truncate("0x963469bffce4534f1e7ed7217f7fb3740acb21d9")}
            </a>
          </li>
          <li>
            <strong>Minting Contract:</strong>{" "}
            <a
              target="_blank"
              href="https://etherscan.io/address/0x3eb668ddb91973b10dfc0428daae605f90193589"
              className="text-blue-500"
            >
              {truncate("0x3eb668ddb91973b10dfc0428daae605f90193589")}
            </a>
          </li>
          <li>
            <strong>Mint Price:</strong> 0.001 ETH (~$1.6) + gas
          </li>
          <li>
            <strong>Estimated Price:</strong> {(cost || estimatedCost).eth || 0}{" "}
            ETH or ~$
            {(cost || estimatedCost).usd || 0}{" "}
            <span className="italic ml-2">
              (
              <span
                className="text-blue-500 underline cursor-pointer"
                onClick={estimate}
              >
                refresh
              </span>
              )
            </span>
          </li>
        </ul>
      </div>
      <div id="foo" className="my-8 flex items-center justify-center">
        <img src={src} className="w-96 h-96" loading="lazy" />
      </div>
      <div className="flex flex-col items-center justify-center w-full">
        {hash && (
          <div className="flex items-center text-2xl gap-2 font-semibold my-4">
            {receipt && <div>Ethscribed</div>}
            {!receipt && <div>Ethscribing...</div>}
            <a
              target="_blank"
              href={`https://${
                DEV ? "goerli." : ""
              }etherscan.io/tx/${hash}#eventlog`}
              className="text-blue-500"
            >
              {hash.slice(0, 7)}&hellip;{hash.slice(hash.length - 7)}
            </a>
          </div>
        )}
        <div className="flex flex-col w-full items-center sm:flex sm:flex-row gap-4">
          <button
            className="px-4 py-2.5 w-full bg-orange-500 text-white shadow-md font-bold cursor-pointer rounded-md text-2xl"
            onClick={handleReload}
          >
            Randomize
          </button>

          {account && children}

          {!account && (
            <>
              <button
                className="px-4 py-2.5 w-full bg-green-500 text-white shadow-md font-bold cursor-pointer rounded-md text-2xl"
                onClick={handleConnect}
              >
                Connect Wallet
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Ethcreatures />
);
