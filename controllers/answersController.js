const { answers } = require('../models/init-models')(require('../config/sequelize'));

exports.getAnswers = async (req, res) => {
    try {
        const form = await forms.findByPk(req.params.id);
        if (form.created_by !== req.user.id) {
            return res.status(403).send('Unauthorized.');
        }
        const formAnswers = await answers.findAll({ where: { form_id: req.params.id } });
        res.json(formAnswers);
    } catch (err) {
        res.status(500).send('Error retrieving answers.');
    }
};
