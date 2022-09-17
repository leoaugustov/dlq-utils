#! /usr/bin/env node

import { Command } from "commander";
import fileToQueue from "./file-to-queue";
import queueToLambda from "./queue-to-lambda";

const program = new Command();

program
  .command("file-to-queue")
  .description("Read a text file to send each line as a message to an Amazon SQS queue")
  .requiredOption(
    "-f --file <string>",
    "The full name of the text file to read line by line. Blank lines will be skipped"
  )
  .requiredOption("-q --queue-url <string>", "The URL of the queue to which messages should be sent")
  .action(fileToQueue);

program
  .command("queue-to-lambda")
  .description("Consume all messages from a queue to invoke an AWS Lambda function with each one")
  .requiredOption("-f --function-name <string>", "The Lambda function name")
  .requiredOption("-q --queue-url <string>", "The URL of the queue to which messages should be sent")
  .action(queueToLambda);

program.parse();
