import { invokeFunction } from '../src/lambda';

function createLambdaClient() {
  return  { send: jest.fn() };
}

describe('invokeFunction', () => {
  it('should build command correctly, call client and return response data', async () => {
    const lambdaClient = createLambdaClient();
    const functionName = 'lambda-function-name';
    const inputPayload = 'payload';
    const outputPayload = 'Returned payload';
    const commandOutput = {
      FunctionError: 'Error message',
      Payload: new TextEncoder().encode(outputPayload)
    };

    lambdaClient.send.mockReturnValueOnce(commandOutput);

    const response = await invokeFunction(lambdaClient, functionName, inputPayload);

    expect(lambdaClient.send.mock.calls.length).toBe(1);

    const commandInput = lambdaClient.send.mock.calls[0][0].input;
    expect(commandInput.Payload).toBe(inputPayload);
    expect(commandInput.FunctionName).toBe(functionName);

    expect(response.functionError).toBe(commandOutput.FunctionError);
    expect(response.payload).toBe(outputPayload);
  });
});