# Splitbase Lambdas
## RebaseCaller
This Lambda is triggered by an SQS queue message containing the controller's address which it will need to invoke a rebase on.

It follows this process:
1. Fetch current seedKey from Dynamo
2. Generate newSeedKey
3. Call rebase on PoolController with current and new seedKeys
4. Update current seedKey to new seedKey in Dynamo

## TransferLocker
This Lambda is triggered by scheduled events containing the the type of lock (withdraw or deposit) and the PoolController's address. The Lambda will simply initiate a transaction calling the corresponding lock method on the PoolController.
