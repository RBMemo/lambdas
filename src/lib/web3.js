const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const Web3 = require('web3');
const client = new SecretsManagerClient({ region: 'us-west-2' });

const SECRET_ID = 'avaxConnection';
const AVAX_URL = 'https://api.avax.network/ext/bc/C/rpc';

async function connect() {
  const getSecrets = new GetSecretValueCommand({ SecretId: SECRET_ID });
  const { deployer_key } = JSON.parse((await client.send(getSecrets)).SecretString);
  const web3 = new Web3(AVAX_URL);
  const { address: deployer_address } = web3.eth.accounts.privateKeyToAccount(deployer_key);

  return { web3, deployer_address, deployer_key };
}

async function sendTx(params, web3, privateKey) {
  let tx = {
    ...params,
    nonce: await web3.eth.getTransactionCount(params.from, "latest"), // get latest nonce,
  }

  try {
    tx['gas'] = `0x${(await web3.eth.estimateGas(tx)).toString(16)}`
  } catch (e) {
    console.info('[web3] Error estimating gas');
    throw e;
  }

  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

  try {
    const prom = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.info('[web3][Success] tx hash:', prom.transactionHash);
  } catch (e) {
    console.info('[web3] Error sending tx');
    throw e;
  }

  return true;
}

module.exports = {
  connect,
  sendTx
}