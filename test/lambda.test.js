import { invokeFunction, isExistingFunction } from 'lambda';
import { ResourceNotFoundException } from '@aws-sdk/client-lambda';

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

describe('isExistingFunction', () => {
  it('should return true when client does not throw exception', async () => {
    const lambdaClient = createLambdaClient();
    const functionName = 'lambda-function-name';

    const functionExists = await isExistingFunction(lambdaClient, functionName);

    expect(lambdaClient.send.mock.calls.length).toBe(1);

    const commandInput = lambdaClient.send.mock.calls[0][0].input;
    expect(commandInput.FunctionName).toBe(functionName);

    expect(functionExists).toBe(true);
  });

  it('should return false when client throws ResourceNotFoundException', async () => {
    const lambdaClient = createLambdaClient();
    const functionName = 'lambda-function-name';

    lambdaClient.send.mockRejectedValueOnce(new ResourceNotFoundException('error'));

    const functionExists = await isExistingFunction(lambdaClient, functionName);

    expect(lambdaClient.send.mock.calls.length).toBe(1);

    const commandInput = lambdaClient.send.mock.calls[0][0].input;
    expect(commandInput.FunctionName).toBe(functionName);

    expect(functionExists).toBe(false);
  });

  it('should throw exception when client throws any exception except ResourceNotFoundException', async () => {
    const lambdaClient = createLambdaClient();
    const functionName = 'lambda-function-name';

    lambdaClient.send.mockRejectedValueOnce(new Error('error'));

    await expect(async () => await isExistingFunction(lambdaClient, functionName))
      .rejects.toThrow(Error);

    expect(lambdaClient.send.mock.calls.length).toBe(1);
  });
});
