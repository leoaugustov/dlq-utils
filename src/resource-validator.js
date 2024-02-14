import logger from "./logger";
import { isExistingQueue } from "./sqs";
import { isExistingFunction } from "./lambda";
import fs from "fs/promises";

async function validate(resources, sqsClient, lambdaClient) {
  const files = [];
  const queues = [];
  const functions = [];
  for (const resource of resources) {
    if (resource.type === "file") {
      files.push(resource);
    } else if (resource.type === "queue") {
      queues.push(resource);
    } else if (resource.type === "function") {
      functions.push(resource);
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

  for (const { value: functionName } of functions) {
    const valid = await validateFunction(lambdaClient, functionName);
    if (!valid) {
      return false;
    }
  }

  return true;
}

async function validateFile({ value: filePath, requiredPermission }) {
  const accessMode = mapPermissionToFsMode(requiredPermission);
  try {
    await fs.access(filePath, accessMode);
    return true;
  } catch (error) {
    logger.error("(ERROR) The specified file does not exist or is not readable");
    return false;
  }
}

async function validateQueue(sqsClient, queueUrl) {
  const queueName = queueUrl.substring(queueUrl.lastIndexOf("/") + 1);
  if (await isExistingQueue(sqsClient, queueName)) {
    return true;
  }
  logger.error(`(ERROR) Queue ${queueUrl} does not exist or is not accessible`);
  return false;
}

async function validateFunction(lambdaClient, functionName) {
  if (await isExistingFunction(lambdaClient, functionName)) {
    return true;
  }
  logger.error("(ERROR) The specified function does not exist or is not accessible");
  return false;
}

function mapPermissionToFsMode(permissionFlag) {
  if (permissionFlag === "read") {
    return fs.R_OK;
  }
  throw new Error("Unknown file permission");
}

export default { validate, validateQueue };
