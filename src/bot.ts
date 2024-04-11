import BigNumber from "bignumber.js";
import TelegramBot from "node-telegram-bot-api";
import config from "./config";
import { buyToken, sellToken } from "./operations";
import {
  fetchTokenBalanceByAccount,
  fetchTransactionByHash,
  fetchXechangePair,
  retryAsyncFunction,
} from "./services/api";
import { walletAddress } from "./services/blochain-oprations";
import { formatTextTx } from "./utils";
require("dotenv").config();

export const bot = new TelegramBot(process.env.TELEGRAM_BOT!, {
  polling: true,
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, "Received your message");
});

const main = async ({
  lpAddress,
  buy,
  sell,
}: {
  lpAddress: string;
  buy?: {
    amount: number;
    price: number;
  };
  sell?: {
    amount: number;
    price: number;
  };
}) => {
  if (!lpAddress) {
    throw new Error("Please provide a Xechange liquidityPool address");
  }

  if (!buy && !sell) {
    throw new Error("You need to config bot to buy or sell");
  }

  if (buy && sell) {
    throw new Error("You can only buy or sell at a time");
  }

  let finish = false;

  while (!finish) {
    const pair = await retryAsyncFunction(fetchXechangePair, [lpAddress]);

    if (!pair) {
      throw new Error("This pool address is not valid");
    }

    console.log(`Pair: ${pair.firstToken.ticker}/${pair.secondToken.ticker}`);

    if (buy) {
      if (Number(pair.firstToken.price) <= buy.price) {
        console.log(
          `The bot will try to buy with ${buy.amount} ${pair.secondToken.ticker}`
        );

        let tokenBalance;
        try {
          tokenBalance = await retryAsyncFunction(fetchTokenBalanceByAccount, [
            pair.secondToken.identifier,
            walletAddress,
          ]);
        } catch (error) {}

        if (!tokenBalance) {
          console.error(
            `You don't have any ${pair.secondToken.ticker} token for buying`
          );
          return;
        }
        console.log(
          `Balance: ${new BigNumber(tokenBalance.balance)
            .div(10 ** tokenBalance.decimals)
            .toNumber()
            .toLocaleString()} ${tokenBalance.ticker}`
        );

        if (
          BigNumber(tokenBalance.balance).isLessThan(
            new BigNumber(buy.amount).times(10 ** pair.secondToken.decimals)
          )
        ) {
          console.error(
            `You don't have enough ${
              pair.secondToken.ticker
            } token for buying, required ${buy.amount} ${
              pair.secondToken.ticker
            } token and you have ${new BigNumber(
              tokenBalance.balance
            ).dividedBy(10 ** pair.firstToken.decimals)} ${
              pair.firstToken.ticker
            } token`
          );
          return;
        }

        console.log("executing transaction");

        const buyResult = await buyToken(pair, buy.amount);

        console.log("transaction success ");

        const tx = await fetchTransactionByHash(buyResult.hash);
        finish = true;
        if (tx) {
          const message = formatTextTx(tx);
          console.log(message);
        }
      }
    }

    if (sell) {
      console.log(
        `The bot will try to sell ${sell.amount} ${pair.firstToken.ticker}`
      );

      if (Number(pair.firstToken.price) >= sell.price) {
        const tokenBalance = await retryAsyncFunction(
          fetchTokenBalanceByAccount,
          [pair.firstToken.identifier, walletAddress]
        );

        if (!tokenBalance) {
          console.error(
            `You don't have any ${pair.firstToken.ticker} token for selling`
          );
          return;
        }
        console.log(
          `Balance: ${new BigNumber(tokenBalance.balance)
            .div(10 ** tokenBalance.decimals)
            .toNumber()
            .toLocaleString()} ${tokenBalance.ticker}`
        );

        if (
          BigNumber(tokenBalance.balance).isLessThan(
            new BigNumber(sell.amount).times(10 ** pair.firstToken.decimals)
          )
        ) {
          console.error(
            `You don't have enough ${
              pair.firstToken.ticker
            } token for selling, required ${sell.amount} ${
              pair.firstToken.ticker
            } token and you have ${new BigNumber(
              tokenBalance.balance
            ).dividedBy(10 ** pair.firstToken.decimals)} ${
              pair.firstToken.ticker
            } token`
          );
          return;
        }
        console.log("executing transaction");

        const sellResult = await sellToken(pair, sell.amount);
        console.log("transaction success");

        const tx = await fetchTransactionByHash(sellResult.hash);

        finish = true;
        if (tx) {
          const message = formatTextTx(tx);
          console.log(message);
          bot.sendMessage(config.telegramChatIds[0], message);
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  console.log("Operation finalized");
};

main({
  lpAddress: "erd1qqqqqqqqqqqqqpgqyx43t88dek9yr4889ykzx0wuz3kfwd4a2jps9xnxhm",

  buy: {
    amount: 0.0001,
    price: 0.000264,
  },
});
