const SHA256 = require('sha256')

class Block {
    constructor(timestamp, transactions, tituloLibro, autorLibro, contenidoLibro, cantidad, hashPrevio=''){
        this.timestamp = timestamp
        this.transactions = transactions
        this.tituloLibro = tituloLibro
        this.autorLibro = autorLibro
        this.contenidoLibro = contenidoLibro
        this.cantidad = cantidad
        this.hashPrevio = hashPrevio
        this.comodin = 0
        this.hash = this.calcularHash()
    }

calcularHash(){
    return SHA256(this.timestamp + this.transactions + this.tituloLibro + this.autorLibro + JSON.stringify(this.contenidoLibro) + this.hashPrevio + this.cantidad + this.comodin).toString()
}

minarBloque(dificultad){
    while(this.hash.substring(0, dificultad) !== Array(dificultad+1).join('0')){
        this.comodin++
        this.hash = this.calcularHash()
    }  
    //console.log('Bloque de transacciones o publicación publicado!!!: ' + this.hash)
}

}

module.exports = Block