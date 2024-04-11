import dotenv from "dotenv";

dotenv.config();

interface Config {
  telegramBot: string;
  walletFilePassword: string;
  telegramChatIds: number[];
}

function validateEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`La variable de entorno ${name} no está seteada.`);
  }
  return value;
}

function loadConfig(): Config {
  return {
    telegramBot: validateEnvVariable("TELEGRAM_BOT"),
    walletFilePassword: validateEnvVariable("WALLET_PASSWORD"),

    telegramChatIds: [709820730],
  };
}

const config = loadConfig();

export default config;

export const wrapEgldContract = {
  "0": "erd1qqqqqqqqqqqqqpgqvc7gdl0p4s97guh498wgz75k8sav6sjfjlwqh679jy",
  "1": "erd1qqqqqqqqqqqqqpgqhe8t5jewej70zupmh44jurgn29psua5l2jps3ntjj3",
  "2": "erd1qqqqqqqqqqqqqpgqmuk0q2saj0mgutxm4teywre6dl8wqf58xamqdrukln",
};
