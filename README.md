# dlq-utils

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/leoaugustov/dlq-utils/blob/main/LICENSE)
![Homebrew version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/leoaugustov/homebrew-dlq-utils/master/Info/dlq-utils.json&query=$.versions.stable&label=homebrew&color=green)

A CLI with some commands that help with DLQ message processing. Built with Node.js and currently only working with AWS components.

## Installation (Homebrew only)
```shell
brew tap leoagustov/homebrew-dlq-utils
brew install dlq-utils
```

## Usage
It's necessary to specify the environment variable `AWS_PROFILE` with the [named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to use before executing a command.

#### `queue-to-lambda`
Invoke an AWS Lambda function with all messages from an Amazon SQS queue, being able to transform them before invoking the function.

```shell
AWS_PROFILE=configured-profile dlq-utils queue-to-lambda --queue-url "https://sqs.us-east-1.amazonaws.com/000000000000/some-queue" --function-name "some-lambda-function"
```

#### `file-to-queue`
Read a text file to send each line as a message to an Amazon SQS queue.

```shell
AWS_PROFILE=configured-profile dlq-utils file-to-queue --queue-url "https://sqs.us-east-1.amazonaws.com/000000000000/some-queue" --file "/Users/myuser/Documents/some-file.txt"
```

#### `queue-to-file`
Consume all messages from an Amazon SQS queue to save them in a text file.

```shell
AWS_PROFILE=configured-profile dlq-utils queue-to-file --queue-url "https://sqs.us-east-1.amazonaws.com/000000000000/some-queue" --file "/Users/myuser/Documents/some-file.txt"
```

#### `queue-to-queue`
Move all messages from an Amazon SQS queue to another one, being able to transform them.

```shell
AWS_PROFILE=configured-profile dlq-utils queue-to-queue --source-queue-url "https://sqs.us-east-1.amazonaws.com/000000000000/source-queue" --dest-queue-url "https://sqs.us-east-1.amazonaws.com/000000000000/dest-queue"
```
For full documentation run `dlq-utils help [command]`.

## Running locally

You will need Node 16 or later.

Clone this repository and install the project dependencies. Then build the project:

```shell
npm run build
```
Next, you need to run the command below inside the repository folder to locally link it with the command `npx dlq-utils`:

```shell
npx link .
```

After that, every time you make a change in the code base you need to rebuild the project to update the CLI behavior.

## Roadmap

Here you will find a list of features I want to include in the project:

- ✨ Add the ability to filter out messages with a regex
- ✨ Add the ability to keep messages in source queue
- 🦺 Add validation for better feedback when some resource (e.g. file, queue or function) does not exist
- 🔧 Add tooling to facilitate local testing
- 🔧 Add hot reload to automatically rebuild the project and improve the development experience
