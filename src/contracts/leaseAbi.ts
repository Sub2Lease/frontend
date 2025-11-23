export const leaseAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "tenant",
        type: "address",
      },
    ],
    name: "getLeasesByTennant",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "leaseId", type: "uint256" },
          { internalType: "address", name: "tennant", type: "address" },
          { internalType: "address", name: "subletter", type: "address" },

          { internalType: "uint256", name: "startDate", type: "uint256" },
          { internalType: "uint256[]", name: "paymentTimestamps", type: "uint256[]" },

          { internalType: "uint256", name: "monthlyRent", type: "uint256" },
          { internalType: "uint256", name: "rentAvailableToWithdraw", type: "uint256" },

          { internalType: "uint256", name: "securityDeposit", type: "uint256" },
          { internalType: "uint256", name: "depositHeld", type: "uint256" },

          { internalType: "bool", name: "isActive", type: "bool" },
        ],
        internalType: "struct LeaseContract.Lease[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const LEASE_CONTRACT = "0x6D44965c235e11b9D83393D2f5697fa8ca47e477";