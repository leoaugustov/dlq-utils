import purgeQueue from "purge-queue";

const QUEUE_NAME = 'events-queue';

let sqsContainer;
let sqsClient;

beforeAll(async () => {
  sqsContainer = await setUpSqsService();
  sqsClient = createSqsClient();

  await createQueue(sqsClient, QUEUE_NAME);
});

afterAll(async () => {
  await sqsContainer.stop();
});

it('should consume messages from queue and delete only those that match the regex', async () => {
  const queueUrl = getQueueUrl(QUEUE_NAME);

  const messages = await sendTestMessages(sqsClient, QUEUE_NAME);

  messagesThatShouldBeDeleted = messages.filter(message => message.slice(-1) % 2);
  messagesThatShouldBeKept = messages.filter(message => ! message.slice(-1) % 2);

  await purgeQueue({
    endpointUrl: SQS_ENDPOINT_URL,
    regex: `^(${messagesThatShouldBeDeleted.join(" | ")})$`,
    queueUrl
  });

  await assertQueueContainsMessages(sqsClient, QUEUE_NAME, messagesThatShouldBeKept);
});

it('should not throw exception when queue does not exist', async () => {
  const queueUrl = getQueueUrl("nonexistent");

  await purgeQueue({
    endpointUrl: SQS_ENDPOINT_URL,
    regex: ".",
    queueUrl
  });
});
