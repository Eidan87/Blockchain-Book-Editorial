var express = require('express');
var app = express();

var bodyParser = require("body-parser");
var router = express.Router();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

const Block = require('./block.js');
const Transaction = require('./compradores.js');
const BlockChain = require('./blockchain.js');
const Delegado = require('./delegado.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use("/", router);

app.use(express.static('public'));

var fs = require('fs');

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

app.set('view engine', 'ejs');

// index page
app.get('/', function (req, res) {
    res.render('pages/index', {
        'cutreCoin': cutreCoin,
        'tituloLibro': cutreCoin.chain.tituloLibro,
        'autorLibro': cutreCoin.chain.autorLibro,
        'contenidoLibro': cutreCoin.chain.contenidoLibro,
        'cantidad': cutreCoin.chain.cantidad,
        'timestamp': cutreCoin.chain.timestamp
    });
});

//leer libro
router.get('/reader/:i', function (req, res) {
    i = Number(req.params.i);
    res.render('pages/reader', {
        'tituloLibro': cutreCoin.chain[i].tituloLibro,
        'autorLibro': cutreCoin.chain[i].autorLibro,
        'contenidoLibro': cutreCoin.chain[i].contenidoLibro
    });
});

// publicar libro
app.get('/publicar-libro', function (req, res) {
    res.render('pages/publicar-libro', {});
});

router.get('/pages/publicar-libro', (req, res) => {
    res.sendFile(__dirname + '/pages/publicar-libro');
    console.log("Index renderizado");
});

app.post('/', function (req, res) {
    res.send('welcome, ' + req.body.autorLibro);
});

router.post('/publicar', function (req, res) {
    cutreCoin.agregarBloque(new Block(Date.now(), [new Transaction(null, req.body.autorLibro, Number(req.body.cantidad), req.body.tituloLibro)], req.body.tituloLibro, req.body.autorLibro, req.body.contenidoLibro, Number(req.body.cantidad)));
    fs.writeFile('./test.json', JSON.stringify(cutreCoin), 'utf-8', function (err) {
        if (err) console.log(err);
        console.log("Libro publicado. Gracias.");
    });
});

// about page
app.get('/about', function (req, res) {
    res.render('pages/about');
});

//transaccion
app.get('/transacciones', function (req, res) {
    res.render('pages/transacciones', {});
});

router.post('/transaccion', function (req, res) {
    cutreCoin.agregarTransaction(new Transaction(req.body.poseedorLibro, req.body.compradorLibro, req.body.cantidad, req.body.tituloLibro));
    cutreCoin.minarTransaccionesPendientes('eDitorial');
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

app.listen(8080);
console.log('8080 is the magic port');
