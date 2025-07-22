async function getResources() {
    try {
        const response = await fetch(`${CONTENT_API_URL}api/resources/`);
        const data = await response.json();
        const resourcesList = document.getElementById('resources-list');
        resourcesList.innerHTML = '';

        data.resources.forEach(file => {
            const wrapper = document.createElement('div');
            wrapper.className = 'pdf-container';
            let cleanedUrl = file.image.startsWith('/') ? file.image.substring(1) : file.image;
            wrapper.style.backgroundImage = `url('${CONTENT_API_URL}${cleanedUrl}')`; // replace with actual image if needed

            const overlay = document.createElement('div');
            overlay.className = 'overlay';

            const titleSpan = document.createElement('span');
            titleSpan.textContent = formatFileName(file.title, file.file);

            const downloadLink = document.createElement('a');
            downloadLink.href = file.file;
            downloadLink.setAttribute('download', '');
            downloadLink.textContent = 'Download';

            overlay.appendChild(titleSpan);
            overlay.appendChild(downloadLink);
            wrapper.appendChild(overlay);
            resourcesList.appendChild(wrapper);
        });

    } catch (error) {
        console.error('Error fetching resources:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getResources();
});

// Optional: Format filename similar to your Django template filter
function formatFileName(title, fileUrl) {
    const fileName = fileUrl.split('/').pop();  // extract file name from URL
    return `${title} (${fileName})`;
}