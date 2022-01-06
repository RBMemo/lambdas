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
  return Item.seed_key.S;
}

async function updateSeedKey(address, newSeedKey) {
  const putItem = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      controller_address: { S: address },
      seed_key: { S: 'test' }
    }
  });

  await client.send(putItem);
}

module.exports = {
  fetchSeedKey,
  updateSeedKey
}
