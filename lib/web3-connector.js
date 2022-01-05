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

module.exports = {
  connect
}