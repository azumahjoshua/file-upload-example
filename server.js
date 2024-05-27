const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadFileToS3 } = require("./s3Service");
require('dotenv').config();
const app = express();

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });


// Ensure the 'uploads' directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Route to handle file uploads
app.post("/upload_files", upload.array("files"), async (req, res) => {
    try {
        const uploadPromises = req.files.map(async (file) => {
            const filePath = path.join(__dirname, 'uploads', file.filename);
            const uploadResult = await uploadFileToS3(filePath, file.filename);
            fs.unlinkSync(filePath); 
            return {
                fileName: file.originalname,
                s3Url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.filename}`
            };
        });

        const uploadResults = await Promise.all(uploadPromises);
        res.json({ message: "Successfully uploaded files", files: uploadResults });
    } catch (error) {
        console.error("Error uploading files: ", error);
        res.status(500).json({ error: "Error uploading files", details: error.message });
    }
});

// Start the server
app.listen(4000, () => {
    console.log(`Server started on port 4000...`);
});
