import { app, InvocationContext } from '@azure/functions';

export async function azureCosmosDBMonitor(documents: unknown[], context: InvocationContext): Promise<void> {
  context.log(`Cosmos DB function processed ${documents.length} documents`);
}

app.cosmosDB('azure-cosmos-db-monitor', {
  connectionStringSetting: '',
  databaseName: '',
  collectionName: '',
  createLeaseCollectionIfNotExists: true,
  handler: azureCosmosDBMonitor,
});
