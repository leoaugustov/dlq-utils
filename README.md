# dlq-utils

A CLI with some commands that help with DLQ message processing. Built with Node.js and currently only working with AWS components.

## Installation (Homebrew only)
```shell
brew tap leoagustov/homebrew-dlq-utils
brew install dlq-utils
```

## Usage
It's necessary to specify the environment variable `AWS_PROFILE` with the [named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to use before executing a command.

`queue-to-lambda`:
```shell
AWS_PROFILE=configured-profile dlq-utils queue-to-lambda --queue-url "https://sqs.us-east-1.amazonaws.com/000000000000/some-queue" --function-name "some-lambda-function"
```

`file-to-queue`:
```shell
AWS_PROFILE=configured-profile dlq-utils file-to-queue --queue-url "https://sqs.us-east-1.amazonaws.com/000000000000/some-queue" --file "/Users/myuser/Documents/some-file.txt"
```

`queue-to-queue`:
```shell
AWS_PROFILE=configured-profile dlq-utils queue-to-queue --source-queue-url "https://sqs.us-east-1.amazonaws.com/000000000000/source-queue" --dest-queue-url "https://sqs.us-east-1.amazonaws.com/000000000000/dest-queue"
```
For full documentation run `dlq-utils help [command]`.

## Running locally

Clone this repository and install the project dependencies. Then build the project:

```shell
npm run build
```
Next, you need to run the command below inside the repository folder to globally link it with the command `dlq-utils`:

```shell
npm link
```

After that, every time you make a change in the code base you need to rebuild the project to update the CLI behavior.

## Roadmap

Here you will find a list of features I want to include in the project:

- ✨ Improve commands by adding the ability to transform messages using a template
- ✨ Improve commands by adding the ability to filter messages
- 🔧 Add hot reload to automatically rebuild the project and improve the development experience
