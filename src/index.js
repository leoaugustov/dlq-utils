#! /usr/bin/env node

import { Command } from "commander";
import fileToQueue from "./file-to-queue";
import queueToLambda from "./queue-to-lambda";
import queueToQueue from "./queue-to-queue";

const program = new Command();

program
  .command("file-to-queue")
  .description("Read a text file to send each line as a message to an Amazon SQS queue")
  .requiredOption(
    "-f --file <string>",
    "The full name of the text file to read line by line. Blank lines will be skipped"
  )
  .requiredOption("-q --queue-url <string>", "The URL of the queue to which messages should be sent")
  .option(
    "--endpoint-url <string>",
    "Just like in aws-cli commands, this is only required when using a local version of SQS"
  )
  .action(fileToQueue);

program
  .command("queue-to-lambda")
  .description("Consume all messages from a queue to invoke an AWS Lambda function with each one")
  .requiredOption("-f --function-name <string>", "The Lambda function name")
  .requiredOption("-q --queue-url <string>", "The URL of the queue to which messages should be sent")
  .option(
    "--endpoint-url <string>",
    "Just like in aws-cli commands, this is only required when using a local version of SQS and Lambda (e.g. LocalStack)"
  )
  .action(queueToLambda);

program
  .command("queue-to-queue")
  .description("Move all messages in a queue to another one")
  .requiredOption("-s --source-queue-url <string>", "The URL of the queue that contains the messages")
  .requiredOption("-d --dest-queue-url <string>", "The URL of the queue to which messages should be sent")
  .option(
    "--endpoint-url <string>",
    "Just like in aws-cli commands, this is only required when using a local version of SQS and Lambda (e.g. LocalStack)"
  )
  .action(queueToQueue);

program.parse();
