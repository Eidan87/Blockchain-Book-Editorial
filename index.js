const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const WebSocket = require('ws');

const Block = require('./block.js');
const Transaction = require('./compradores.js');
const BlockChain = require('./blockchain.js');
const Delegado = require('./delegado.js');

const app = express();
const HTTP_PORT = 3001;
const P2P_PORT = 6001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

let cutreCoin = new BlockChain();

if (fs.existsSync('./test.json')) {
    fs.readFile('./test.json', 'utf-8', function (err, recocadena) {
        if (err) {
            console.log(err);
        } else {
            var chainy = JSON.parse(recocadena);
            for (let i = 1; i < chainy.chain.length; i++) {
                cutreCoin.agregarBloque(new Block(chainy.chain[i].timestamp, chainy.chain[i].transactions, chainy.chain[i].tituloLibro, chainy.chain[i].autorLibro, chainy.chain[i].contenidoLibro, chainy.chain[i].cantidad, chainy.chain[i].hashPrevio));
            }
        }
    });
}

const server = new WebSocket.Server({ port: P2P_PORT });

let sockets = [];

server.on('connection', (ws) => {
    sockets.push(ws);
    ws.on('message', (message) => {
        let data = JSON.parse(message);
        switch (data.type) {
            case 'CHAIN':
                handleBlockchainResponse(data);
                break;
            case 'TRANSACTION':
                handleTransaction(data.transaction);
                break;
            case 'BLOCK':
                handleBlock(data.block);
                break;
        }
    });
});

const connectToPeers = (newPeers) => {
    newPeers.forEach((peer) => {
        const ws = new WebSocket(peer);
        ws.on('open', () => {
            sockets.push(ws);
            console.log(`Connected to peer: ${peer}`);
        });
        ws.on('message', (message) => {
            let data = JSON.parse(message);
            switch (data.type) {
                case 'CHAIN':
                    handleBlockchainResponse(data);
                    break;
                case 'TRANSACTION':
                    handleTransaction(data.transaction);
                    break;
                case 'BLOCK':
                    handleBlock(data.block);
                    break;
            }
        });
    });
};

const broadcast = (message) => {
    sockets.forEach((socket) => socket.send(JSON.stringify(message)));
};

const handleBlockchainResponse = (data) => {
    let newChain = data.chain;
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

// Start HTTP server
app.listen(HTTP_PORT, () => {
    console.log(`Listening on port: ${HTTP_PORT}`);
    connectToPeers(peers);
});

// Define root route
app.get('/', (req, res) => {
    res.render('index', {
        cutreCoin: cutreCoin
    });
});

// Endpoint to view the blockchain
app.get('/blocks', (req, res) => {
    res.send(cutreCoin.chain);
});

// Endpoint to add a new block
app.post('/mineBlock', (req, res) => {
    const newBlock = cutreCoin.minarTransaccionesPendientes(req.body.addressMinero);
    broadcast({ type: 'BLOCK', block: newBlock });
    res.send(newBlock);
});

// Endpoint to add a new transaction
app.post('/addTransaction', (req, res) => {
    const newTransaction = new Transaction(req.body.fromAddress, req.body.toAddress, req.body.amount, req.body.transacciontituloLibro);
    cutreCoin.agregarTransaction(newTransaction);
    broadcast({ type: 'TRANSACTION', transaction: newTransaction });
    res.send('Transaction added');
});

// Endpoint to view the list of peers
app.get('/peers', (req, res) => {
    res.send(sockets.map(s => s._socket.remoteAddress));
});

// Endpoint to connect to a new peer
app.post('/addPeer', (req, res) => {
    connectToPeers([req.body.peer]);
    res.send('Peer added');
});

// votar delegado
app.post('/votar', function (req, res) {
    cutreCoin.votarPorDelegado(req.body.address);
    res.send(`Voto registrado para ${req.body.address}`);
});

// admin
app.get('/admin/', function (req, res) {
    res.render('pages/admin', {
        cutreCoin: cutreCoin,
        tituloLibro: cutreCoin.chain.tituloLibro,
        autorLibro: cutreCoin.chain.autorLibro,
        contenidoLibro: cutreCoin.chain.hash,
        cantidad: cutreCoin.chain.cantidad,
        timestamp: cutreCoin.chain.timestamp,
        validarChain: cutreCoin.validarChain(),
        librosPublicados: cutreCoin.librosPublicados(),
        titulosPublicados: cutreCoin.contarEslabones(),
        librosVendidos: cutreCoin.librosVendidos()
    });
});

module.exports = { Block, BlockChain, Transaction, Delegado, cutreCoin };

console.log('P2P server running on port: ' + P2P_PORT);
