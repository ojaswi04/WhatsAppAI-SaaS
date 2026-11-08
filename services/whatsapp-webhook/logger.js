const fs = require('fs');

function logMessage(type, message) {

    const log = {
        type: type,
        message: message,
        timestamp: new Date()
    };

    console.log(log);

    fs.appendFileSync(
        'message_logs.txt',
        JSON.stringify(log) + "\n"
    );
}

module.exports = logMessage;
