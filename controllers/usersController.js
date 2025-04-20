const { users } = require('../models/init-models')(require('../config/sequelize'));
const argon2 = require('argon2');

exports.editProfile = async (req, res) => {
    const { username, email } = req.body;
    try {
        await users.update({ username, email }, { where: { id: req.user.id } });
        res.redirect('/profile');
    } catch (err) {
        res.status(500).send('Error updating profile.');
    }
};

exports.changePassword = async (req, res) => {
    const { current, new: newPassword } = req.body;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).send('Password must be at least 12 characters long and include lowercase, uppercase, numbers, and special characters (including _).');
    }
    try {
        const user = await users.findByPk(req.user.id);
        if (!await argon2.verify(user.password_hash, current)) {
            return res.status(400).send('Current password is incorrect.');
        }
        const passwordHash = await argon2.hash(newPassword);
        await users.update({ password_hash: passwordHash }, { where: { id: req.user.id } });
        res.redirect('/profile');
    } catch (err) {
        res.status(500).send('Error changing password.');
    }
};
