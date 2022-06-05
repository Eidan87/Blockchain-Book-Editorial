const Block = require('./block')
const Transaction = require('./compradores.js')

class BlockChain {
    constructor(){
        this.chain = [this.crearBloqueGenesis()]
        this.dificultad = 1
        this.pendingTransactions = []
        this.miningReward = 1
    }

    crearBloqueGenesis(){
        return new Block(Date.now(), 'editorialConsenso', 'manifiestoEditorial', 'eDitorial', 'contenidoManifiesto, bla, bla, bla', 1000000, 0)
    }

    getUltimoBloque(){
        return this.chain[this.chain.length - 1]
    }

    agregarBloque(nuevoBloque){
        nuevoBloque.hashPrevio = this.getUltimoBloque().hash
        nuevoBloque.minarBloque(this.dificultad)
        //nuevoBloque.hash = nuevoBloque.calcularHash()
        this.chain.push(nuevoBloque)
    }

    agregarTransaction(transaction) {
        this.pendingTransactions.push(transaction)
    }

    minarTransaccionesPendientes(addressMinero) {
        let block = new Block(Date.now(), this.pendingTransactions, this.tituloLibro)
        block.hashPrevio = this.getUltimoBloque().hash
        block.minarBloque(this.dificultad)

        console.log('Se ha publicado correctamente el bloque de transacciones.')

        this.chain.push(block)

        this.pendingTransactions = [
            new Transaction(null, addressMinero, this.miningReward)
        ]
    }

    getBalanceOfAddress(address) {
        let balance =  JSON.stringify(this.chain[0].tituloLibro)

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address) {
                    balance -= JSON.stringify(trans.transacciontituloLibro)
                }

                if(trans.toAddress === address){
                    balance += JSON.stringify(trans.transacciontituloLibro)
                }

            }
        }

        return balance
    }

    validarChain(){
        for(let i = 1; i<this.chain.length; i++){
            const bloqueActual = this.chain[i]
            const bloqueAnterior = this.chain[i-1]

            if(bloqueActual.hash != bloqueActual.calcularHash()){
                return false
            }

            if(bloqueActual.hashPrevio != bloqueAnterior.hash){
                return false
            }

            return true
    
    
        
    
        }
}

    recorrerChain() {
        for(let i = 0; i<this.chain.length; i++) {
            
            if (this.chain[i].tituloLibro && this.chain[i].autorLibro && this.chain[i].cantidad) {

            console.log("Titulo, autor y ejemplares publicados en este bloque:")
            console.log(JSON.stringify(this.chain[i].tituloLibro))
            console.log(JSON.stringify(this.chain[i].autorLibro))
            console.log(JSON.stringify(this.chain[i].cantidad))
        }

        else {
            
        }

        }
    }

}

module.exports = BlockChain