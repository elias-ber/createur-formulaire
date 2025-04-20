const express = require('express');
const router = express.Router();
const formsController = require('../controllers/formsController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const path = require('path');
const { forms, answers } = require('../models/init-models')(require('../config/sequelize'));


router.post('/new', isAuthenticated, formsController.createForm);

router.get('/:id/data', formsController.getFormData);

router.post('/:id/submit', formsController.submitForm);

router.post('/:id/answers', isAuthenticated, formsController.getFormAnswers);

router.post('/:id/edit', isAuthenticated, formsController.editForm);

router.post('/:id/publish', isAuthenticated, formsController.publishForm);

router.delete('/:id/delete', isAuthenticated, formsController.deleteForm);

router.post('/:id/copy', isAuthenticated, formsController.copyForm);

router.get('/:id/preview', (req, res) => {
    const filePath = path.join(__dirname, '../views', 'forms-preview.html');
    res.sendFile(filePath);
});

router.get('/:id/fill', (req, res) => {
    const filePath = path.join(__dirname, '../views', 'forms-fill.html');
    res.sendFile(filePath);
});

router.get('/:id/edit', isAuthenticated, (req, res) => {
    const form = forms.findByPk(req.params.id);
    if (form.created_by !== req.user.id) {
        return res.status(403).send('Unauthorized.');
    } else if (form.is_published === 1) {
        return res.status(400).send('Form is published.');
    }
    const filePath = path.join(__dirname, 'views', 'forms-edit.html');
    res.sendFile(filePath);

});

router.get('/', isAuthenticated, async (req, res) => {
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

module.exports = router;
