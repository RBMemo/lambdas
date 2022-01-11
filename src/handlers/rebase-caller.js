const { connect, sendTx } = require('../lib/web3');
const { seedHex, generateNewSeedHash } = require('../lib/utils');
const RBPoolControllerABI = require('@splitbase-dev/contracts/deployments/mainnet/RBPoolController.json').abi;
const { fetchSeedKey, updateSeedKey } = require('../lib/db');

exports.rebaseCallerHandler = async (event, context) => {
  console.info('[RebaseCaller][Start]')
  const { web3, deployer_address, deployer_key } = await connect();
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

  await sendTx({
    from: deployer_address,
    to: contractAddress,
    data: contract.methods.rebase(seedKey, newSeedHash).encodeABI()
  }, web3, deployer_key);

  await updateSeedKey(contractAddress, newSeedKey);
}
