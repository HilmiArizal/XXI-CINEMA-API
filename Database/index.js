const query = require('mysql');

const database = query.createConnection({
    host: 'localhost',
    user: 'hilmi',
    password: 'Hilmi12345',
    database: 'bioskop',
    multipleStatements: true,
})

module.exports = database;