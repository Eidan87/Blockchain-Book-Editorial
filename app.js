const Block = require('./block.js')
const BlockChain = require('./blockchain.js')
const Transaction = require('./compradores.js')

//Iniciar
//function iniciarGenesis(){
let cutreCoin = new BlockChain()
//}

//Publicar libro

//function publicarLibro(){
console.log('Publicando...')
cutreCoin.agregarBloque(new Block(Date.now(), '0', 'Cómo ser CASI un Superheroe', 'Antonimo',  'En este caso, se ha creado un objeto psico-fisico.', 150))
console.log('Publicado!')
//}

//Comprar libro

//function comprarLibro(){
    console.log('Compra de libros y Tranferencia en proceso...')
cutreCoin.agregarTransaction(new Transaction('Antonimo','Pepe', 1, 'Cómo ser CASI un Superheroe'))
cutreCoin.agregarTransaction(new Transaction('Antonimo','Angela', 2, 'Cómo ser CASI un Superheroe'))
cutreCoin.agregarTransaction(new Transaction('Antonimo','Sergei', 3, 'Cómo ser CASI un Superheroe'))

//}

//function minarTransacciones(){
cutreCoin.minarTransaccionesPendientes ('eDitorial')
//}

//function publicarLibro(){
    console.log('Publicando...')
    cutreCoin.agregarBloque(new Block(Date.now(), '0', 'Cómo ser CASI un Superheroe 2', 'Antonimo 2',  'Se ha creado un objeto psico-fisico, bla, bla, bla...', 150))
    console.log('Publicado!')
    //}


console.log('Compra de libros y Tranferencia en proceso...')
cutreCoin.agregarTransaction(new Transaction('Antonimo','Pepe', 1, 'Cómo ser CASI un Superheroe 2'))

//function minarTransacciones(){
    cutreCoin.minarTransaccionesPendientes ('eDitorial')
//}

//Revisar integridad

//function revisarIntegidad(){
console.log('INTEGRIDAD:')
console.log(cutreCoin.validarChain())
//}

//RecorrerCadena
console.log('Libros Publicados en la Chain:')
console.log(cutreCoin.recorrerChain())

//Revisar balances

//function revisarBalances(){
    console.log('El balance de Sergei es ', cutreCoin.getBalanceOfAddress('Sergei'))
    console.log('El balance de Pepe es ', cutreCoin.getBalanceOfAddress('Pepe'))
    console.log('El balance de Angela es ', cutreCoin.getBalanceOfAddress('Angela'))
    console.log('El balance de Editorial es ', cutreCoin.getBalanceOfAddress('Joan'))
    //}

//console.log('Cantidad de libros vendidos en cada bloque:')
//console.log(cutreCoin.librosVendidos())

//Ver Cadena
//function verDadena(){
console.log(JSON.stringify(cutreCoin, null, 4))
//}




