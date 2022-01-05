const { connect } = require('../../lib/web3-connector');
const { seedHex, generateNewSeedHash } = require('../../lib/utils');
const RBPoolControllerABI = require('../../lib/contracts/RBPoolController.json').abi;

exports.rebaseCallerHandler = async (event, context) => {
  const { web3, deployer_address, deployer_key } = await connect(event.env);
  const { controllerAddress: contractAddress } = JSON.parse(event.MessageBody)
	const contract = new web3.eth.Contract(RBPoolControllerABI, contractAddress);

  if(!contractAddress || !deployer_address || !deployer_key || !web3 || !contract) {
    console.error('Missing info to continue');
    return;
  }
  
  // fetch seedKey
  const seedKey = seedHex(web3, 'something');
  
  // generate new seedKey and hash
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
    console.info('Error estimating gas');
    console.error(e);
    return;
  }

  const signedTx = await web3.eth.accounts.signTransaction(tx, deployer_key);

  try {
    const prom = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.info('tx hash:', prom.transactionHash);
  } catch (e) {
    console.error(e);
  }
}
