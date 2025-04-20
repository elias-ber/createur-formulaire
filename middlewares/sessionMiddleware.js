const session = require('express-session');

module.exports = session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
});
