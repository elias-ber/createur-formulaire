const argon2 = require('argon2');
const { users } = require('../models/init-models')(require('../config/sequelize'));

let passport;

exports.init = (_passport) => {
    passport = _passport;
};

const redirect = (req, res, next) => {
    res.redirect('/login')
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{12,}$/;

    if (!passwordRegex.test(password)) {
        return res.status(400).send('Password must be at least 12 characters long and include lowercase, uppercase, numbers, and special characters (including _).');
    }

    try {
        const existingUser = await users.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).send('Username is already taken.');
        }

        const passwordHash = await argon2.hash(password);
        await users.create({ username, email, password_hash: passwordHash });
        res.redirect('/login');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user.');
    }
};

exports.login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/forms',
        failureRedirect: '/login'
    })(req, res, next);
};

exports.logout = (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect('/login');
    });
};
