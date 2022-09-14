import { InvokeCommand } from "@aws-sdk/client-lambda";

export async function invokeFunction(lambdaClient, functionName, payload) {
  const response = await lambdaClient.send(new InvokeCommand({
    Payload: payload,
    FunctionName: functionName
  }));

  return {
    functionError: response.FunctionError,
    payload: new TextDecoder().decode(response.Payload)
  }
}