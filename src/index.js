#! /usr/bin/env node

import { Command } from "commander";
import path from "path";
import propertiesReader from "properties-reader";
import fileToQueue from "./file-to-queue";
import queueToFile from "./queue-to-file";
import queueToLambda from "./queue-to-lambda";
import queueToQueue from "./queue-to-queue";
import purgeQueue from "./purge-queue";

const program = new Command();

const versionFileName = path.resolve(__dirname, ".version");
program.version(propertiesReader(versionFileName).get("current"));

program
  .command("queue-to-lambda")
  .description(
    "Consume all messages from a queue to invoke an AWS Lambda function with each one. " +
      "A message will be deleted from the queue if function invocation succeeds"
  )
  .requiredOption("-s --queue-url <string>", "The URL of the queue that contains the messages")
  .requiredOption("-d --function-name <string>", "The Lambda function name")
  .option("--keep-source", "Indicate that messages in the queue should be kept", false)
  .option(
    "--endpoint-url <string>",
    "Just like in aws-cli commands, this is only required when using a local version of SQS and Lambda (e.g. LocalStack)"
  )
  .option(
    "--template <string>",
    "A template to interpolate the messages before invoking the function. " +
      "Must be a valid JSON with the token *msg* that will be replaced by the actual message"
  )
  .action(queueToLambda);

program
  .command("file-to-queue")
  .description("Read a text file to send each line as a message to an Amazon SQS queue")
  .requiredOption(
    "-s --file <string>",
    "The full name of the text file to read line by line. Blank lines will be skipped"
  )
  .requiredOption("-d --queue-url <string>", "The URL of the queue to which messages should be sent")
  .option(
    "--endpoint-url <string>",
    "Just like in aws-cli commands, this is only required when using a local version of SQS"
  )
  .action(fileToQueue);

program
  .command("queue-to-file")
  .description(
    "Consume all messages from a queue (without deleting) to save them in a text file. " +
      "If the file already exists it will be overwritten"
  )
  .requiredOption("-s --queue-url <string>", "The URL of the queue that contains the messages")
  .requiredOption("-d --file <string>", "The full name of the text file where the messages should be saved")
  .option(
    "--endpoint-url <string>",
    "Just like in aws-cli commands, this is only required when using a local version of SQS"
  )
  .action(queueToFile);

program
  .command("queue-to-queue")
  .description("Move all messages in a queue to another one")
  .requiredOption("-s --source-queue-url <string>", "The URL of the queue that contains the messages")
  .requiredOption("-d --dest-queue-url <string>", "The URL of the queue to which messages should be sent")
  .option("--keep-source", "Indicate that messages in the source queue should be kept", false)
  .option(
    "--endpoint-url <string>",
    "Just like in aws-cli commands, this is only required when using a local version of SQS and Lambda (e.g. LocalStack)"
  )
  .option(
    "--template <string>",
    "A template to interpolate the messages before sending them to the queue. " +
      "Must be a valid JSON with the token *msg* that will be replaced by the actual message"
  )
  .action(queueToQueue);

program
  .command("purge-queue")
  .description("Clear queue conditionally based on a regular expression")
  .requiredOption("-r --regex <string>", "The regex to select the messages that should be deleted")
  .requiredOption("-q --queue-url <string>", "The URL of the queue that contains the messages")
  .option(
    "--endpoint-url <string>",
    "Just like in aws-cli commands, this is only required when using a local version of SQS and Lambda (e.g. LocalStack)"
  )
  .action(purgeQueue);

program.parse();
