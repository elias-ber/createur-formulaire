document.addEventListener('DOMContentLoaded', function () {
    const urlParts = window.location.pathname.split('/');
    const formId = urlParts[urlParts.length - 2];

    fetch(`/forms/${formId}/data`)
        .then(response => response.json())
        .then(formData => {
            updatePreview(formData);
            applyBackground(formData.styles.background, formData.styles.backgroundType);
        })
        .catch(error => console.error('Error fetching form data:', error));
});

function applyBackground(background, backgroundType) {
    const body = document.body;
    if (backgroundType === 'hex') {
        body.style.backgroundColor = background;
    } else if (backgroundType === 'url') {
        body.style.backgroundImage = `url('${background}')`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundRepeat = 'no-repeat';
        body.style.backgroundPosition = 'center';
    }
}

function updatePreview(formData) {
    const previewTitle = document.getElementById('preview-title');
    const previewDescription = document.getElementById('preview-description');
    const previewHeader = document.getElementById('preview-header');

    previewTitle.textContent = formData.title || 'Titre du formulaire';
    previewTitle.style.color = formData.styles.titleColor;
    previewDescription.textContent = formData.description || '';
    previewDescription.style.color = formData.styles.titleColor;

    if (formData.styles.headerDecoration === 'card') {
        previewHeader.className = 'card';
    } else {
        previewHeader.className = '';
    }

    const previewFields = document.getElementById('preview-fields');
    previewFields.innerHTML = '';

    formData.fields.forEach((field) => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'form-field';

        if (formData.styles.fieldDecoration === 'card') {
            fieldDiv.classList.add('card');
            fieldDiv.style.padding = '20px';
        } else {
            fieldDiv.style.padding = '0';
        }

        const labelClass = field.required ? 'required-label' : '';
        let fieldHTML = `<label style="color: ${formData.styles.titleColor};" class="${labelClass}" for="${field.id}">${field.label}</label>`;

        switch (field.type) {
            case 'input':
                fieldHTML += `<input id="${field.id}" type="text" name="${field.id}" placeholder="${field.placeholder || ''}"${field.maxChar ? ` maxlength="${field.maxChar}"` : ''}${field.required ? ' required' : ''}>`;
                break;
            case 'email':
                fieldHTML += `<input id="${field.id}" type="email" name="${field.id}" placeholder="${field.placeholder || ''}"${field.required ? ' required' : ''}>`;
                break;
            case 'telephone':
                fieldHTML += `<input id="${field.id}" type="tel" name="${field.id}" placeholder="${field.placeholder || ''}" data-type="telephone"${field.required ? ' required' : ''} data-raw-value="${field.value || ''}">`;
                break;
            case 'textarea':
                fieldHTML += `<textarea id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ''}"${field.maxChar ? ` maxlength="${field.maxChar}"` : ''}${field.required ? ' required' : ''}></textarea>`;
                break;
            case 'radio':
                field.options.forEach((option, index) => {
                    fieldHTML += `
                        <div class="radio-container">
                            <input id="${field.id}-${index}" type="radio" name="${field.id}" value="${option}" style="accent-color: ${formData.styles.assetColor};"${field.required && index === 0 ? ' required' : ''}>
                            <label for="${field.id}-${index}">${option}</label>
                        </div>
                    `;
                });
                break;
            case 'checkbox':
                field.options.forEach((option, index) => {
                    fieldHTML += `
                        <div class="checkbox-container">
                            <input id="${field.id}-${index}" type="checkbox" name="${field.id}" value="${option}" style="accent-color: ${formData.styles.assetColor};"${field.required ? ` data-required-group="${field.id}"` : ''}>
                            <label for="${field.id}-${index}">${option}</label>
                        </div>
                    `;
                });
                break;
            case 'dropdown':
                fieldHTML += `<select id="${field.id}" name="${field.id}" style="color: ${formData.styles.titleColor};"${field.required ? ' required' : ''}>`;
                fieldHTML += `<option value="" disabled selected>Sélectionnez une option</option>`;
                field.options.forEach(option => {
                    fieldHTML += `<option value="${option}">${option}</option>`;
                });
                fieldHTML += `</select>`;
                break;
            case 'time':
                fieldHTML += `<input id="${field.id}" type="time" name="${field.id}"${field.start ? ` min="${field.start}"` : ''}${field.end ? ` max="${field.end}"` : ''}${field.required ? ' required' : ''}>`;
                break;
            case 'date':
                fieldHTML += `<input id="${field.id}" type="date" name="${field.id}"${field.start ? ` min="${field.start}"` : ''}${field.end ? ` max="${field.end}"` : ''}${field.required ? ' required' : ''}>`;
                break;
            case 'star':
                fieldHTML += `
                    <div class="star-rating" style="color: ${formData.styles.assetColor};">
                        <input id="star5-${field.id}" type="radio" name="${field.id}" value="5"${field.required ? ' required' : ''}>
                        <label for="star5-${field.id}" title="5 étoiles">&#9733;</label>
                        <input id="star4-${field.id}" type="radio" name="${field.id}" value="4">
                        <label for="star4-${field.id}" title="4 étoiles">&#9733;</label>
                        <input id="star3-${field.id}" type="radio" name="${field.id}" value="3">
                        <label for="star3-${field.id}" title="3 étoiles">&#9733;</label>
                        <input id="star2-${field.id}" type="radio" name="${field.id}" value="2">
                        <label for="star2-${field.id}" title="2 étoiles">&#9733;</label>
                        <input id="star1-${field.id}" type="radio" name="${field.id}" value="1">
                        <label for="star1-${field.id}" title="1 étoile">&#9733;</label>
                    </div>
                `;
                break;
            case 'number':
                fieldHTML += `<input id="${field.id}" type="number" name="${field.id}"${field.min !== undefined ? ` min="${field.min}"` : ''}${field.max !== undefined ? ` max="${field.max}"` : ''}${field.required ? ' required' : ''}>`;
                break;
            case 'color':
                fieldHTML += `<input id="${field.id}" type="color" name="${field.id}"${field.required ? ' required' : ''}>`;
                break;
            case 'url':
                fieldHTML += `<input id="${field.id}" type="url" name="${field.id}" placeholder="${field.placeholder || ''}"${field.required ? ' required' : ''}>`;
                break;
        }

        fieldDiv.innerHTML = fieldHTML;
        previewFields.appendChild(fieldDiv);
    });

    const submitButton = document.getElementById('submit-button');
    submitButton.style.backgroundColor = formData.styles.assetColor;
    submitButton.style.color = '#ffffff';

    document.getElementById('form-preview').classList.add('active');
}

document.getElementById('preview-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const form = event.target;

    // 🔒 Validation custom pour les checkbox groupés
    const requiredGroups = new Set();
    form.querySelectorAll('input[type="checkbox"][data-required-group]').forEach(cb => {
        requiredGroups.add(cb.getAttribute('data-required-group'));
    });

    let allGroupsValid = true;
    requiredGroups.forEach(groupName => {
        const group = form.querySelectorAll(`input[type="checkbox"][name="${groupName}"]`);
        const oneChecked = Array.from(group).some(cb => cb.checked);
        if (!oneChecked) {
            allGroupsValid = false;
            group[0].setCustomValidity("Veuillez cocher au moins une option.");
            group[0].reportValidity();
        } else {
            group.forEach(cb => cb.setCustomValidity(""));
        }
    });

    if (!allGroupsValid) return;

    const formData = new FormData(form);
    const answers = [];

    const allFields = document.querySelectorAll('#preview-fields .form-field');
    allFields.forEach(field => {
        const input = field.querySelector('input, select, textarea');
        if (!input) return;

        const fieldId = input.name;
        let fieldValue;

        if (input.type === 'checkbox') {
            const checkboxes = document.querySelectorAll(`input[name="${fieldId}"]:checked`);
            fieldValue = Array.from(checkboxes).map(cb => cb.value);
        } else {
            fieldValue = formData.get(fieldId) || "";
        }

        answers.push({ id: fieldId, value: fieldValue });
    });

    document.getElementById('json-output').textContent = JSON.stringify({ answers: answers }, null, 2);
    document.getElementById('email-modal').style.display = 'block';
});

document.getElementById('email-submit-button').addEventListener('click', function () {
    const emailInput = document.getElementById('email-input');
    const emailError = document.getElementById('email-error');
    const email = emailInput.value;
    const formId = window.location.pathname.split('/')[2];
    const answers = JSON.parse(document.getElementById('json-output').textContent).answers;

    if (!email) {
        emailError.textContent = "Veuillez entrer un email valide.";
        emailError.style.display = 'block';
        return;
    }

    fetch(`/forms/${formId}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, answers })
    })
        .then(response => {
            if (response.ok) {
                alert('Réponses envoyées');
                window.location.href = '/login';
            } else {
                emailError.textContent = "Vous avez déjà répondu au formulaire.";
                emailError.style.display = 'block';
            }
        })
        .catch(error => console.error('Error submitting form:', error));
});

document.getElementsByClassName('close-button')[0].addEventListener('click', function () {
    document.getElementById('email-modal').style.display = 'none';
    document.getElementById('email-error').style.display = 'none';
    document.getElementById('email-input').value = '';
});

window.addEventListener('click', function (event) {
    const modal = document.getElementById('email-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
        document.getElementById('email-error').style.display = 'none';
        document.getElementById('email-input').value = '';
    }
});