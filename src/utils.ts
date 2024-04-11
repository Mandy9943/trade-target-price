import BigNumber from "bignumber.js";
import { ITransacation } from "./services/types";

export const formatTextTx = (tx: ITransacation): string => {
  const firstToken = tx.operations[0];
  const secondToken = tx.operations[1];

  const amountSent = new BigNumber(firstToken.value).div(
    10 ** firstToken.decimals
  );

  const amountReceived = new BigNumber(secondToken.value).div(
    10 ** secondToken.decimals
  );

  const text = `You sent ${amountSent.toNumber()} ${
    firstToken.ticker
  } and received ${amountReceived.toNumber()} ${secondToken.ticker}`;
  return text;
};
