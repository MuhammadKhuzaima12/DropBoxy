const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const errorMessage = document.getElementById('errorMessage');
const previewContainer = document.getElementById('previewContainer');
const previewGrid = document.getElementById('previewGrid');
const imageCounter = document.getElementById('imageCounter')
const clearAllBtn = document.getElementById('clearAllBtn');

let uploadedImages = [];

// Load images from memory on page load
window.addEventListener('load', () => {
    const stored = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
    uploadedImages = stored;
    if (uploadedImages.length > 0) {
        displayPreviews();
    } else {
        updateImageCounter();
    }
});

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(event) {
    event.preventDefault();
    event.stopPropagation();
}

// Highlight drop zone when dragging over it
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('dragover');
    }, false);
});

// Handle dropped files
dropZone.addEventListener('drop', (event) => {
    const data_transfer = event.dataTransfer;
    const files = data_transfer.files;
    handleFiles(files);
});

// Handle file input change
fileInput.addEventListener('change', (event) => {
    handleFiles(event.target.files);
});

function handleFiles(files) {
    errorMessage.style.display = 'none';
    const validFiles = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    for (let file of files) {
        if (allowedTypes.includes(file.type)) {
            validFiles.push(file);
        } else {
            showError(`Invalid file type: ${file.name}. Only JPG, PNG, and GIF are allowed.`);
        }
    }

    if (validFiles.length > 0) {
        uploadFiles(validFiles);
    }
}

function uploadFiles(files) {
    progressContainer.style.display = 'block';
    let progress = 0;

    const interval = setInterval(() => {
        progress += 10;
        progressFill.style.width = progress + '%';
        progressFill.textContent = progress + '%';

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressFill.style.width = '0%';
                processFiles(files);
            }, 500);
        }
    }, 200);
}

function processFiles(files) {
    files.forEach(file => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const imageData = {
                id: Date.now() + Math.random(),
                src: event.target.result,
                name: file.name
            };
            uploadedImages.push(imageData);
            saveToStorage();
            displayPreviews();
        };

        reader.readAsDataURL(file);
    });
}

function displayPreviews() {
    previewGrid.innerHTML = '';

    uploadedImages.forEach(image => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
                    <img src="${image.src}" alt="${image.name}">
                    <button class="preview-remove" onclick="removeImage(${image.id})">×</button>
                `;
        previewGrid.appendChild(previewItem);
    });

    previewContainer.style.display = uploadedImages.length > 0 ? 'block' : 'none';

    updateImageCounter();
}

function removeImage(id) {
    uploadedImages = uploadedImages.filter(img => img.id !== id);
    saveToStorage();
    displayPreviews();
}

function saveToStorage() {
    localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages));
}

function updateImageCounter() {
    const count = uploadedImages.length;
    imageCounter.innerText = count === 1
        ? '1 Image'
        : `${count} Images`;
}

clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all images?')) {
        uploadedImages = [];
        saveToStorage();
        displayPreviews();
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}