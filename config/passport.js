const LocalStrategy = require('passport-local').Strategy;
const argon2 = require('argon2');
const { users } = require('../models/init-models')(require('../config/sequelize'));

module.exports = function (passport) {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const user = await users.findOne({ where: { email } });
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            if (!await argon2.verify(user.password_hash, password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await users.findByPk(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};
