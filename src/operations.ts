import BigNumber from "bignumber.js";
import { retryAsyncFunction } from "./services/api";
import { tradeXexchangeToken } from "./services/blochain-oprations";
import { IPair } from "./types";

export const buyToken = async (pair: IPair, amount: number) => {
  const amountToPay = new BigNumber(amount).times(
    10 ** pair.secondToken.decimals
  );

  const txResult = await retryAsyncFunction(
    tradeXexchangeToken,
    [
      {
        // fix amount to pay
        amountToPay: amountToPay.toNumber(),
        tokenToPay: pair.secondToken.identifier,
        tokenToBuy: pair.firstToken.identifier,
        minAmountToBuy: new BigNumber(1).toNumber(),
        scAddress: pair.address,
      },
    ],
    5
  );

  console.log(`Compra efectuada`);
  return txResult;
};
export const sellToken = async (pair: IPair, amount: number) => {
  // Lógica para vender el token

  const amountToPay = new BigNumber(amount).times(
    10 ** pair.firstToken.decimals
  );

  const txResult = await retryAsyncFunction(
    tradeXexchangeToken,
    [
      {
        amountToPay: amountToPay.toNumber(),
        tokenToPay: pair.firstToken.identifier,
        tokenToBuy: pair.secondToken.identifier,
        minAmountToBuy: new BigNumber(1).toNumber(),
        scAddress: pair.address,
      },
    ],
    10
  );

  console.log(`Venta efectuada`);
  return txResult;
};
