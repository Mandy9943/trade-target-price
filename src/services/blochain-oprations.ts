import { e, envChain, World } from "xsuite";

import BigNumber from "bignumber.js";
import config, { wrapEgldContract } from "../config";
import { ShardType } from "./types";

const world = World.new({
  chainId: envChain.id(),

  proxyUrl: "https://gateway.multiversx.com",
});

export const wallet = () =>
  world.newWalletFromFile_unsafe("wallet.json", config.walletFilePassword);
export const walletAddress = wallet().toString();

export const wrapEGLD = async (amount: number, shard: ShardType) => {
  const w = await wallet();
  const result = await w.callContract({
    callee: wrapEgldContract[shard],
    funcName: "wrapEgld",
    gasLimit: 5_000_000,
    value: amount,
  });

  console.log("WrapEGLD Transaction:", result.tx.explorerUrl);
};

export const tradeXexchangeToken = async ({
  tokenToPay,
  amountToPay,
  tokenToBuy,
  minAmountToBuy,
  scAddress,
}: {
  amountToPay: number;
  tokenToPay: string;
  tokenToBuy: string;
  minAmountToBuy: number;
  scAddress: string;
}) => {
  console.log({
    amountToPay: new BigNumber(amountToPay).div(10 ** 18).toString(),
    tokenToPay,
    tokenToBuy,
    minAmountToBuy,
    scAddress,
  });

  const w = await wallet();
  const result = await w.callContract({
    callee: scAddress,
    funcName: "swapTokensFixedInput",
    gasLimit: 20_000_000,
    esdts: [
      {
        amount: Math.floor(amountToPay),
        nonce: 0,
        id: tokenToPay,
      },
    ],
    funcArgs: [e.Str(tokenToBuy), e.U(minAmountToBuy)],
  });

  return result.tx;
};
