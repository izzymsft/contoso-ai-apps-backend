import { app, InvocationContext } from '@azure/functions';

export async function azureBlobStoreMonitor(blob: Buffer, context: InvocationContext): Promise<void> {
  context.log(`Storage blob function processed blob "${context.triggerMetadata.name}" with size ${blob.length} bytes`);
}

app.storageBlob('azure-blob-store-monitor', {
  path: 'samples-workitems/{name}',
  connection: '',
  handler: azureBlobStoreMonitor,
});
