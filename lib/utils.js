const { v4: uuidv4 } = require('uuid');

function seedHash(web3, seedKey, address) {  
  const { utils, eth } = web3;

  let seedHex = utils.padLeft(utils.toHex(seedKey), 64);
  let encoded = eth.abi.encodeParameters(['address', 'bytes32'], [address, seedHex]);
  return utils.sha3(encoded);
}

function seedHex(web3, seedKey) {
  const { utils } = web3;

  return utils.padLeft(utils.toHex(seedKey), 64);
}

function generateNewSeedHash(web3, address) {
  const newSeedKey = uuidv4().slice(0,23);

  return {
    newSeedKey,
    newSeedHash: seedHash(web3, newSeedKey, address)
  };
}

module.exports = {
  seedHash,
  seedHex,
  generateNewSeedHash
}
