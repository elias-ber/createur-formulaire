var newFormModal = document.getElementById("newFormModal");
var publishFormModal = document.getElementById("publishFormModal");
var deleteFormModal = document.getElementById("deleteFormModal");
var editFormModal = document.getElementById("editFormModal");
var newFormButton = document.getElementById("newFormButton");
var spans = document.getElementsByClassName("close");
var currentFormId = null;
var currentFormTitle = null;
var isDraft = null;

newFormButton.onclick = function () {
    newFormModal.style.display = "block";
}

for (var span of spans) {
    span.onclick = function () {
        newFormModal.style.display = "none";
        publishFormModal.style.display = "none";
        deleteFormModal.style.display = "none";
        editFormModal.style.display = "none";
    }
}

window.onclick = function (event) {
    if (event.target == newFormModal) {
        newFormModal.style.display = "none";
    }
    if (event.target == publishFormModal) {
        publishFormModal.style.display = "none";
    }
    if (event.target == deleteFormModal) {
        deleteFormModal.style.display = "none";
    }
    if (event.target == editFormModal) {
        editFormModal.style.display = "none";
    }
}

document.querySelector('#newFormModal .confirm-button').onclick = function () {
    var formTitle = document.getElementById('formTitle').value;
    if (formTitle) {
        fetch('/forms/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: formTitle })
        }).then(response => {
            if (response.ok) {
                newFormModal.style.display = "none";
                location.reload();
            } else {
                alert('Erreur lors de la création du formulaire.');
            }
        });
    } else {
        alert('Veuillez entrer un titre pour le formulaire.');
    }
}

document.querySelector('#newFormModal .cancel-button').onclick = function () {
    newFormModal.style.display = "none";
}

function openPublishModal(id, title) {
    currentFormId = id;
    document.getElementById('publishFormTitle').innerText = title;
    publishFormModal.style.display = "block";
}

function publishForm() {
    if (currentFormId) {
        fetch(`/forms/${currentFormId}/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_publish: 1, published_at: new Date() })
        }).then(response => {
            if (response.ok) {
                publishFormModal.style.display = "none";
                location.reload();
            } else {
                alert('Erreur lors de la publication du formulaire.');
            }
        });
    }
}

document.querySelector('#publishFormModal .cancel-button').onclick = function () {
    publishFormModal.style.display = "none";
}

function openDeleteModal(id, title) {
    currentFormId = id;
    document.getElementById('deleteFormTitle').innerText = title;
    deleteFormModal.style.display = "block";
}

function deleteForm() {
    if (currentFormId) {
        fetch(`/forms/${currentFormId}/delete`, {
            method: 'DELETE'
        }).then(response => {
            if (response.status === 204) {
                deleteFormModal.style.display = "none";
                location.reload();
            } else if (response.status === 403) {
                alert('Vous n\'êtes pas autorisé à supprimer ce formulaire.');
            } else if (response.status === 404) {
                alert('Formulaire non trouvé.');
            } else {
                alert('Erreur lors de la suppression du formulaire.');
            }
        }).catch(error => {
            console.error('Error:', error);
            alert('Une erreur est survenue lors de la suppression du formulaire.');
        });
    }
}

document.querySelector('#deleteFormModal .cancel-button').onclick = function () {
    deleteFormModal.style.display = "none";
}

function openEditModal(id, title, isDraft) {
    currentFormId = id;
    document.getElementById('editFormTitle').value = title;
    editFormModal.style.display = "block";
    this.isDraft = isDraft;
}

function editFormTitle() {
    if (currentFormId) {
        var newTitle = document.getElementById('editFormTitle').value;
        if (newTitle) {
            fetch(`/forms/${currentFormId}/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: newTitle })
            }).then(response => {
                if (response.ok) {
                    editFormModal.style.display = "none";
                    location.reload(); // Reload the page to update the form list
                } else {
                    alert('Erreur lors de la modification du formulaire.');
                }
            });
        } else {
            alert('Veuillez entrer un titre pour le formulaire.');
        }
    }
}

function editInEditor() {
    if (currentFormId) {
        window.location.href = `/forms/${currentFormId}/edit`;
    }
}

document.querySelector('#editFormModal .cancel-button').onclick = function () {
    editFormModal.style.display = "none";
}

function copyForm(id) {
    fetch(`/forms/${id}/copy`, {
        method: 'POST'
    }).then(response => {
        if (response.ok) {
            location.reload();
        } else {
            alert('Erreur lors de la copie du formulaire.');
        }
    });
}
async function exportAnswers(formId) {
    try {
        const response = await fetch(`/forms/${formId}/answers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `responses_form_${formId}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            const errorMessage = await response.json();
            alert(errorMessage.message || 'Erreur lors de l\'exportation des réponses.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Une erreur est survenue lors de l\'exportation des réponses.');
    }
}