import chalk from "chalk";

function info(message) {
    console.log(chalk.white(message));
}

function success(message) {
    console.log(chalk.green(message));
}

export default {
    info,
    success
};