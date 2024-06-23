//blockchain.js
const fs = require('fs');
const Block = require('./block');
const Transaction = require('./transaction');
const Delegado = require('./delegado');

class BlockChain {
    constructor() {
        this.chain = [this.crearBloqueGenesis()];
        this.dificultad = 1;
        this.pendingTransactions = [];
        this.miningReward = 1;
        this.delegados = [];
        this.maxDelegados = 21;
    }

    crearBloqueGenesis() {
        return new Block(
            0, Date.now(), [new Transaction(null, 'eDitorial', "1", 'manifiestoEditorial')], 
            'manifiestoEditorial', 'eDitorial', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', 
            1, '0', '', "uploads/imagenManifiesto.jpg"
        );
    }

    getUltimoBloque() {
        return this.chain[this.chain.length - 1];
    }

    agregarBloque(nuevoBloque) {
        if (this.libroExiste(nuevoBloque.tituloLibro, nuevoBloque.autorLibro)) {
            console.log('El libro ya ha sido publicado.');
            return false;
        }
        nuevoBloque.hashPrevio = this.getUltimoBloque().hash;
        nuevoBloque.minarBloque(this.dificultad);
        this.chain.push(nuevoBloque);
        this.saveChain(); // Guardar la cadena de bloques después de añadir un nuevo bloque
        return true;
    }

    agregarTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    minarTransaccionesPendientes(addressMinero) {
        const delegado = this.delegados.find(d => d.address === addressMinero);
        if (!delegado) {
            console.log('Solo los delegados pueden minar bloques.');
            return null;
        }

        const block = new Block(Date.now(), this.pendingTransactions, '', '', '', 0, this.getUltimoBloque().hash, delegado.address);
        block.minarBloque(this.dificultad);

        console.log('Se ha publicado correctamente el bloque de transacciones.');
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, addressMinero, this.miningReward)
        ];

        this.saveChain();
        return block;
    }

    esDelegado(address) {
        return this.delegados.some(delegado => delegado.address === address);
    }

    votarPorDelegado(address) {
        let delegado = this.delegados.find(d => d.address === address);
        if (delegado) {
            delegado.votos++;
        } else {
            this.delegados.push(new Delegado(address, 1));
        }
        this.actualizarDelegados();
    }

    actualizarDelegados() {
        this.delegados.sort((a, b) => b.votos - a.votos);
        this.delegados = this.delegados.slice(0, this.maxDelegados);
    }

    getBalanceOfAddress(address) {
        let balance = [];

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance.push('------- VENTA -------', -trans.amount, trans.transacciontituloLibro, trans.toAddress, 'de', address, '--------------------', '');
                }

                if (trans.toAddress === address) {
                    balance.push('++++++ COMPRA ++++++', +trans.amount, trans.transacciontituloLibro, trans.fromAddress, 'de', address, '--------------------', '');
                }
            }
        }

        return balance;
    }

    numerocopias(address) {
        let numeroEjemplares = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.toAddress === address) {
                    numeroEjemplares += trans.amount;
                    console.log('Ejemplar/es transferidos:', trans.transacciontituloLibro, trans.amount, 'Uds');
                }

                if (trans.fromAddress === address) {
                    numeroEjemplares -= trans.amount;
                }
            }
        }

        return numeroEjemplares;
    }

    validarChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const bloqueActual = this.chain[i];
            const bloqueAnterior = this.chain[i - 1];

            if (bloqueActual.hash !== bloqueActual.calcularHash() || bloqueActual.hashPrevio !== bloqueAnterior.hash) {
                return false;
            }
        }
        return true;
    }

    recorrerChain() {
        for (const block of this.chain) {
            if (block.tituloLibro && block.autorLibro && block.cantidad) {
                console.log("Titulo, autor y ejemplares publicados en este bloque:");
                console.log(block.tituloLibro);
                console.log(block.autorLibro);
                console.log(block.cantidad);
            }
        }
    }

    librosPublicados() {
        return this.chain.reduce((total, block) => total + (Number(block.cantidad) || 0), 0);
    }

    librosTransferidos() {
        return this.chain.reduce((total, block) => total + block.transactions.reduce((sum, trans) => sum + (Number(trans.amount) || 0), 0), 0);
    }

    librosVendidos() {
        const transferidos = this.librosTransferidos();
        return transferidos;
    }

    contarEslabones() {
        return this.chain.length;
    }

    libroExiste(tituloLibro, autorLibro) {
        return this.chain.some(block => block.tituloLibro === tituloLibro && block.autorLibro === autorLibro);
    }

    // Método para guardar cada bloque como archivo JSON
    saveChain() {
        this.chain.forEach(block => {
            const filename = `./uploads/block_${block.index}.json`;
            fs.writeFile(filename, JSON.stringify(block), (err) => {
                if (err) {
                    console.error(`Error saving block ${block.index}: `, err);
                } else {
                    console.log(`Block ${block.index} saved successfully.`);
                }
            });
        });
    }
}

module.exports = BlockChain;
