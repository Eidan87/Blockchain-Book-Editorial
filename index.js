//Index.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');
const readline = require('readline');
const Block = require('./block');  // Asegúrate de que estas importaciones estén correctas
const BlockChain = require('./blockchain');
const compression = require('compression');
const { startWebSocketServer } = require('./websocket'); // Ajusta la ruta según tu estructura de archivos

const app = express();
// Variables globales
const HTTP_PORT = parseInt(process.argv[2]) || 3001; // Puerto HTTP dinámico, default 3001
const P2P_PORT = parseInt(process.argv[3]) || 6001; // Puerto P2P dinámico, default 6001
const peers = loadPeers(); // Cargar peers desde el archivo peers.json

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let sockets = [];
let cutreCoin = new BlockChain();

const cache = require('memory-cache');
app.get('/block/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const cachedBlock = cache.get(`block_${index}`);

    if (cachedBlock) {
        res.json(cachedBlock);
    } else {
        const filePath = `./uploads/block_${index}.json`;
        if (fs.existsSync(filePath)) {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.status(500).send('Error al leer el archivo');
                } else {
                    const blockData = JSON.parse(data);
                    cache.put(`block_${index}`, blockData, 60000); // Cache for 60 seconds
                    res.json(blockData);
                }
            });
        } else {
            res.status(404).send('Bloque no encontrado');
        }
    }
});

// Configuración de Multer para la carga de imágenes
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image'); // 'image' debe coincidir con el atributo 'name' del input de archivo en tu formulario HTML

// Middlewares y configuraciones adicionales
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Carga de archivos en orden numérico de índice
if (fs.existsSync('./uploads')) {
    fs.readdir('./uploads', (err, files) => {
        if (err) {
            console.error('Error reading upload directory: ', err);
        } else {
            // Ordenar archivos por índice numérico
            files.sort((a, b) => {
                const indexA = parseInt(a.match(/block_(\d+)\.json/)[1]);
                const indexB = parseInt(b.match(/block_(\d+)\.json/)[1]);
                return indexA - indexB;
            });

            // Función para cargar cada archivo secuencialmente
            const loadFileAtIndex = (index) => {
                setTimeout(function() {
                if (index < files.length) {
                    const file = files[index];
                    const match = file.match(/block_(\d+)\.json/);
                    if (match) {
                        const fileIndex = parseInt(match[1]);
                        const rl = readline.createInterface({
                            input: fs.createReadStream(`./uploads/${file}`),
                            output: process.stdout,
                            terminal: false
                        });

                        rl.on('line', (line) => {
                            try {
                                const blockData = JSON.parse(line);
                                cutreCoin.agregarBloque(new Block(
                                    blockData.index,
                                    blockData.timestamp,
                                    blockData.transactions,
                                    blockData.tituloLibro,
                                    blockData.autorLibro,
                                    blockData.contenidoLibro,
                                    blockData.cantidad,
                                    blockData.hashPrevio,
                                    blockData.delegadoAddress,
                                    blockData.imageUrl
                                ));
                            } catch (parseError) {
                                console.error(`Error parsing JSON from file ${file}: `, parseError);
                                // Puedes decidir cómo manejar errores de parseo JSON
                            }
                        });

                        rl.on('close', () => {
                            // Cargar el siguiente archivo después de completar este
                            loadFileAtIndex(index + 1);
                        });
                        
                    }
                    
                }
            }, 1000);
            };

            // Iniciar la carga desde el primer archivo
            loadFileAtIndex(0);

        }
        
    });
}

// Endpoint para subir imágenes
app.post('/upload-image', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error('Error uploading image', err);
            res.status(400).json({ error: err.message });
        } else {
            // Imagen subida correctamente, responder con la ubicación del archivo o URL
            const imageUrl = `/uploads/${req.file.filename}`;
            res.status(200).json({ imageUrl: imageUrl });
        }
    });
});

// Verificar tipo de archivo
function checkFileType(file, cb) {
    // Extensiones permitidas
    const filetypes = /jpeg|jpg|png|gif/;
    // Verificar extensión
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Verificar el tipo MIME
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Solo se permiten imágenes (jpeg, jpg, png, gif)');
    }
}

function savePeers() {
    fs.writeFile('./peers.json', JSON.stringify(peers), (err) => {
        if (err) {
            console.error('Error saving peers: ', err);
        } else {
            console.log('Peers saved successfully.');
        }
    });
}

function saveBlockToFile(block) {
    const filename = `./uploads/block_${block.index}.json`;
    fs.writeFile(filename, JSON.stringify(block), (err) => {
        if (err) {
            console.error(`Error saving block ${block.index}: `, err);
        } else {
            console.log(`Block ${block.index} saved successfully.`);
        }
    });
}



app.get('/reader/:id', (req, res) => {
    const id = req.params.id;
    if (id >= 0 && id < cutreCoin.chain.length) {
        const { tituloLibro, autorLibro, contenidoLibro } = cutreCoin.chain[id];
        res.render('pages/reader', { tituloLibro, autorLibro, contenidoLibro });
    } else {
        res.status(404).send('Libro no encontrado');
    }
});

app.post('/addPeer', (req, res) => {
    const peerId = req.body.peer;
    // Call a function to establish a WebSocket connection with the peer
    connectToPeer(peerId);
    // Add the socket to the sockets array
    sockets.push(socket);
    res.send('Peer added');
  });

  // Función para cargar peers desde peers.json
function loadPeers() {
    try {
        const peersData = fs.readFileSync('./peers.json');
        return JSON.parse(peersData);
    } catch (err) {
        return [];
    }
}

// Función para conectar a peers con puertos incrementales únicos
function connectToPeers() {
    peers.forEach(peer => {
      const ws = new WebSocket(peer);
  
      ws.on('open', () => {
        console.log(`Conectado a ${peer}`);
        // Implementa acciones adicionales cuando la conexión sea exitosa
      });
  
      ws.on('error', error => {
        console.error(`Error al conectar a ${peer}: ${error.message}`);
        // Implementa manejo de errores, como intentos de reconexión
      });
  
      ws.on('close', () => {
        console.log(`Conexión cerrada a ${peer}`);
        // Puedes manejar el cierre de la conexión si es necesario
      });
    });
  }
  
  // Inicia la conexión con los peers al iniciar tu servidor
  connectToPeers();



// Crear instancia de servidor HTTP
const server = app.listen(HTTP_PORT, () => {
    console.log(`HTTP Server listening on port ${HTTP_PORT}`);
    connectToPeers(peers); // Conectar a los peers al iniciar el servidor
});

// Iniciar servidor WebSocket
startWebSocketServer();

// WebSocket Server
const wss = new WebSocket.Server({ port: P2P_PORT }, () => {
    console.log(`WebSocket Server running on port ${P2P_PORT}`);
});

// Manejar conexiones WebSocket
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        handleMessage(ws, message);  // Llamar a la función para manejar el mensaje
    });

    ws.on('close', () => {
        console.log('WebSocket disconnected');
        sockets = sockets.filter(socket => socket !== ws);  // Eliminar el socket desconectado
    });

    sockets.push(ws);
});

// Función para manejar mensajes recibidos
function handleMessage(ws, message) {
    try {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'hello':
                console.log(`Received hello from ${ws._socket.remoteAddress}`);
                // Puedes implementar lógica adicional para manejar el mensaje 'hello'
                break;
            case 'BLOCK':
                console.log(`Received new block from ${ws._socket.remoteAddress}`);
                handleBlock(data.block);
                break;
            case 'TRANSACTION':
                console.log(`Received new transaction from ${ws._socket.remoteAddress}`);
                handleTransaction(data.transaction);
                break;
            default:
                console.log(`Unknown message type received from ${ws._socket.remoteAddress}`);
        }
    } catch (error) {
        console.error(`Error parsing JSON from ${ws._socket.remoteAddress}: `, error);
    }
}

// Función para enviar mensaje a todos los peers conectados
function broadcast(message) {
    const jsonMessage = JSON.stringify(message);
    sockets.forEach(socket => socket.send(jsonMessage));
}

wss.on('connection', (ws) => {
    // Send a "hello" message to the peer
    const helloMessage = JSON.stringify({ type: 'hello', from: 'yourPeerId' });
    ws.send(helloMessage);

    // Listen for messages from the peer
    ws.on('message', (message) => {
        console.log(`Received message from peer ${ws._socket.remoteAddress}: ${message}`);
        const data = JSON.parse(message);
        switch (data.type) {
            case 'hello':
                // Handle hello message from peer
                break;
            case 'block':
                // Handle block message from peer
                handleBlock(data.block);
                break;
            case 'transaction':
                // Handle transaction message from peer
                handleTransaction(data.transaction);
                break;
        }
    });

    ws.on('close', () => {
        console.log(`Peer ${ws._socket.remoteAddress} disconnected`);
    });
});

const handleBlockchainResponse = (data) => {
    const newChain = data.chain;
    if (newChain.length > cutreCoin.chain.length && cutreCoin.validarChain(newChain)) {
        cutreCoin.chain = newChain;
        console.log('Replaced chain with the new chain from peer');
    }
};

const handleTransaction = (transaction) => {
    cutreCoin.agregarTransaction(transaction);
};

const handleBlock = (block) => {
    cutreCoin.agregarBloque(block);
};

app.get('/', (req, res) => {
    res.render('pages/index', { cutreCoin });
});

app.get('/about', (req, res) => {
    res.render('pages/about', { cutreCoin });
});

app.get('/transacciones', (req, res) => {
    res.render('pages/transacciones', { cutreCoin });
});

app.get('/blocks', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const resultBlocks = cutreCoin.chain.slice(startIndex, endIndex);
    res.json({
        page: page,
        limit: limit,
        totalBlocks: cutreCoin.chain.length,
        blocks: resultBlocks
    });
});



app.post('/mineBlock', (req, res) => {
    const newBlock = cutreCoin.minarTransaccionesPendientes(req.body.addressMinero);
    if (newBlock) {
        broadcast({ type: 'BLOCK', block: newBlock });
        res.send(newBlock);
    } else {
        res.status(403).send('Solo los delegados pueden minar bloques.');
    }
});

app.post('/addTransaction', (req, res) => {
    const newTransaction = new Transaction(req.body.fromAddress, req.body.toAddress, req.body.amount, req.body.transacciontituloLibro);
    cutreCoin.agregarTransaction(newTransaction);
    broadcast({ type: 'TRANSACTION', transaction: newTransaction });
    res.send('Transaction added');
});

app.get('/add-peer', (req, res) => {
    res.render('pages/add-peer');
   // res.send(sockets.map(s => s._socket.remoteAddress));
});



app.post('/votar', (req, res) => {
    cutreCoin.votarPorDelegado(req.body.address);
    res.send(`Voto registrado para ${req.body.address}`);
});

app.get('/admin', (req, res) => {
    // Obtener solo números válidos para cantidad
    const ejemplaresPorBloqueData = cutreCoin.chain.map(block => {
        const cantidad = parseInt(block.cantidad);
        return isNaN(cantidad) ? 0 : cantidad; // Si no es un número válido, se reemplaza con 0
    });

    console.log("Ejemplares por bloque:", ejemplaresPorBloqueData);

    res.render('pages/admin', {
        cutreCoin,
        librosPublicados: cutreCoin.librosPublicados(),
        titulosPublicados: cutreCoin.contarEslabones(),
        librosVendidos: cutreCoin.librosVendidos(),
        validarChain: cutreCoin.validarChain(),
        peers: peers,
        ejemplaresPorBloqueData: ejemplaresPorBloqueData
    });
});





app.get('/publicar-libro', (req, res) => {
    res.render('pages/publicar-libro');
});

app.post('/publicar-libro', upload, (req, res) => {
    const { tituloLibro, autorLibro, contenidoLibro, cantidad, delegadoAddress } = req.body;
    const portada = req.file;

    // Check if all required fields are present
    if (!tituloLibro || !autorLibro || !contenidoLibro || !cantidad || !portada) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    // Save the image URL (assuming /uploads is your static path)
    const imageUrl = `/uploads/${portada.filename}`;

    // Create a new Block with the image URL and delegadoAddress (if available)
    const nuevoBloque = new Block(
        cutreCoin.chain.length,
        Date.now(),
        [],
        tituloLibro,
        autorLibro,
        contenidoLibro,
        cantidad,
        cutreCoin.getUltimoBloque().hash,
        delegadoAddress || "",
        imageUrl  // Assign the image URL to the imageUrl property of Block
    );

    // Add the block to the blockchain
    cutreCoin.agregarBloque(nuevoBloque);

    // Respond with success message and the newly created block
    res.json({ message: 'Libro publicado correctamente.', block: nuevoBloque });
});



console.log('P2P server running on port: ' + P2P_PORT);

module.exports = {
    app, 
    HTTP_PORT,
    P2P_PORT,
    peers,
    connectToPeers
};
