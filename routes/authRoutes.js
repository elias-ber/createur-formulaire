const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Initialiser passport dans le contrôleur
authController.init(passport);

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', authController.login);

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', authController.register);

router.post('/logout', authController.logout);

module.exports = router;
