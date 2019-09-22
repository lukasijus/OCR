const express = require('express');
//creating server, creating routers
const app = express();
//read files and create files
const fs = require('fs');
//upload the files to server
const multer = require('multer')
//apply ocr on the images
const { TesseractWorker } = require('tesseract.js');
const worker = new TesseractWorker();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage }).single('avatar');

app.set("view engine", 'ejs');
app.get('/uploads', (req, res) => {
    console.log('');
})

//ROUTES
app.get('/', (req, res) => {
    res.render('index');
});
app.post('/upload', (req, res) => {
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if (err) {
                return console.log('This is error', err)
            };

            worker
                .recognize(data, "eng", { tessjs_create_pdf: '1' })
                .progress(progress => {
                    console.log(progress);
                })
                .then(result => {
                    res.send(result.text);
                })
                .finally(() => {
                    worker.terminate()
                })

        });
    });
});
//listen and start our server
const port = 5000 || process.env.port;
app.listen(port, () => {
    console.log('hei I running on port 5000')
})