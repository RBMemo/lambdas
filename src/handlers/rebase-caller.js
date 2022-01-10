const { connect } = require('../../lib/web3-connector');
const { seedHex, generateNewSeedHash } = require('../../lib/utils');
const RBPoolControllerABI = require('@splitbase-dev/contracts/deployments/mainnet/RBPoolController.json').abi;
const { fetchSeedKey, updateSeedKey } = require('../../lib/db');

exports.rebaseCallerHandler = async (event, context) => {
  console.info('[RebaseCaller][Start]')
  const { web3, deployer_address, deployer_key } = await connect(event.env);
  const messageBody = event.Records[0].body;
  console.info(`[RebaseCaller] processing messageBody=${messageBody}`);
  const { controllerAddress: contractAddress } = JSON.parse(messageBody);
	const contract = new web3.eth.Contract(RBPoolControllerABI, contractAddress);

  if(!contractAddress) {
    console.error('[RebaseCaller] Message missing info');
    return;
  }

  if(!deployer_address || !deployer_key || !web3 || !contract) {
    throw new Error('[RebaseCaller] Error initializing info');
  }
  
  const seedKey = seedHex(web3, await fetchSeedKey(contractAddress));  
  const { newSeedKey, newSeedHash } = generateNewSeedHash(web3, deployer_address);

  let tx = {
    from: deployer_address,
    to: contractAddress,
    nonce: await web3.eth.getTransactionCount(deployer_address, "latest"), // get latest nonce,
    data: contract.methods.rebase(seedKey, newSeedHash).encodeABI()
  }

  try {
    tx['gas'] = `0x${(await web3.eth.estimateGas(tx)).toString(16)}`
  } catch (e) {
    console.info('[RebaseCaller] Error estimating gas');
    throw e;
  }

  const signedTx = await web3.eth.accounts.signTransaction(tx, deployer_key);

  try {
    const prom = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.info('[RebaseCaller][Success] tx hash:', prom.transactionHash);
  } catch (e) {
    console.info('[RebaseCaller] Error sending tx');
    throw e;
  }

  await updateSeedKey(contractAddress, newSeedKey);
}
