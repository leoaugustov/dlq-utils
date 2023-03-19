import logger from "./logger";
import { isExistingQueue } from "./sqs";
import fs from "fs/promises";

async function validate(resources, sqsClient) {
  const files = [];
  const queues = [];
  for (const resource of resources) {
    if (resource.type === "file") {
      files.push(resource);
    } else if (resource.type === "queue") {
      queues.push(resource);
    }
  }

  for (const file of files) {
    const valid = await validateFile(file);
    if (!valid) {
      return false;
    }
  }

  for (const { value: queueUrl } of queues) {
    const valid = await validateQueue(sqsClient, queueUrl);
    if (!valid) {
      return false;
    }
  }

  return true;
}

async function validateFile({ value: filePath, requiredPermission }) {
  try {
    await fs.access(filePath, mapPermissionToFsMode(requiredPermission));
    return true;
  } catch (error) {
    logger.error("(ERROR) The specified file does not exist or is not readable/writable");
    return false;
  }
}

async function validateQueue(sqsClient, queueUrl) {
  const queueName = queueUrl.substring(queueUrl.lastIndexOf("/") + 1);
  if (await isExistingQueue(sqsClient, queueName)) {
    return true;
  }
  logger.error("(ERROR) Some of the specified queues do not exist or are not accessible");
  return false;
}

function mapPermissionToFsMode(permissionFlag) {
  if (permissionFlag === "read") {
    return fs.R_OK;
  } else if (permissionFlag === "write") {
    return fs.W_OK;
  }
}

export default { validate };
