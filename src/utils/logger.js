module.exports = {
    // Логгер для цветного вывода в консоль
    async logger(...args) {
        const chalk = (await import('chalk')).default;
        console.log(chalk.bold.hex('#1de595')(...args));
    }
}