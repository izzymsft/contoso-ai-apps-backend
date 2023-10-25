# Contoso AI Apps Backend Application
Contoso AI Apps


````bash

npm install -S @azure/search-documents@12.0.0-beta.3

npm install -g azure-functions-core-tools

func init --worker-runtime node --language typescript --model V4

func new --name azure-http-trigger --template "HTTP trigger"

func new --name openai-chatbot --template "HTTP trigger"

func new --name contoso-limos-chatbot-multi --template "HTTP trigger"

func new --name azure-cosmos-db-monitor --template "Azure Cosmos DB trigger"

func new --name azure-blob-store-monitor --template "Azure Blob Storage trigger"

func new --name contoso-travel-update-yacht --template "HTTP trigger"

func new --name contoso-travel-search-yachts --template "HTTP trigger"
````
