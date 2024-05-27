const form = document.getElementById('form');

form.addEventListener('submit', submitFrom);

function submitFrom(event) {
    event.preventDefault();
    const name = document.getElementById('name');
    const files = document.getElementById('files');
    const formData = new FormData();
    const messageDiv = document.getElementById('message'); 
    const uploadFileDiv = document.getElementById('uploaded-files')

    formData.append('name', name.value);
    if (files.files.length > 0) {
        for (let i = 0; i < files.files.length; i++) {
            formData.append('files', files.files[i]);
        }
    }

    fetch("http://localhost:4000/upload_files", {
        method: "POST",
        body: formData,
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.message) {
            messageDiv.innerHTML = `<p style="color: green;">${data.message}</p>`;
            uploadFileDiv.innerHTML = data.files.map(file => {
                const fileUrl = file.s3Url;
                const fileName = file.fileName;
                const fileType = fileName.split(".").pop().toLowerCase();
                if (["jpg", "jpeg", "png", "gif", "bmp"].includes(fileType)) {
                    // Display image
                    return `<div><img src="${fileUrl}" alt="${fileName}" style="max-width: 200px; display: block;" /></div>`;
                } else if (["pdf", "txt"].includes(fileType)) {
                    // Display as embedded content or link for other file types
                    return `<div><iframe src="${fileUrl}" style="width: 100%; height: 500px;" frameborder="0"></iframe></div>`;
                } else {
                    // Display as link for unsupported types
                    return `<div><a href="${fileUrl}" target="_blank">${fileName}</a></div>`;
                }
            });
        } else {
            messageDiv.innerHTML = `<p style="color: red;">Failed to upload files</p>`;
        }
    })
    .catch((err) => {
        console.error("Error occurred", err);
        messageDiv.innerHTML = `<p style="color: red;">Error occurred: ${err.message}</p>`;
    });
}
