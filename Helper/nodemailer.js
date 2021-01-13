const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hilmi.arizal36@gmail.com',
        pass: 'hkzjunsiuaqjrojj'
    }
})

module.exports = transporter;