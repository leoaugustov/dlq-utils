import { InvokeCommand } from "@aws-sdk/client-lambda";

export async function invokeFunction(lambdaClient, functionName, payload) {
  const response = await lambdaClient.send(new InvokeCommand({
    Payload: payload,
    FunctionName: functionName
  }));

  return {
    statusCode: response.StatusCode,
    functionError: response.FunctionError,
    payload: response.Payload
  }
}