import { InvokeCommand, GetFunctionCommand, ResourceNotFoundException } from "@aws-sdk/client-lambda";

export async function invokeFunction(lambdaClient, functionName, payload) {
  const response = await lambdaClient.send(
    new InvokeCommand({
      Payload: payload,
      FunctionName: functionName,
    })
  );

  return {
    functionError: response.FunctionError,
    payload: new TextDecoder().decode(response.Payload),
  };
}

export async function isExistingFunction(lambdaClient, functionName) {
  try {
    await lambdaClient.send(
      new GetFunctionCommand({
        FunctionName: functionName,
      })
    );
    return true;
  } catch (err) {
    if (err instanceof ResourceNotFoundException) {
      return false;
    } else {
      throw err;
    }
  }
}
