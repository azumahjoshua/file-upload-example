const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const fs = require("fs");
require('dotenv').config();

// Configure S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Function to upload a file to S3
const uploadFileToS3 = async (filePath, fileName) => {
    try {
        const fileContent = fs.readFileSync(filePath);
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: fileContent
        };
        const command = new PutObjectCommand(uploadParams);
        const data = await s3Client.send(command);
        return data;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    uploadFileToS3
};
