const moment = require('moment')

function formatMessage(username, text) {
        return {
            username,
            text,
            time: new Intl.DateTimeFormat('default', {
                hour: 'numeric',
                minute: 'numeric',
        }).format(new Date())
    }
}

module.exports = formatMessage
