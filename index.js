const express = require('express');
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cors = require('cors');
const sharp = require('sharp');
const Minio = require('minio');
require('dotenv').config();

let minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    useSSL: false,
    port: 9000,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

const app = express();
const PORT = process.env.PORT || 4200;
const DOMAIN = process.env.DOMAIN;

app.use(cors());
app.set('view engine', 'pug');
app.use(express.static('images'));

app.post("/ticket", upload.any(), async (req, res) => {
    try{
        const id = uuidv4();

        console.log('POST /post_pdf/');
    
        if(req.files.length < 1){
            res.sendStatus(400);
            return;
        }

        // Convert file to webp
        let buffer = await sharp(req.files[0].buffer)
            .resize(1920, 1080)
            .webp()
            .toBuffer();
        
        // Write the image to Disk
        await minioClient.putObject('hackathon-card', `images/${id}.webp`, buffer);

        res.status(200).json({
            id: id
        });
    }catch(err){
        console.log('Error: ', err);
        res.status(500).send('An error occurred: ' + err.message);
    }
});

app.get("/ticket/:id", (req, res) => {
    try{
        const { id } = req.params;

        res.render('metadata', { image_src: `${DOMAIN}/ticket/${id}/image` });
        console.log(id);
    }catch(err){
        console.log('Error: ', err);
        res.status(500).send('An error occurred: ' + err.message);
    } 
});

app.get("/ticket/:id/image", async (req, res) => {
    try{
        const { id } = req.params;

        let object = await minioClient.getObject("hackathon-card", `images/${id}.webp`)

        res.setHeader('content-type', 'image/webp')
        object.pipe(res);
        console.log(id);
    }catch(err){
        console.log('Error: ', err);
        res.status(500).send('An error occurred: ' + err.message);
    }
});

async function main() {
    app.listen(PORT, () => {
        console.log(`Server running on - ${PORT}`)
    });
}

main();