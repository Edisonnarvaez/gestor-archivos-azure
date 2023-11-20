document.addEventListener('DOMContentLoaded', () => {
    loadFileList();
});

async function loadFileList() {
    const fileListElement = document.getElementById('file-list');
    fileListElement.innerHTML = '';

    try {
        const response = await fetch('/list');
        const files = await response.json();

        files.forEach(file => {
            const li = document.createElement('li');
            li.textContent = file;
            fileListElement.appendChild(li);
        });
    } catch (error) {
        console.error(error);
        alert('Error al obtener la lista de archivos.');
    }
}

async function uploadFile() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (!file) {
        alert('Selecciona un archivo primero.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        alert('Archivo subido con éxito.');
        loadFileList();
    } catch (error) {
        console.error(error);
        alert('Error al subir el archivo.');
    }
}
