let fieldIdCounter = 1;
let isEditMode = true;
let formId = window.location.pathname.split('/')[2];

// Initialiser l'interface au chargement
window.addEventListener('DOMContentLoaded', function () {
    toggleBackgroundInput();
    updateBackground();
    document.addEventListener('input', function (event) {
        if (event.target.dataset.type === 'telephone') {
            formatPhoneNumber(event.target);
        }
        // Mettre à jour l'aperçu si des champs spécifiques changent
        if (['form-title', 'form-description', 'title-color', 'asset-color', 'field-decoration', 'header-decoration'].includes(event.target.id)) {
            updatePreview();
        }
    });
    // Mettre à jour l'aperçu si les sélections de style changent
    document.getElementById('field-decoration').addEventListener('change', updatePreview);
    document.getElementById('header-decoration').addEventListener('change', updatePreview);

    // Charger les données du formulaire depuis le serveur
    fetchFormData();
});

document.getElementById('toggle-mode').addEventListener('click', function () {
    isEditMode = !isEditMode;
    document.querySelector('.form-builder').classList.toggle('active', isEditMode);
    document.querySelector('.form-preview').classList.toggle('active', !isEditMode);
    this.textContent = isEditMode ? 'Mode Aperçu' : 'Mode Édition';
    if (!isEditMode) {
        updatePreview();
    }
});

function toggleBackgroundInput() {
    const backgroundType = document.getElementById('background-type').value;
    const backgroundInputContainer = document.getElementById('background-input-container');
    backgroundInputContainer.innerHTML = '';

    if (backgroundType === 'hex') {
        backgroundInputContainer.innerHTML = `
                    <label for="background-color">Couleur:</label>
                    <input type="color" id="background-color" value="#ffffff">
                `;
        document.getElementById('background-color').addEventListener('input', updateBackground);
    } else if (backgroundType === 'url') {
        backgroundInputContainer.innerHTML = `
                    <label for="background-url">URL:</label>
                    <input type="text" id="background-url" placeholder="URL de l'image">
                `;
        document.getElementById('background-url').addEventListener('input', updateBackground);
    }
    updateBackground();
}

function updateBackground() {
    const backgroundType = document.getElementById('background-type').value;
    let background = '#ffffff';

    if (backgroundType === 'hex') {
        const backgroundColorInput = document.getElementById('background-color');
        if (backgroundColorInput) {
            background = backgroundColorInput.value;
        }
    } else if (backgroundType === 'url') {
        const backgroundUrlInput = document.getElementById('background-url');
        if (backgroundUrlInput && backgroundUrlInput.value) {
            background = `url('${backgroundUrlInput.value}')`;
        }
    }

    document.body.style.background = background;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center';
}

function addField(type) {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-field';
    fieldDiv.dataset.type = type;
    fieldDiv.dataset.id = fieldIdCounter++;

    // Base HTML pour tous les types de champs
    let fieldHTML = `
                <div class="move-buttons">
                    <button onclick="moveFieldUp(this)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><polyline points="4 14 10 8 16 14"></polyline><line x1="10" y1="8" x2="10" y2="20"></line></svg>
                    </button>
                    <button onclick="moveFieldDown(this)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><polyline points="4 10 10 16 16 10"></polyline><line x1="10" y1="16" x2="10" y2="4"></line></svg>
                    </button>
                    <button onclick="removeField(this)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <label>Label:</label>
                <input type="text" class="label-input" placeholder="Label du champ" value="${getDefaultLabelForType(type)}" required>
                <div class="checkbox-container">
                    <input type="checkbox" id="required-${fieldIdCounter - 1}" class="required-input">
                    <label for="required-${fieldIdCounter - 1}">Requis</label>
                </div>
            `;

    // Ajoute des éléments spécifiques au type de champ
    switch (type) {
        case 'input':
        case 'email':
        case 'telephone':
        case 'url':
            fieldHTML += `
                        <label>Placeholder:</label>
                        <input type="text" class="placeholder-input" placeholder="Placeholder du champ">
                    `;
            if (type === 'input') {
                fieldHTML += `
                            <label>Max Char:</label>
                            <input type="number" class="max-char-input" placeholder="Max Char" min="0">
                        `;
            }
            break;
        case 'textarea':
            fieldHTML += `
                        <label>Placeholder:</label>
                        <input type="text" class="placeholder-input" placeholder="Placeholder du champ">
                        <label>Max Char:</label>
                        <input type="number" class="max-char-input" placeholder="Max Char" min="0">
                    `;
            break;
        case 'number':
            fieldHTML += `
                        <label>Min:</label>
                        <input type="number" class="min-input" placeholder="Min">
                        <label>Max:</label>
                        <input type="number" class="max-input" placeholder="Max">
                    `;
            break;
        case 'date':
            fieldHTML += `
                        <label>Date de départ:</label>
                        <input type="date" class="start-input">
                        <label>Date de fin:</label>
                        <input type="date" class="end-input">
                    `;
            break;
        case 'time':
            fieldHTML += `
                        <label>Heure de départ:</label>
                        <input type="time" class="start-input">
                        <label>Heure de fin:</label>
                        <input type="time" class="end-input">
                    `;
            break;
        case 'dropdown':
        case 'radio':
        case 'checkbox':
            fieldHTML += `
                        <label>Options:</label>
                        <div class="options-list">
                            <div>
                                <input type="text" placeholder="Option" value="Option 1" required>
                                <button onclick="removeOption(this)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        </div>
                        <button onclick="addOption(this)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                            <span>Ajouter une option</span>
                        </button>
                    `;
            break;
    }

    fieldDiv.innerHTML = fieldHTML;
    document.getElementById('form-fields').appendChild(fieldDiv);
    updateFieldIds();
    updatePreview();
}

function getDefaultLabelForType(type) {
    const types = {
        'input': 'Texte',
        'email': 'Email',
        'telephone': 'Téléphone',
        'textarea': 'Commentaire',
        'radio': 'Choix unique',
        'checkbox': 'Choix multiples',
        'dropdown': 'Liste déroulante',
        'time': 'Heure',
        'date': 'Date',
        'star': 'Évaluation',
        'number': 'Nombre',
        'color': 'Couleur',
        'url': 'URL'
    };
    return types[type] || 'Champ';
}

function removeField(button) {
    const fieldDiv = button.closest('.form-field');
    fieldDiv.remove();
    updateFieldIds();
    updatePreview();
}

function addOption(button) {
    const fieldDiv = button.closest('.form-field');
    const optionsList = fieldDiv.querySelector('.options-list');
    const optionDiv = document.createElement('div');
    optionDiv.innerHTML = `
                <input type="text" placeholder="Option" value="Option ${optionsList.children.length + 1}" required>
                <button onclick="removeOption(this)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            `;
    optionsList.appendChild(optionDiv);
}

function removeOption(button) {
    const optionDiv = button.parentElement;
    const optionsList = optionDiv.parentElement;
    if (optionsList.children.length > 1) {
        optionDiv.remove();
    } else {
        alert("Vous devez avoir au moins une option.");
    }
}

function moveFieldUp(button) {
    const fieldDiv = button.closest('.form-field');
    const previousField = fieldDiv.previousElementSibling;
    if (previousField) {
        fieldDiv.parentNode.insertBefore(fieldDiv, previousField);
        updateFieldIds();
        updatePreview();
    }
}

function moveFieldDown(button) {
    const fieldDiv = button.closest('.form-field');
    const nextField = fieldDiv.nextElementSibling;
    if (nextField) {
        fieldDiv.parentNode.insertBefore(nextField, fieldDiv);
        updateFieldIds();
        updatePreview();
    }
}

function updateFieldIds() {
    const fields = document.querySelectorAll('.form-field');
    fields.forEach((field, index) => {
        field.dataset.id = index + 1;
    });
}

function generateJSON() {
    const formData = collectFormData();
    document.getElementById('json-output').textContent = JSON.stringify(formData, null, 2);
}

function collectFormData() {
    const title = document.getElementById('form-title').value;
    const description = document.getElementById('form-description').value;
    const fieldDecoration = document.getElementById('field-decoration').value;
    const headerDecoration = document.getElementById('header-decoration').value;
    const titleColor = document.getElementById('title-color').value;
    const assetColor = document.getElementById('asset-color').value;
    const backgroundType = document.getElementById('background-type').value;

    let background = '';
    if (backgroundType === 'hex') {
        const backgroundColorInput = document.getElementById('background-color');
        if (backgroundColorInput) {
            background = backgroundColorInput.value;
        }
    } else if (backgroundType === 'url') {
        const backgroundUrlInput = document.getElementById('background-url');
        if (backgroundUrlInput) {
            background = backgroundUrlInput.value;
        }
    }

    const fields = [];
    document.querySelectorAll('.form-field').forEach(fieldDiv => {
        const type = fieldDiv.dataset.type;
        const id = parseInt(fieldDiv.dataset.id, 10);
        const labelInput = fieldDiv.querySelector('.label-input');
        const requiredInput = fieldDiv.querySelector('.required-input');

        if (!labelInput) return;

        const label = labelInput.value;
        const required = requiredInput ? requiredInput.checked : false;

        const field = {
            id,
            type,
            label,
            required,
        };

        // Collecter les attributs spécifiques au type de champ
        const placeholderInput = fieldDiv.querySelector('.placeholder-input');
        const maxCharInput = fieldDiv.querySelector('.max-char-input');
        const minInput = fieldDiv.querySelector('.min-input');
        const maxInput = fieldDiv.querySelector('.max-input');
        const startInput = fieldDiv.querySelector('.start-input');
        const endInput = fieldDiv.querySelector('.end-input');
        const optionsList = fieldDiv.querySelector('.options-list');

        if (placeholderInput && placeholderInput.value) field.placeholder = placeholderInput.value;
        if (maxCharInput && maxCharInput.value) field.maxChar = parseInt(maxCharInput.value, 10);
        if (minInput && minInput.value) field.min = parseInt(minInput.value, 10);
        if (maxInput && maxInput.value) field.max = parseInt(maxInput.value, 10);
        if (startInput && startInput.value) field.start = startInput.value;
        if (endInput && endInput.value) field.end = endInput.value;

        if (optionsList) {
            field.options = [];
            optionsList.querySelectorAll('input[type="text"]').forEach(optionInput => {
                if (optionInput.value) {
                    field.options.push(optionInput.value);
                }
            });
        }

        // Pour les champs de type 'telephone', utiliser la valeur brute
        if (type === 'telephone') {
            const telephoneInput = fieldDiv.querySelector('input[type="tel"]');
            if (telephoneInput) {
                field.value = telephoneInput.getAttribute('data-raw-value') || '';
            }
        }

        fields.push(field);
    });

    return {
        title,
        description,
        styles: {
            fieldDecoration,
            headerDecoration,
            titleColor,
            assetColor,
            background: background,
            backgroundType: backgroundType
        },
        fields,
    };
}

function updatePreview() {
    const formData = collectFormData();

    // Mettre à jour l'en-tête du formulaire
    const previewTitle = document.getElementById('preview-title');
    const previewDescription = document.getElementById('preview-description');
    const previewHeader = document.getElementById('preview-header');

    previewTitle.textContent = formData.title || 'Titre du formulaire';
    previewTitle.style.color = formData.styles.titleColor;
    previewDescription.textContent = formData.description || '';
    previewDescription.style.color = formData.styles.titleColor;

    // Appliquer la décoration de l'en-tête
    if (formData.styles.headerDecoration === 'card') {
        previewHeader.className = 'card';
    } else {
        previewHeader.className = '';
    }

    // Mettre à jour les champs
    const previewFields = document.getElementById('preview-fields');
    previewFields.innerHTML = '';

    formData.fields.forEach((field) => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'form-field';

        if (formData.styles.fieldDecoration === 'card') {
            fieldDiv.classList.add('card');
            fieldDiv.style.padding = '20px'; // Ajouter du padding aux cartes de champ
        } else {
            fieldDiv.style.padding = '0'; // Réinitialiser le padding si la décoration est 'none'
        }

        const labelClass = field.required ? 'required-label' : '';
        let fieldHTML = `<label style="color: ${formData.styles.titleColor};" class="${labelClass}" for="field-${field.id}">${field.label}</label>`;

        switch (field.type) {
            case 'input':
                fieldHTML += `<input id="field-${field.id}" type="text" placeholder="${field.placeholder || ''}"${field.maxChar ? ` maxlength="${field.maxChar}"` : ''}${field.required ? ' required' : ''}>`;
                break;
            case 'email':
                fieldHTML += `<input id="field-${field.id}" type="email" placeholder="${field.placeholder || ''}"${field.required ? ' required' : ''}>`;
                break;
            case 'telephone':
                fieldHTML += `<input id="field-${field.id}" type="tel" placeholder="${field.placeholder || ''}" data-type="telephone"${field.required ? ' required' : ''} data-raw-value="${field.value || ''}">`;
                break;
            case 'textarea':
                fieldHTML += `<textarea id="field-${field.id}" placeholder="${field.placeholder || ''}"${field.maxChar ? ` maxlength="${field.maxChar}"` : ''}${field.required ? ' required' : ''}></textarea>`;
                break;
            case 'radio':
                if (field.options && field.options.length > 0) {
                    field.options.forEach((option, index) => {
                        fieldHTML += `
                                    <div class="radio-container">
                                        <input id="field-${field.id}-${index}" type="radio" name="field-${field.id}" value="${option}" style="accent-color: ${formData.styles.assetColor};"${field.required && index === 0 ? ' required' : ''}>
                                        <label for="field-${field.id}-${index}">${option}</label>
                                    </div>
                                `;
                    });
                }
                break;
            case 'checkbox':
                if (field.options && field.options.length > 0) {
                    field.options.forEach((option, index) => {
                        fieldHTML += `
                                    <div class="checkbox-container">
                                        <input id="field-${field.id}-${index}" type="checkbox" name="field-${field.id}" value="${option}" style="accent-color: ${formData.styles.assetColor};"${field.required && index === 0 ? ' required' : ''}>
                                        <label for="field-${field.id}-${index}">${option}</label>
                                    </div>
                                `;
                    });
                }
                break;
            case 'dropdown':
                fieldHTML += `<select id="field-${field.id}" style="color: ${formData.styles.titleColor};"${field.required ? ' required' : ''}>`;
                if (field.options && field.options.length > 0) {
                    fieldHTML += `<option value="" disabled selected>Sélectionnez une option</option>`;
                    field.options.forEach(option => {
                        fieldHTML += `<option value="${option}">${option}</option>`;
                    });
                }
                fieldHTML += `</select>`;
                break;
            case 'time':
                fieldHTML += `<input id="field-${field.id}" type="time"${field.start ? ` min="${field.start}"` : ''}${field.end ? ` max="${field.end}"` : ''}${field.required ? ' required' : ''}>`;
                break;
            case 'date':
                fieldHTML += `<input id="field-${field.id}" type="date"${field.start ? ` min="${field.start}"` : ''}${field.end ? ` max="${field.end}"` : ''}${field.required ? ' required' : ''}>`;
                break;
            case 'star':
                fieldHTML += `
                            <div class="star-rating" style="color: ${formData.styles.assetColor};">
                                <input id="star5-${field.id}" type="radio" name="rating-${field.id}" value="5"${field.required ? ' required' : ''}>
                                <label for="star5-${field.id}" title="5 étoiles">&#9733;</label>
                                <input id="star4-${field.id}" type="radio" name="rating-${field.id}" value="4">
                                <label for="star4-${field.id}" title="4 étoiles">&#9733;</label>
                                <input id="star3-${field.id}" type="radio" name="rating-${field.id}" value="3">
                                <label for="star3-${field.id}" title="3 étoiles">&#9733;</label>
                                <input id="star2-${field.id}" type="radio" name="rating-${field.id}" value="2">
                                <label for="star2-${field.id}" title="2 étoiles">&#9733;</label>
                                <input id="star1-${field.id}" type="radio" name="rating-${field.id}" value="1">
                                <label for="star1-${field.id}" title="1 étoile">&#9733;</label>
                            </div>
                        `;
                break;
            case 'number':
                fieldHTML += `<input id="field-${field.id}" type="number"${field.min !== undefined ? ` min="${field.min}"` : ''}${field.max !== undefined ? ` max="${field.max}"` : ''}${field.required ? ' required' : ''}>`;
                break;
            case 'color':
                fieldHTML += `<input id="field-${field.id}" type="color"${field.required ? ' required' : ''}>`;
                break;
            case 'url':
                fieldHTML += `<input id="field-${field.id}" type="url" placeholder="${field.placeholder || ''}"${field.required ? ' required' : ''}>`;
                break;
        }

        fieldDiv.innerHTML = fieldHTML;
        previewFields.appendChild(fieldDiv);
    });

    // Mettre à jour le bouton d'envoi
    const submitButton = document.getElementById('submit-button');
    submitButton.style.backgroundColor = formData.styles.assetColor;
    submitButton.style.color = '#ffffff';
}

function saveForm() {
    const formData = collectFormData();
    const errors = validateForm(formData);

    if (errors.length > 0) {
        alert(`Erreurs de validation:\n${errors.join('\n')}`);
    } else {
        const jsonString = JSON.stringify(formData, null, 2);
        fetch(`/forms/${formId}/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: formData.title, json_structure: jsonString })
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert("Formulaire sauvegardé avec succès !");
                } else {
                    alert("Erreur lors de la sauvegarde du formulaire: " + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Erreur lors de la sauvegarde du formulaire: " + error.message);
            });
    }
}


function validateForm(form) {
    const errors = [];

    if (!form.title) {
        errors.push("Le titre du formulaire est obligatoire.");
    }

    form.fields.forEach(field => {
        if (!field.label) {
            errors.push(`Le champ #${field.id} doit avoir un label.`);
        }

        if ((field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') &&
            (!field.options || field.options.length === 0)) {
            errors.push(`Le champ '${field.label || '#' + field.id}' doit avoir au moins une option.`);
        }

        if ((field.maxChar !== undefined) &&
            (field.maxChar < 0)) {
            errors.push(`Pour le champ '${field.label || '#' + field.id}', Max Char doit être supérieur ou égal à 0.`);
        }

        if ((field.min !== undefined && field.max !== undefined) && (field.min > field.max)) {
            errors.push(`Pour le champ '${field.label || '#' + field.id}', Min doit être inférieur à Max.`);
        }

        if (field.start && field.end && new Date(field.start) > new Date(field.end)) {
            errors.push(`Pour le champ '${field.label || '#' + field.id}', la date de début doit être antérieure à la date de fin.`);
        }

        if (field.start && field.end && new Date('1970-01-01T' + field.start + 'Z') > new Date('1970-01-01T' + field.end + 'Z')) {
            errors.push(`Pour le champ '${field.label || '#' + field.id}', l'heure de début doit être antérieure à l'heure de fin.`);
        }
    });

    return errors;
}

function showQuitModal() {
    document.getElementById('quitModal').style.display = 'block';
}

function closeQuitModal() {
    document.getElementById('quitModal').style.display = 'none';
}

function quitWithoutSaving() {
    window.location.href = '/forms';
}

function saveAndQuit() {
    const formData = collectFormData();
    const errors = validateForm(formData);

    if (errors.length > 0) {
        alert(`Erreurs de validation:\n${errors.join('\n')}`);
    } else {
        const jsonString = JSON.stringify(formData, null, 2);
        fetch(`/forms/${formId}/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: formData.title, json_structure: jsonString })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/forms';
                } else {
                    alert("Erreur lors de la sauvegarde du formulaire.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Erreur lors de la sauvegarde du formulaire.");
            });
    }
}

function formatPhoneNumber(input) {
    // Supprimer tous les caractères non numériques
    let value = input.value.replace(/\D/g, '');
    // Appliquer le format "xx xx xx xx xx"
    if (value.length > 0) {
        value = value.match(/.{1,2}/g).join(' ');
    }

    // Mettre à jour la valeur de l'input
    input.value = value;

    // Stocker la valeur brute sans espaces
    input.setAttribute('data-raw-value', value.replace(/\s/g, ''));
}

function fetchFormData() {
    fetch(`/forms/${formId}/data`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById('form-title').value = data.title || '';
                document.getElementById('form-description').value = data.description || '';
                document.getElementById('field-decoration').value = data.styles.fieldDecoration || 'none';
                document.getElementById('header-decoration').value = data.styles.headerDecoration || 'none';
                document.getElementById('title-color').value = data.styles.titleColor || '#333333';
                document.getElementById('asset-color').value = data.styles.assetColor || '#4CAF50';
                document.getElementById('background-type').value = data.styles.backgroundType || 'hex';

                const backgroundInputContainer = document.getElementById('background-input-container');
                backgroundInputContainer.innerHTML = '';

                if (data.styles.backgroundType === 'hex') {
                    backgroundInputContainer.innerHTML = `
                                <label for="background-color">Couleur:</label>
                                <input type="color" id="background-color" value="${data.styles.background || '#ffffff'}">
                            `;
                } else if (data.styles.backgroundType === 'url') {
                    backgroundInputContainer.innerHTML = `
                                <label for="background-url">URL:</label>
                                <input type="text" id="background-url" value="${data.styles.background || ''}">
                            `;
                }

                document.getElementById('form-title-display').textContent = data.title || 'Titre du Formulaire';

                const formFields = document.getElementById('form-fields');
                formFields.innerHTML = '';

                data.fields.forEach(field => {
                    addField(field.type);
                    const fieldDiv = formFields.lastChild;
                    fieldDiv.querySelector('.label-input').value = field.label;
                    fieldDiv.querySelector('.required-input').checked = field.required;

                    if (field.placeholder) fieldDiv.querySelector('.placeholder-input').value = field.placeholder;
                    if (field.maxChar !== undefined) fieldDiv.querySelector('.max-char-input').value = field.maxChar;
                    if (field.min !== undefined) fieldDiv.querySelector('.min-input').value = field.min;
                    if (field.max !== undefined) fieldDiv.querySelector('.max-input').value = field.max;
                    if (field.start) fieldDiv.querySelector('.start-input').value = field.start;
                    if (field.end) fieldDiv.querySelector('.end-input').value = field.end;

                    if (field.options) {
                        const optionsList = fieldDiv.querySelector('.options-list');
                        optionsList.innerHTML = '';
                        field.options.forEach(option => {
                            const optionDiv = document.createElement('div');
                            optionDiv.innerHTML = `
                                        <input type="text" placeholder="Option" value="${option}" required>
                                        <button onclick="removeOption(this)">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    `;
                            optionsList.appendChild(optionDiv);
                        });
                    }

                    if (field.type === 'telephone' && field.value) {
                        const telephoneInput = fieldDiv.querySelector('input[type="tel"]');
                        telephoneInput.setAttribute('data-raw-value', field.value);
                        formatPhoneNumber(telephoneInput);
                    }
                });

                updatePreview();
            }
        })
        .catch(error => {
            console.error('Error fetching form data:', error);
        });
}