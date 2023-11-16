//index2.js

const SHA256 = require('sha256');

class Bloque {
    constructor(libro, resena, bloqueAnteriorHash) {
      this.libro = libro;
      this.resena = resena;
      this.bloqueAnteriorHash = bloqueAnteriorHash;
      this.timestamp = new Date();
      this.hash = this.calcularHash();
    }
  
    calcularHash() {
      return SHA256(
        this.libro.titulo +
        this.libro.autor +
        this.libro.isbn +
        this.libro.fechaPublicacion +
        JSON.stringify(this.resena) +
        this.bloqueAnteriorHash +
        this.timestamp
      ).toString();
    }
  }
  
  class LibroBase {
    constructor(
      titulo,
      autor,
      contenidoHTML,
      numeroEjemplares,
      idioma,
      isbn,
      genero,
      editorial,
      fechaPublicacion,
      formato
    ) {
      this.titulo = titulo;
      this.autor = autor;
      this.contenidoHTML = contenidoHTML;
      this.numeroEjemplares = numeroEjemplares;
      this.idioma = idioma;
      this.isbn = isbn;
      this.genero = genero;
      this.editorial = editorial;
      this.fechaPublicacion = fechaPublicacion;
      this.formato = formato;
      this.timestamp = new Date();
      this.hash = this.calcularHash();
    }
  
    calcularHash() {
      return SHA256(
        this.titulo +
        this.autor +
        this.isbn +
        this.fechaPublicacion +
        this.timestamp
      ).toString();
    }
  }
  
  class BookChain {
    constructor() {
      this.hilos = {}; // Cada hilo representa un libro
    }
  
    agregarLibro(libro) {
      if (!this.hilos[libro.titulo]) {
        this.hilos[libro.titulo] = [];
        const bloqueGenesis = new Bloque(libro, null, null);
        this.hilos[libro.titulo].push(bloqueGenesis);
      }
    }
  
    agregarBloque(libro, resena) {
      if (this.hilos[libro.titulo]) {
        const hiloActual = this.hilos[libro.titulo];
        const bloqueAnterior = hiloActual[hiloActual.length - 1];
        const nuevoBloque = new Bloque(libro, resena, bloqueAnterior.hash);
        hiloActual.push(nuevoBloque);
      } else {
        console.log("El libro no existe en la cadena.");
      }
    }
  }
  
  // Ejemplo de uso
  const bookChain = new BookChain();
  
  const libroInicial = new LibroBase(
    "Introducción a la Programación",
    "John Doe",
    "<p>Contenido del libro...</p>",
    1000,
    "Español",
    "123456789",
    "Informática",
    "Editorial ABC",
    "01/01/2023",
    "Digital"
  );
  
  bookChain.agregarLibro(libroInicial);
  
  const resenaBloque1 = {
    usuario: "Usuario1",
    comentario: "Excelente libro, muy recomendado.",
    calificacion: 5
  };
  
  bookChain.agregarBloque(libroInicial, resenaBloque1);
  
  const resenaBloque2 = {
    usuario: "Usuario2",
    comentario: "La segunda mitad del libro es aburrida.",
    calificacion: 3
  };
  
  bookChain.agregarBloque(libroInicial, resenaBloque2);
  
  // Crear más libros y resenas
  const libroProgramacion = new LibroBase(
      "Programación Avanzada",
      "Jane Smith",
      "<p>Contenido del libro...</p>",
      800,
      "Inglés",
      "987654321",
      "Informática",
      "Editorial XYZ",
      "15/03/2022",
      "Digital"
    );
    
    const libroHistoria = new LibroBase(
      "Historia del Mundo",
      "David Johnson",
      "<p>Contenido del libro...</p>",
      1200,
      "Español",
      "111222333",
      "Historia",
      "Editorial ABC",
      "05/05/2022",
      "Impreso"
    );
    
    bookChain.agregarLibro(libroProgramacion);
    bookChain.agregarLibro(libroHistoria);
    
    // resenas futuras para los libros
    const resenaFuturaProgramacion = {
      usuario: "FuturoUsuario1",
      comentario: "Estoy emocionado por leer este libro.",
      calificacion: 4
    };
    
    bookChain.agregarBloque(libroProgramacion, resenaFuturaProgramacion);
    
    const resenaFuturaHistoria = {
      usuario: "FuturoUsuario2",
      comentario: "Espero que este libro sea tan bueno como dicen.",
      calificacion: 5
    };
    
    bookChain.agregarBloque(libroHistoria, resenaFuturaHistoria);
    
  // Mostrar la cadena de bloques resultante
  console.log(bookChain.hilos);
  
  // Función para mostrar la información de los bloques internos
  function mostrarInformacionBloques(bookChain) {
      for (const libro in bookChain.hilos) {
        console.log(`Libro: ${libro}`);
        console.log("Bloques:");
        bookChain.hilos[libro].forEach((bloque, index) => {
          console.log(`  Bloque ${index + 1}:`);
          console.log("    Libro:", bloque.libro);
          console.log("    Reseña:", bloque.resena);
          console.log("    Bloque Anterior Hash:", bloque.bloqueAnteriorHash);
          console.log("    Timestamp:", bloque.timestamp);
          console.log("    Hash:", bloque.hash);
          console.log("\n");
        });
      }
    }
    
    // Mostrar la información de los bloques internos
    mostrarInformacionBloques(bookChain);
  
    console.log(bookChain)
