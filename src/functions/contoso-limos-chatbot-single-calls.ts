import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { ChatMessage, FunctionDefinition, GetChatCompletionsOptions } from '@azure/openai';
import { ChatMessageInput, ChatReply } from '../../shared/models/chat';
import { OpenAIUtils } from '../../shared/utils/openai-utils';
import { getFunctionDefinitions, getFunctionMap } from '../../shared/limo-reservations';

export async function contosoLimos(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestBody = (await request.json()) as ChatMessageInput;

  const { message } = requestBody;

  const openai = OpenAIUtils.getOpenAIClient();
  const deploymentName = process.env['OPENAI_MODEL_DEPLOYMENT'];

  const systemMessage: ChatMessage = {
    role: 'system',
    content:
      'You are smart assistant named Amina that helps customers to search for availability, make reservations and also cancel existing reservations for limousines. Always ask to confirm the details before making or cancelling a reservation. Please use the appropriate function to fetch the answers to the questions or take action.',
  };

  const userMessage: ChatMessage = {
    role: 'user',
    content: message,
  };

  const messages: ChatMessage[] = [systemMessage];
  messages.push(userMessage);

  const functionList = getFunctionDefinitions();
  const chatCompletionOptions: GetChatCompletionsOptions = { functions: functionList, functionCall: 'auto', temperature: 0 };

  const firstResponse = await openai.getChatCompletions(deploymentName, messages, chatCompletionOptions);

  const firstResponseMessage: ChatMessage = firstResponse.choices[0].message;

  const availableFunctions = getFunctionMap();

  if (firstResponseMessage.functionCall) {
    const functionName = firstResponseMessage.functionCall.name;
    const functionToCall = availableFunctions[functionName];
    const functionArgumentsString = firstResponseMessage.functionCall.arguments;
    const functionArgument = functionArgumentsString ? JSON.parse(functionArgumentsString) : null;

    const functionResponse = functionArgumentsString ? functionToCall(functionArgument) : functionToCall();

    const functionResponseString: string = JSON.stringify(functionResponse);

    console.log('Calling Function: ' + functionName);
    console.log('Function Arguments: ' + functionArgumentsString);
    console.log('Function Response: ' + functionResponse);

    // Adding function response to messages
    const firstResponseRole = firstResponseMessage.role;
    const firstResponseM1: ChatMessage = { role: firstResponseRole, functionCall: { name: functionName, arguments: functionArgumentsString }, content: '' };
    const firstResponseM2: ChatMessage = { role: 'function', name: functionName, content: functionResponseString };

    messages.push(firstResponseM1);
    messages.push(firstResponseM2);

    const secondResponse = await openai.getChatCompletions(deploymentName, messages, chatCompletionOptions);
    const reply = secondResponse.choices[0].message.content;

    const responseBody: ChatReply = { reply };

    //console.log(messages);
    console.log(JSON.stringify(secondResponse));

    return { jsonBody: responseBody };
  }

  const reply = firstResponseMessage.content;

  const responseBody: ChatReply = { reply };

  //console.log(messages);
  console.log(JSON.stringify(firstResponse));

  return { jsonBody: responseBody };
}

app.http('contoso-limos-chatbot', {
  methods: ['POST'],
  authLevel: 'function',
  handler: contosoLimos,
});
