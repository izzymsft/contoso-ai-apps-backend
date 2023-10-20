import { AzureKeyCredential } from '@azure/core-auth';
import { SearchClient } from '@azure/search-documents';
import { YachtWithEmbeddings } from '../models/yachts';

export class AzureCognitiveSearchUtil<T extends object> {
  private readonly client: SearchClient<T>;
  public constructor(index: string) {
    const azureSearchKey = process.env['AZURE_SEARCH_KEY'];
    const endpoint = process.env['AZURE_SEARCH_ENDPOINT'];
    const credential = new AzureKeyCredential(azureSearchKey);

    this.client = new SearchClient<T>(endpoint, index, credential);
  }

  public async mergeOrUploadDocument(documentsToUpload: T[]) {
    const result = await this.client.mergeOrUploadDocuments(documentsToUpload);
    return result;
  }

  public async vectorSearch(query: string, queryVector: number[], vectorFieldName: string) {}
}
