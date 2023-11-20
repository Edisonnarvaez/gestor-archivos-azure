const express = require('express');
const azure = require('azure-storage');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

const blobService = azure.createBlobService('cs210032000d3316d41', 'koHTRn1QBbpF91QfuWkv0Ixd8In38vV69cg4uN9NKfrkYzvLerQGhAD4Yf7CbaQQSSq0giUqx0rm+ASt9d2YyQ==');


app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const cors = require('cors');

app.use(cors());

app.get('/list', (req, res) => {
    blobService.listBlobsSegmented('cloud2023sem5', null, (error, result) => {
        if (!error) {
            res.json(result.entries.map(entry => entry.name));
        } else {
            console.error(error);
            res.status(500).send(`Error al obtener la lista de archivos: ${error.message}`);
        }
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('No se ha proporcionado un archivo.');
    }

    const blobName = path.basename(file.originalname, path.extname(file.originalname)) + '-' + Date.now() + path.extname(file.originalname);
    const stream = blobService.createWriteStreamToBlockBlob('cloud2023sem5', blobName);

    stream.on('error', (error) => {
        console.error(error);
        res.status(500).send('Error al subir el archivo.');
    });

    stream.on('finish', () => {
        res.status(200).send('Archivo subido con éxito.');
    });

    stream.end(file.buffer);
});

app.listen(port, () => {
    console.log(`Servidor en ejecución en http://localhost:${port}`);
});
