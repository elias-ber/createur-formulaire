const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { window } = new JSDOM('<!doctype html><html><body></body></html>');
global.window = window;
global.document = window.document;

// Importer la fonction updatePreview
const updatePreview = require('preview');

describe('updatePreview', () => {
    beforeEach(() => {
        // Réinitialiser le DOM avant chaque test
        document.body.innerHTML = `
            <div id="preview-title"></div>
            <div id="preview-description"></div>
            <div id="preview-header"></div>
            <div id="preview-fields"></div>
            <button id="submit-button"></button>
        `;
    });

    test('Génération du formulaire à partir d\'un JSON', () => {
        const formData = {
            title: 'Test',
            description: 'Test test.',
            styles: {
                fieldDecoration: 'none',
                headerDecoration: 'none',
                titleColor: '#333333',
                assetColor: '#4CAF50',
                background: '#ffffff',
                backgroundType: 'hex'
            },
            fields: [
                {
                    type: 'input',
                    label: 'Entrez votre texte',
                    placeholder: 'Entrez votre texte ici',
                    required: false
                }
            ]
        };

        updatePreview(formData);

        // Vérifier le titre
        const previewTitle = document.getElementById('preview-title');
        expect(previewTitle.textContent).toBe('Test');
        expect(previewTitle.style.color).toBe('rgb(51, 51, 51)');

        // Vérifier la description
        const previewDescription = document.getElementById('preview-description');
        expect(previewDescription.textContent).toBe('Test test.');
        expect(previewDescription.style.color).toBe('rgb(51, 51, 51)');

        // Vérifier les champs
        const previewFields = document.getElementById('preview-fields');
        expect(previewFields.children.length).toBe(1);

        const fieldDiv = previewFields.firstChild;
        expect(fieldDiv.className).toBe('form-field');

        const label = fieldDiv.querySelector('label');
        expect(label.textContent).toBe('Entrez votre texte');
        expect(label.style.color).toBe('rgb(51, 51, 51)');

        const input = fieldDiv.querySelector('input');
        expect(input.type).toBe('text');
        expect(input.placeholder).toBe('Entrez votre texte ici');
        expect(input.required).toBe(false);
    });
});
