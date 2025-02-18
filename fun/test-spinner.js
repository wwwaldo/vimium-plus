const DonutSpinner = require('./lib/spinner');

const spinner = new DonutSpinner();
spinner.start('Taking a well-deserved nap');

// Stop after 10 seconds
setTimeout(() => {
    spinner.stop();
    process.exit(0);
}, 10000);
