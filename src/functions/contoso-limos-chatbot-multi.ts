import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { ChatMessageInput, ChatReply } from '../../shared/models/chat';
import { OpenAIUtils } from '../../shared/utils/openai-utils';
import { ChatMessage, GetChatCompletionsOptions } from '@azure/openai';
import { getFunctionDefinitions, getFunctionMap } from '../../shared/limo-reservations';

export async function contosoLimosMultiple(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestBody = (await request.json()) as ChatMessageInput;

  const { message } = requestBody;

  const openai = OpenAIUtils.getOpenAIClient();
  const deploymentName = process.env['OPENAI_MODEL_DEPLOYMENT'];

  const customerName: string = 'David Santos';
  const customerEmail: string = 'david.santos@contoso.com';
  const travelPartySize: number = 15;

  let systemPrompt: string = `
Context:
This is what we know about the customer interacting with the smart assistant:
- Customer Name: ${customerName}
- Customer Email: ${customerEmail}
- Number of Passengers in the Travel Party: ${travelPartySize}

Instructions:
- You are smart assistant named Amina Bond and you helps customers to the perform the following tasks:
- You should always introduce yourself and greet the customer by name before asking them how you can help them today.
- You should always ask the user if they are sure they want to make the reservation and get a confirmation before making or cancelling a reservation.
- You should only check if the total number of passengers for the reservation is equal to or less than the maximum number of passengers allowed for that date before making a reservation.
- You should only make the reservations if the available balance in the customer's bank account is greater than or equal to total cost of the limousine reservation.
- You should always include the final account balance from the customer's bank account after all the tasks a completed.
- You should always provide a summary of all the tasks there were completed successfully.

After completing the task or tasks, please display the following information:
- all the reservations that were made
- all the reservations that were cancelled, if applicable
- the final account balance from the customer's bank account
`;

  systemPrompt = 'You are an AI assistant name Elena. You help customers make limousine reservations. Before making any reservations, please check the bank account balance of the customer. ';
  systemPrompt += 'The customer name is Satya Blanco. His email address is sblanco@contoso.ai ';
  systemPrompt +=
    'Before making any reservation, please calculate the total cost of the reservation and only make the reservation if the bank account balance is greater than the total cost of the reservation. ';

  systemPrompt +=
    'Display all the tasks completed for the customer by the AI assistant as well as the total cost of all transactions and the remaining bank account balance at the end of the conversation.';

  const systemMessage: ChatMessage = {
    role: 'system',
    content: systemPrompt.trim(),
  };

  const userMessage: ChatMessage = {
    role: 'user',
    content: message,
  };

  const messages: ChatMessage[] = [systemMessage];
  messages.push(userMessage);

  const functionList = getFunctionDefinitions();
  const chatCompletionOptions: GetChatCompletionsOptions = { functions: functionList, functionCall: 'auto', temperature: 0 };

  const initialResponse = await openai.getChatCompletions(deploymentName, messages, chatCompletionOptions);

  const availableFunctions = getFunctionMap();

  let currentResponse = initialResponse;
  let currentResponseMessage = currentResponse.choices[0].message;
  let makeFunctionCall: boolean = currentResponseMessage.functionCall ? true : false;

  while (makeFunctionCall) {
    const currentFunctionName = currentResponseMessage.functionCall.name;
    const functionToCall = availableFunctions[currentFunctionName];
    const functionArgumentsString = currentResponseMessage.functionCall.arguments;
    const functionArgument = functionArgumentsString ? JSON.parse(functionArgumentsString) : null;

    const functionResponse = functionArgumentsString ? functionToCall(functionArgument) : functionToCall();

    const functionResponseString: string = JSON.stringify(functionResponse);

    console.log('Calling Function: ' + currentFunctionName);
    console.log('Function Arguments: ' + functionArgumentsString);
    console.log('Function Response: ' + functionResponse);

    // Add the message to the array of messages
    messages.push(currentResponseMessage);

    // Adding function response to messages
    const currentResponseRole = currentResponseMessage.role;
    const m1: ChatMessage = { role: currentResponseRole, functionCall: { name: currentFunctionName, arguments: functionArgumentsString }, content: '' };
    const m2: ChatMessage = { role: 'function', name: currentFunctionName, content: functionResponseString };

    messages.push(m1);
    messages.push(m2);

    currentResponse = await openai.getChatCompletions(deploymentName, messages, chatCompletionOptions);

    currentResponseMessage = currentResponse.choices[0].message;
    makeFunctionCall = currentResponseMessage.functionCall ? true : false;
  }

  const reply = currentResponseMessage.content;
  const responseBody: ChatReply = { reply };

  console.log(messages);
  console.log(JSON.stringify(currentResponse));

  return { jsonBody: responseBody };
}

app.http('contoso-limos-chat-bot-multi', {
  methods: ['POST'],
  authLevel: 'function',
  handler: contosoLimosMultiple,
});
