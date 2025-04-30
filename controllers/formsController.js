const { forms, answers } = require('../models/init-models')(require('../config/sequelize'));
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs')

exports.createForm = async (req, res) => {
    const { title } = req.body;
    try {
        await forms.create({
            title: title,
            json_structure: '{"title":"Nouveau Formulaire","description":"","styles":{"fieldDecoration":"card","headerDecoration":"card","titleColor":"#000000","assetColor":"#2563eb","background":"#ffffff","backgroundType":"hex"},"fields":[]}',
            created_by: req.user.id,
            is_published: 0
        });
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating form.');
    }
};

exports.getFormData = async (req, res) => {
    const formId = req.params.id;
    try {
        const form = await forms.findByPk(formId);
        if (!form) {
            return res.status(404).send('Pas de formulaire');
        }
        if (form.is_published === 0 && req.user.id !== form.created_by) {
            return res.status(403).send('Pas de formulaire');
        }
        let jsonStructure;
        try {
            if (typeof form.json_structure === 'string') {
                jsonStructure = JSON.parse(form.json_structure);
            } else {
                jsonStructure = form.json_structure;
            }
        } catch (parseError) {
            return res.status(500).send('Erreur de format JSON');
        }
        res.json(jsonStructure);
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
};

exports.submitForm = async (req, res) => {
    const formId = req.params.id;
    const { email, answers: answersData } = req.body;
    try {
        const form = await forms.findByPk(formId);
        if (!form) {
            return res.status(404).send('Pas de formulaire');
        }
        if (form.is_published === 0) {
            return res.status(403).send('Pas de formulaire');
        }
        const existingAnswer = await answers.findOne({
            where: {
                form_id: formId,
                email: email
            }
        });
        if (existingAnswer) {
            return res.status(400).send('Vous avez déjà répondu au formulaire.');
        }
        await answers.create({
            form_id: formId,
            email: email,
            json_structure: JSON.stringify(answersData),
            created_at: new Date()
        });
        res.status(200).send('Réponses envoyées');
    } catch (err) {
        console.error(`Error submitting responses for form ID ${formId}:`, err);
        res.status(500).send('Erreur serveur');
    }
};

exports.getFormAnswers = async (req, res) => {
    try {
        const formId = req.params.id;
        const form = await forms.findByPk(formId);
        if (!form) {
            return res.status(404).json({ message: 'Formulaire non trouvé.' });
        }
        if (form.created_by !== req.user.id) {
            return res.status(403).json({ message: 'Non autorisé.' });
        }

        // Récupérer les réponses du formulaire
        const responses = await answers.findAll({
            where: { form_id: formId },
            attributes: ['email', 'created_at', 'json_structure']
        });

        if (responses.length === 0) {
            return res.status(404).json({ message: 'Aucune réponse trouvée pour ce formulaire.' });
        }

        // Vérifier si form.json_structure est un JSON valide
        let formFields = [];
        try {
            if (typeof form.json_structure === 'string') {
                const jsonStructure = JSON.parse(form.json_structure);
                formFields = jsonStructure.fields || [];
            } else {
                formFields = form.json_structure.fields || [];
            }
        } catch (parseError) {
            console.error('Error parsing JSON structure:', parseError);
            return res.status(500).json({ message: 'Erreur de format JSON.' });
        }

        // Préparer les en-têtes du CSV
        const headers = [
            { id: 'email', title: 'Email' },
            { id: 'date', title: 'Date' }
        ];

        formFields.forEach(field => {
            headers.push({ id: field.id.toString(), title: field.label });
        });

        // Préparer les données du CSV
        const csvData = responses.map(response => {
            const row = {
                email: response.email,
                date: response.created_at
            };

            const jsonStructure = JSON.parse(response.json_structure);
            jsonStructure.forEach(item => {
                let value = item.value;
                // Si la valeur est un tableau, la convertir en chaîne de caractères
                if (Array.isArray(value)) {
                    value = value.join(', '); // Convertir le tableau en chaîne de caractères
                }
                // Échapper les valeurs contenant des points-virgules ou des guillemets
                row[item.id] = value ? `"${value.replace(/"/g, '""')}"` : '';
            });

            return row;
        });

        // Créer le fichier CSV avec le séparateur `;`
        const csvFilePath = path.join(__dirname, '..', `responses_form_${formId}.csv`);
        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: headers.map(header => ({ id: header.id, title: header.title })),
            delimiter: ';' // Utiliser `;` comme séparateur
        });

        await csvWriter.writeRecords(csvData);

        // Envoyer le fichier CSV en réponse
        res.download(csvFilePath, `responses_form_${formId}.csv`, err => {
            if (err) {
                console.error('Error sending file:', err);
                return res.status(500).json({ message: 'Erreur lors de l\'envoi du fichier.' });
            }
            // Supprimer le fichier après l'envoi
            fs.unlinkSync(csvFilePath);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Une erreur est survenue.' });
    }
};


exports.editForm = async (req, res) => {
    const { title, json_structure } = req.body;
    try {
        const form = await forms.findByPk(req.params.id);
        if (!form) {
            return res.status(404).json({ success: false, message: 'Formulaire non trouvé.' });
        }
        if (form.created_by !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Non autorisé.' });
        }
        await form.update({ title, json_structure });
        res.json({ success: true, message: 'Formulaire sauvegardé avec succès.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde du formulaire.' });
    }
};


exports.publishForm = async (req, res) => {
    try {
        const form = await forms.findByPk(req.params.id);
        if (form.created_by !== req.user.id) {
            return res.status(403).send('Unauthorized.');
        }
        await form.update({ is_published: 1, published_at: new Date() });
        res.redirect('/profile');
    } catch (err) {
        res.status(500).send('Error publishing form.');
    }
};

exports.deleteForm = async (req, res) => {
    try {
        const form = await forms.findByPk(req.params.id);
        if (!form) {
            return res.status(404).send('Form not found.');
        }
        if (form.created_by !== req.user.id) {
            return res.status(403).send('Unauthorized.');
        }

        await answers.destroy({
            where: { form_id: form.id }
        });

        await form.destroy();

        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting form.');
    }
};

exports.copyForm = async (req, res) => {
    try {
        const form = await forms.findByPk(req.params.id);
        if (form.created_by !== req.user.id) {
            return res.status(403).send('Unauthorized.');
        }
        await forms.create({
            title: form.title,
            json_structure: form.json_structure,
            created_by: req.user.id,
            is_published: 0,
            published_at: null
        });
        res.redirect('/profile');
    } catch (err) {
        res.status(500).send('Error copying form.');
    }
};
