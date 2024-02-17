# dlq-utils

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/leoaugustov/dlq-utils/blob/main/LICENSE)
![Homebrew version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/leoaugustov/homebrew-dlq-utils/master/Info/dlq-utils.json&query=$.versions.stable&label=homebrew&color=green)

A CLI with some commands that help with DLQ message processing. Built with Node.js and currently only working with AWS components.

## Installation (Homebrew only)
To install the latest version:
```shell
brew tap leoagustov/homebrew-dlq-utils
brew install dlq-utils
```

To update to the latest version:
```shell
brew update
brew upgrade dlq-utils
```

## Features

- Invoke a function using messages from a queue
- Move or copy messages from one queue to another
- Delete messages from a queue based on a regular expression
- Template a message before sending it to a queue or invoking a function
- Save messages from a queue to a text file
- Read lines from a text file and send them as messages to a queue

## Usage
It's necessary to specify the environment variable `AWS_PROFILE` with the [named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to use before executing a command.

#### `queue-to-lambda`
Invoke an AWS Lambda function with all messages from an Amazon SQS queue, being able to transform them before invoking the function.

```shell
AWS_PROFILE=configured-profile dlq-utils queue-to-lambda -s "https://sqs.us-east-1.amazonaws.com/000000000000/some-queue" -d "some-lambda-function"
```

#### `file-to-queue`
Read a text file to send each line as a message to an Amazon SQS queue.

```shell
AWS_PROFILE=configured-profile dlq-utils file-to-queue -s "/Users/myuser/Documents/some-file.txt" -d "https://sqs.us-east-1.amazonaws.com/000000000000/some-queue"
```

#### `queue-to-file`
Consume all messages from an Amazon SQS queue to save them in a text file.

```shell
AWS_PROFILE=configured-profile dlq-utils queue-to-file -s "https://sqs.us-east-1.amazonaws.com/000000000000/some-queue" -d "/Users/myuser/Documents/some-file.txt"
```

#### `queue-to-queue`
Move all messages from an Amazon SQS queue to another one, being able to transform them.

```shell
AWS_PROFILE=configured-profile dlq-utils queue-to-queue -s "https://sqs.us-east-1.amazonaws.com/000000000000/source-queue" -d "https://sqs.us-east-1.amazonaws.com/000000000000/dest-queue"
```

#### `purge-queue`
Purge a queue conditionally based on a regular expression tested on the message body.

```shell
AWS_PROFILE=configured-profile dlq-utils purge-queue --queue-url "https://sqs.us-east-1.amazonaws.com/000000000000/some-queue" --regex ".foo"
```
For full documentation run `dlq-utils help [command]`.

## Running locally

You will need Node 16 or later.

Clone this repository and install the project dependencies. Then build the project:

```shell
npm run build:dev
```
Next, you need to run the command below inside the repository folder to locally link it with the command `npx dlq-utils`:

```shell
npx link .
```

After that, every time you make a change in the code base you need to rebuild the project to update the CLI behavior. To execute commands use the prefix `npx` and do not forget the parameter `--endpoint-url`:

```shell
npx dlq-utils queue-to-lambda -s "http://localhost:9324/000000000000/some-queue" -d "some-lambda-function" --endpoint-url "http://localhost:9324"
```

To facilitate local executions you can run `docker-compose up` inside the repository folder to start a Docker container that exposes two SQS queues, `source-queue` and `dest-queue`. The first queue will contain 4 messages. It is possible to customize this initial state by editing [`./tools/docker/setup-sqs.sh`](https://github.com/leoaugustov/dlq-utils/tree/main/tools/docker/setup-sqs.sh).

## Roadmap

Here you will find a list of features I want to include in the project:

- ✨ Add the ability to delete messages that DON'T match the regex in purge-queue command
- 🔧 Add hot reload to automatically rebuild the project and improve the development experience
