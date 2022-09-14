import { invokeFunction } from '../src/lambda';

function createLambdaClient() {
  return  { send: jest.fn() };
}

describe('invokeFunction', () => {
  it('should build command correctly, call client and return response data', async () => {
    const lambdaClient = createLambdaClient();
    const functionName = 'lambda-function-name';
    const payload = 'payload';
    const commandOutput = {
      StatusCode: 200,
      FunctionError: 'Error message',
      Payload: 'Returned payload'
    };

    lambdaClient.send.mockReturnValueOnce(commandOutput);

    const response = await invokeFunction(lambdaClient, functionName, payload);

    expect(lambdaClient.send.mock.calls.length).toBe(1);

    const commandInput = lambdaClient.send.mock.calls[0][0].input;
    expect(commandInput.Payload).toBe(payload);
    expect(commandInput.FunctionName).toBe(functionName);

    expect(response.statusCode).toBe(commandOutput.StatusCode);
    expect(response.functionError).toBe(commandOutput.FunctionError);
    expect(response.payload).toBe(commandOutput.Payload);
  });
});