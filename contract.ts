export default {
  address: "0x3eb668ddb91973b10dfc0428daae605f90193589",

  abi: [
    { inputs: [], name: "MintClosed", type: "error" },
    { inputs: [], name: "MintNotOpened", type: "error" },
    { inputs: [], name: "NotDeployer", type: "error" },
    { inputs: [], name: "NotEnoughEther", type: "error" },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "initialOwner",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "contentURI",
          type: "string",
        },
      ],
      name: "ethscriptions_protocol_CreateEthscription",
      type: "event",
    },
    {
      inputs: [{ internalType: "string", name: "dataURI", type: "string" }],
      name: "ethscribe",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "mintCloseBlock",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "mintOpenBlock",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "projectCreator",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "address", name: "to", type: "address" },
      ],
      name: "withdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ] as const,
};
