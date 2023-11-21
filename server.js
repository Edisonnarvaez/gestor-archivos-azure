const express = require('express');
const azure = require('azure-storage');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

// Reemplaza 'TuCadenaDeConexion' con la cadena de conexión correcta
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=cs210032000d3316d41;AccountKey=NmaLz9nyI49shWtWqC+Ev2yRpGr/691PPcb50OJS6FcYgdTStrWwH7aLsBAemQ/9vH6CA2aNhFKF+AStRof5PQ==;EndpointSuffix=core.windows.net';

const blobService = azure.createBlobService(connectionString);

app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const cors = require('cors');

app.use(cors());

const containerName = 'ebooks';

blobService.createContainerIfNotExists(containerName, { publicAccessLevel: 'blob' }, (error, result, response) => {
    if (!error) {
        console.log(`Contenedor '${containerName}' verificado o creado exitosamente.`);
        startServer(); // Inicia el servidor después de verificar/crear el contenedor
    } else {
        console.error(`Error al verificar/crear el contenedor: ${error.message}`);
    }
});

function startServer() {
    app.get('/list', (req, res) => {
        blobService.listBlobsSegmented(containerName, null, (error, result) => {
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
        const stream = blobService.createWriteStreamToBlockBlob(containerName, blobName);
    
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
}
