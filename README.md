<h1>Welcome to BookChain!</h1>

At BookChain, we believe that information is a fundamental human right and that knowledge should be shared with everyone. Our goal is to create a decentralized platform that allows anyone to safely publish, buy, and sell books without unnecessary intermediaries.

By removing intermediaries, we can reduce costs and increase efficiency, which will allow more people to access books. Additionally, by using blockchain technology, we can ensure the security and integrity of transactions, which in turn fosters trust among users.

We want to empower authors and readers, allowing them to interact directly with each other, while ensuring that authors receive fair compensation for their work. This also ensures that readers can obtain the books they want at a fair price and without geographic restrictions.

At BookChain, we believe that education is the key to improving our lives and our world, and we are committed to making knowledge more accessible and affordable for everyone.

Join us on this mission to build a more just and equitable future for all, a future where knowledge is truly free. Join BookChain today!

For initialize with node.js need to write in terminal the following command: 
node index.js

![8eb43910-2a78-47cd-abd3-a454843355a8](https://user-images.githubusercontent.com/42222419/221434229-52a87d1d-7ecd-47ba-8a95-e7fa798a87d9.jpeg)

![f808c0b7-6a84-470c-aa60-4e67416f5782](https://user-images.githubusercontent.com/42222419/221434231-3083fcca-235d-4a3b-b35a-8ae367645b47.jpeg)

<h2>Explanation:</h2>

This is a blockchain implementation in Node.js that includes a Block class, a Transaction class, and a Blockchain class.

The Block class has properties such as timestamp, transactions, tituloLibro, autorLibro, contenidoLibro, cantidad, hashPrevio, comodin, and hash. The Transaction class has properties such as fromAddress, toAddress, amount, and transacciontituloLibro. The Blockchain class has an array of blocks, a difficulty level, an array of pending transactions, and a mining reward.

The Blockchain class has methods such as crearBloqueGenesis, getUltimoBloque, agregarBloque, agregarTransaction, minarTransaccionesPendientes, getBalanceOfAddress, numerocopias, validarChain, recorrerChain, and librosPublicados.

The crearBloqueGenesis method creates the first block in the blockchain, which includes a transaction where the Editorial creates a book.

The getUltimoBloque method returns the last block in the blockchain.

The agregarBloque method adds a new block to the blockchain by mining it and setting its hashPrevio property to the hash of the last block in the blockchain.

The agregarTransaction method adds a new transaction to the array of pending transactions.

The minarTransaccionesPendientes method mines the pending transactions and adds them to a new block in the blockchain.

The getBalanceOfAddress method returns the balance of a given address by iterating over all the blocks in the blockchain and summing up the amounts of all transactions where the given address is the sender or the recipient.

The numerocopias method returns the number of copies of a book owned by a given address by iterating over all the blocks in the blockchain and summing up the amounts of all transactions where the given address is the recipient of the book.

The validarChain method checks if the blockchain is valid by iterating over all the blocks in the blockchain and comparing their hashes and hashPrevio properties.

The recorrerChain method logs the titles, authors, and quantities of all the books published in the blockchain.

The librosPublicados method returns an object that summarizes the number of copies of each book published in the blockchain.

