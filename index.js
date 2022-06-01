const express = require('express');
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4200;
const DOMAIN = process.env.DOMAIN;

app.use(cors());
app.set('view engine', 'pug')
app.use(express.static('images'))

app.post("/ticket", upload.any(), (req, res) => {
    try{
        const id = uuidv4();

        console.log('POST /post_pdf/');
        console.log('Files: ', req.files);

        if(req.files.length < 1){
            res.sendStatus(400);
            return
        }

        console.log(id);

        fs.writeFile(`images/${id}.png`, req.files[0].buffer, (err) => {
            if (err) {
                console.log('Error: ', err);
                res.status(500).send('An error occurred: ' + err.message);
            } else {
                res.status(200).json({ id: id });
            }
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

app.get("/ticket/:id/image", (req, res) => {
    try{
        const { id } = req.params;

        res.sendFile(path.resolve(`images/${id}.png`));
        console.log(id);
    }catch(err){
        console.log('Error: ', err);
        res.status(500).send('An error occurred: ' + err.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on - ${PORT}`)
});