import queueToQueue from '../../src/queue-to-queue';

const SOURCE_QUEUE_NAME = 'source-queue';
const DEST_QUEUE_NAME = 'dest-queue';

let sqsContainer;
let sqsClient;

beforeAll(async () => {
  sqsContainer = await setUpSqsService();
  sqsClient = createSqsClient();

  await createQueue(sqsClient, SOURCE_QUEUE_NAME);
  await createQueue(sqsClient, DEST_QUEUE_NAME);
});

afterEach(async () => {
  await cleanQueue(sqsClient, SOURCE_QUEUE_NAME);
  await cleanQueue(sqsClient, DEST_QUEUE_NAME);
});

afterAll(async () => {
  await sqsContainer.stop();
});

it('should consume messages from source queue and send them to dest queue', async () => {
  await sendMessage(sqsClient, SOURCE_QUEUE_NAME, 'message-1');
  await sendMessage(sqsClient, SOURCE_QUEUE_NAME, 'message-2');
  await sendMessage(sqsClient, SOURCE_QUEUE_NAME, 'message-3');
  await sendMessage(sqsClient, SOURCE_QUEUE_NAME, 'message-4');

  var sourceQueueUrl = getQueueUrl(SOURCE_QUEUE_NAME);
  var destQueueUrl = getQueueUrl(DEST_QUEUE_NAME);
  await queueToQueue({
    sourceQueueUrl,
    destQueueUrl,
    endpointUrl: SQS_ENDPOINT_URL
  });

  const messagesFound = await receiveMessages(sqsClient, DEST_QUEUE_NAME);

  expect(messagesFound.map(message => message.body))
    .toIncludeSameMembers(['message-1', 'message-2', 'message-3', 'message-4']);
});

it('should keep message in source queue when keepSource param is true', async () => {
  await sendMessage(sqsClient, SOURCE_QUEUE_NAME, 'message-1');

  var sourceQueueUrl = getQueueUrl(SOURCE_QUEUE_NAME);
  var destQueueUrl = getQueueUrl(DEST_QUEUE_NAME);
  await queueToQueue({
    sourceQueueUrl,
    destQueueUrl,
    endpointUrl: SQS_ENDPOINT_URL,
    keepSource: true
  });

  const messagesFoundInDestQueue = await receiveMessages(sqsClient, DEST_QUEUE_NAME);
  expect(messagesFoundInDestQueue.map(message => message.body)).toIncludeSameMembers(['message-1']);

  await waitVisibilityTimeout();

  const messagesFoundInSourceQueue = await receiveMessages(sqsClient, SOURCE_QUEUE_NAME);
  expect(messagesFoundInSourceQueue.map(message => message.body)).toIncludeSameMembers(['message-1']);
});
