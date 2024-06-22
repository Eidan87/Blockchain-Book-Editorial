const Block = require('./block');
const Transaction = require('./compradores.js');
const Delegado = require('./delegado'); // Importar la clase Delegado

class BlockChain {
    constructor() {
        this.chain = [this.crearBloqueGenesis()];
        this.dificultad = 1;
        this.pendingTransactions = [];
        this.miningReward = 1;
        this.delegados = []; // Lista de delegados
        this.maxDelegados = 21; // Número máximo de delegados
    }

    crearBloqueGenesis() {
        return new Block(1676538545814, [new Transaction(null, 'eDitorial', 1, 'manifiestoEditorial')], 'manifiestoEditorial', 'eDitorial', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.', 1, 0);
    }

    getUltimoBloque() {
        return this.chain[this.chain.length - 1];
    }

    agregarBloque(nuevoBloque) {
        nuevoBloque.hashPrevio = this.getUltimoBloque().hash;
        nuevoBloque.minarBloque(this.dificultad);
        this.chain.push(nuevoBloque);
    }

    agregarTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    minarTransaccionesPendientes(addressMinero) {
        if (!this.esDelegado(addressMinero)) {
            console.log('Solo los delegados pueden minar bloques.');
            return;
        }
        let block = new Block(Date.now(), this.pendingTransactions);
        block.hashPrevio = this.getUltimoBloque().hash;
        block.minarBloque(this.dificultad);

        console.log('Se ha publicado correctamente el bloque de transacciones.');

        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, addressMinero, this.miningReward)
        ];
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
        let ejemplarTransferido = '';
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.toAddress === address) {
                    numeroEjemplares += trans.amount;
                    ejemplarTransferido = 'Ejemplar/es transferidos: ' + trans.transacciontituloLibro + ': ' + trans.amount + 'Uds ';
                    console.log(JSON.stringify(ejemplarTransferido));
                }

                if (trans.fromAddress === address) {
                    numeroEjemplares -= trans.amount;
                    ejemplarTransferido = trans.transacciontituloLibro;
                }
            }
        }

        return numeroEjemplares;
    }

    validarChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const bloqueActual = this.chain[i];
            const bloqueAnterior = this.chain[i - 1];

            if (bloqueActual.hash != bloqueActual.calcularHash()) {
                return false;
            }

            if (bloqueActual.hashPrevio != bloqueAnterior.hash) {
                return false;
            }

            return true;
        }
    }

    recorrerChain() {
        for (let i = 0; i < this.chain.length; i++) {
            if (this.chain[i].tituloLibro && this.chain[i].autorLibro && this.chain[i].cantidad) {
                console.log("Titulo, autor y ejemplares publicados en este bloque:");
                console.log(JSON.stringify(this.chain[i].tituloLibro));
                console.log(JSON.stringify(this.chain[i].autorLibro));
                console.log(JSON.stringify(this.chain[i].cantidad));
            }
        }
    }

    librosPublicados() {
        let total1 = 0;
        for (let i = 0; i < this.chain.length; i++) {
            if (this.chain[i].cantidad) {
                total1 += Number(this.chain[i].cantidad);
            }
        }
        return total1;
    }

    librosTransferidos() {
        let total2 = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.amount != undefined) {
                    total2 += Number(trans.amount);
                }
            }
        }
        return total2;
    }

    librosVendidos() {
        let totalVendidos = 0;
        let total3 = 0;
        let total4 = 0;

        for (let i = 0; i < this.chain.length; i++) {
            if (this.chain[i].cantidad) {
                total3 += Number(this.chain[i].cantidad);
            }
        }

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.amount != undefined) {
                    total4 += Number(trans.amount);
                }
            }
        }

        totalVendidos = total4 - total3;

        return totalVendidos;
    }

    contarEslabones() {
        let counterEslabones = 0;
        for (let i = 0; i < this.chain.length; i++) {
            counterEslabones++;
        }
        return counterEslabones;
    }
}

module.exports = BlockChain;
