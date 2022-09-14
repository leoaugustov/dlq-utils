# dlq-utils

## Usage
It's necessary to specify the env `AWS_PROFILE` with the [named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to use before executing a command.

`queue-to-lambda`:
```shell
AWS_PROFILE=configured-profile dlq-utils queue-to-lambda --queue-url "https://sqs.us-east-1.amazonaws.com/000000000000/some-queue" --function-name "some-lambda-function"
```

`file-to-queue`:
```shell
AWS_PROFILE=configured-profile dlq-utils file-to-queue --queue-url "https://sqs.us-east-1.amazonaws.com/000000000000/some-queue" --file "/Users/myuser/Documents/some-file.txt"
```