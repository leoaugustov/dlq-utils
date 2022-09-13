#! /usr/bin/env node

import { Command } from 'commander';
import fileToQueue from './file-to-queue';

const program = new Command();

program
  .command('file-to-queue')
  .description('Read a text file to send each line as a message to an Amazon SQS queue')
  .option('-r --region <string>', 'The AWS region to which this client will send requests', 'us-east-1')
  .requiredOption('-f --file <string>', 'The full name of the text file to read line by line. Blank lines will be skipped')
  .requiredOption('-q --queue-url <string>', 'The URL of the queue to which messages should be sent')
  .action(fileToQueue);

program.parse();