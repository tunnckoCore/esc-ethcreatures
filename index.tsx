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
import {
  TITLE,
  LINKS,
  DEV,
  API_SERVER,
  PARAGRAPH_TEXT,
  MINT_PRICE,
  PROJECT_OWNER_ADDRESS,
  MINT_CONTRACT,
  PAUSE,
  PAUSE_MSG,
} from "./config.mjs";

import "viem/window";

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

function App() {
  const [minting, setMinting] = useState<boolean>(false);
  const [item, setItem] = useState<any>({});
  const [account, setAccount] = useState<Address | null>();
  const [hash, setHash] = useState<Hash>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);

  // const estimate = () =>
  //   estimateCost((x) => setEstimatedCost(x.cost), item.content_uri);

  useEffect(() => {
    if (mounted) return;

    setMounted(true);

    // initial
    // estimate();

    // handleReload();
    handleConnect();
  }, [mounted]);

  const handleReload = async () => {
    fetch(`${API_SERVER}/random?nomint=1&format=json`)
      .then((res) => res.json())
      .then(({ data }) => {
        if (data) {
          setItem(data);
          console.log("ZZZZZZ");
          return true;
        }

        return false;
      });
    // .then((x) => (x ? estimate() : null));
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

  const sendTransaction = async () => {
    if (PAUSE) {
      alert(PAUSE_MSG);
      return;
    }
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
      args: [token.content_uri],
      value:
        account.toLowerCase() === PROJECT_OWNER_ADDRESS.toLowerCase()
          ? parseEther("0")
          : parseEther(String(MINT_PRICE)),
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
      data={item.content_uri}
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
  const [gasPrice, setGasPrice] = useState<any>(0);
  const [cost, setCost] = useState<any>(estimatedCost);
  const estimate = () =>
    estimateCost((x) => {
      setCost(x.cost);
      setGasPrice(x.gasPrice);
    }, data);

  return (
    <div className="border rounded-md shadow bg-white/50 p-5 mt-5">
      <h1 className="text-5xl font-extrabold underline">{TITLE}</h1>
      <nav>
        <ul className="flex gap-2 mt-4">
          {LINKS.map((x, idx) => {
            const lastItem = idx === LINKS.length - 1;

            return (
              <>
                <li key={idx}>
                  <a
                    {...x}
                    href={x.href}
                    className={x.className || "text-blue-500"}
                  >
                    {x.name}
                  </a>
                </li>
                {lastItem ? null : <li>-</li>}
              </>
            );
          })}
          {/* <li>
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
          </li> */}
        </ul>
      </nav>
      <div className="mt-4 flex flex-col gap-4">
        <p>{PARAGRAPH_TEXT}</p>
        {/* <p>
          Thus, as an open edition, the mint will be open for the next ~53
          hours. After that we will build the rarity system and ranking scores.
        </p> */}
        <ul className="flex flex-col gap-2">
          {/* <li>
            <strong>Genesis Contract:</strong>{" "}
            <a
              target="_blank"
              href="https://etherscan.io/address/0x963469bffce4534f1e7ed7217f7fb3740acb21d9"
              className="text-blue-500"
            >
              {truncate("0x963469bffce4534f1e7ed7217f7fb3740acb21d9")}
            </a>
          </li> */}
          <li>
            <strong>Minting Contract:</strong>{" "}
            <a
              target="_blank"
              href={
                `https://${DEV ? "goerli." : ""}etherscan.io/address/` +
                MINT_CONTRACT
              }
              className="text-blue-500"
            >
              {truncate(MINT_CONTRACT)}
            </a>
          </li>
          <li>
            <strong>Mint Price:</strong> {MINT_PRICE} ETH + gas fee{" "}
            <span className="italic">(at {gasPrice} Gwei)</span>
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
  <App />
);
