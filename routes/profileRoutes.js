const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { forms } = require('../models/init-models')(require('../config/sequelize'));

router.get('/', isAuthenticated, async (req, res) => {
    res.render('profile', { user: req.user });
});

router.get('/forms', isAuthenticated, async (req, res) => {
    try {
        const userForms = await forms.findAll({
            where: { created_by: req.user.id },
            include: [{
                model: answers,
                as: 'answers',
                attributes: ['id'],
            }]
        });
        const drafts = userForms
            .filter(form => !form.is_published)
            .map(form => ({
                id: form.id,
                title: form.title,
                updated_at: form.updated_at,
            }));
        const published = userForms
            .filter(form => form.is_published)
            .map(form => ({
                id: form.id,
                title: form.title,
                published_at: form.published_at,
                responses: form.answers.length,
            }));
        res.render('forms', { user: req.user, drafts, published });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur');
    }
});

router.post('/edit', isAuthenticated, usersController.editProfile);

router.post('/change-password', isAuthenticated, usersController.changePassword);

module.exports = router;
