//block.js
const SHA256 = require('sha256');

class Block {
    constructor(index, timestamp, transactions, tituloLibro, autorLibro, contenidoLibro, cantidad, hashPrevio = '', delegado = '', imageUrl = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.tituloLibro = tituloLibro;
        this.autorLibro = autorLibro;
        this.contenidoLibro = contenidoLibro;
        this.cantidad = cantidad;
        this.hashPrevio = hashPrevio;
        this.comodin = 0;
        this.hash = this.calcularHash();
        this.delegado = delegado;
        this.imageUrl = imageUrl; // Nuevo campo para la URL de la imagen
    }

    calcularHash() {
        return SHA256(
            this.index + this.timestamp + this.transactions +
            this.tituloLibro + this.autorLibro + JSON.stringify(this.contenidoLibro) +
            this.hashPrevio + this.cantidad + this.comodin + this.imageUrl // Incluye imageUrl en el hash
        ).toString();
    }

    minarBloque(dificultad) {
        while (this.hash.substring(0, dificultad) !== Array(dificultad + 1).join('0')) {
            this.comodin++;
            this.hash = this.calcularHash();
        }
    }
}

module.exports = Block;
