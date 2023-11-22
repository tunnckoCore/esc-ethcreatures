export const DEV = false;
export const API_SERVER = DEV ? "http://localhost:8000" : "";

export const PROJECT_OWNER_ADDRESS = `0xA20C07F94A127fD76E61fbeA1019cCe759225002`;
export const MINT_CONTRACT = "0x0000";
export const MINT_PRICE = "0.001";
export const TITLE = "Eths Minting";
export const PAUSE = true;
export const PAUSE_MSG = "Minting is paused.";

export const LINKS = [
  {
    name: "Collection",
    href: "/genesis",
  },
  {
    name: "Twitter",
    href: "https://twitter.com/wgw_eth/status/1702369958884159631",
    target: "_blank",
  },
  {
    name: "Auction House (soon)",
    href: "/auction",
  },
];

export const PARAGRAPH_TEXT = `Genesis mint was from block 18135687 to 18140000. The new mint phase
will begin at block 18144000 and will close at block 18160000.`;
