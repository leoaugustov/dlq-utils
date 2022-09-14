import chalk from "chalk";

function info(message) {
    console.log(chalk.white(message));
}

function success(message) {
    console.log(chalk.green(message));
}

function error(message) {
  console.log(chalk.red.bold(message));
}

function errorDetail(message) {
  console.log(chalk.red(message));
}

function warning(message) {
  console.log(chalk.yellow(message));
}

export default {
    info,
    success,
    error,
    errorDetail,
    warning
};