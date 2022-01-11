const RBPoolControllerABI = require('@splitbase-dev/contracts/deployments/mainnet/RBPoolController.json').abi;
const { connect, sendTx } = require('../lib/web3');

exports.transferLockerHandler = async (event, context) => {
  console.info('[TransferLocker][Start]');
  const { transferMethod, controllerAddress } = event;
  
  if(!controllerAddress || !transferMethod) {
    console.error('[TransferLocker] Message missing info');
    return;
  }

  const { web3, deployer_address, deployer_key } = await connect();
	const contract = new web3.eth.Contract(RBPoolControllerABI, controllerAddress);

  if(!deployer_address || !deployer_key || !web3 || !contract) {
    throw new Error('[TransferLocker] Error initializing info');
  }

  let data;
  switch(transferMethod) {
    case 'withdraw':
      data = contract.methods.setWithdrawLock(true).encodeABI();
      break;
    case 'deposit':
      data = contract.methods.setDepositLock(true).encodeABI();
      break;
    default:
      throw new Error(`Unknown transferMethod=${transferMethod}`);
  }

  await sendTx({
    from: deployer_address,
    to: controllerAddress,
    data
  }, web3, deployer_key);
  
  console.info(`[TransferLocker] completed lock transferMethod=${transferMethod} controllerAddress=${controllerAddress}`);
}