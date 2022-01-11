const { DynamoDBClient, GetItemCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const client = new DynamoDBClient({ region: 'us-west-2' });

const TABLE_NAME = 'rebase_seed_keys';

async function fetchSeedKey(address) {
  const getItem = new GetItemCommand({
    TableName: TABLE_NAME,
    Key: {
      controller_address: { S: address }
    }
  });

  const { Item } = await client.send(getItem);
  try {
    return Item.seed_key.S;
  } catch(e) {
    console.error(e);
    return 'initial$33d'; // likely does not exist yet
  }
}

async function updateSeedKey(address, newSeedKey) {
  const putItem = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      controller_address: { S: address },
      seed_key: { S: newSeedKey }
    }
  });

  try {
    await client.send(putItem);
  } catch(e) {
    console.error(e);
    console.info(`[RebaseCaller] Error updating seed newKey=${newSeedKey}`);
  }
}

module.exports = {
  fetchSeedKey,
  updateSeedKey
}
