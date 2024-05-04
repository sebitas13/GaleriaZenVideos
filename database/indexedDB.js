class IndexedDBManager {
  constructor(databaseName, version) {
    this.indexedDB = window.indexedDB;
    this.db = null;
    this._databaseName = databaseName;
    this._version = version;
    const connection = this.indexedDB.open(databaseName, version);

    connection.onsuccess = () => {
      this.db = connection.result;
      console.log("BD videos abierta", this.db);
    };

    //Esto se activa cuando lo incrementas de version
    //if you created a new collection, you must increase the number of version.
    connection.onupgradeneeded = (e) => {
      this.db = e.target.result;
      console.log("BD videos creada", this.db);
      this.db.createObjectStore("videos", { keyPath: "clave" });
    };

    connection.onerror = (error) => {
      console.error("Error:", error);
    };
  }

  agregar = (video) => {
    if (!this.db) {
      console.error("Error: Base de datos no está disponible aún");
      return;
    }

    const transaction = this.db.transaction(["videos"], "readwrite");
    const objectStore = transaction.objectStore("videos");
    const request = objectStore.add(video);

    request.onsuccess = () => {
      console.log("Video guardado correctamente");
      // this.consultar();
    };

    request.onerror = (error) => {
      console.error("Error al agregar elemento:", error);
    };
  };

  obtenerTodo = () => {
    return new Promise((resolve, reject) => {
      const connection = this.indexedDB.open(
        this._databaseName,
        this._databaseNameversion
      );

      connection.onsuccess = () => {
        const db = connection.result;
        const transaction = db.transaction(["videos"], "readonly");
        const objectStore = transaction.objectStore("videos");
        const cursorRequest = objectStore.openCursor();
        const result = [];

        cursorRequest.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            result.push(cursor.value);
            cursor.continue(); // Continúa con el siguiente objeto
          } else {
            resolve(result);
          }
        };

        cursorRequest.onerror = (event) => {
          reject(event.target.error);
        };
      };

      connection.onerror = (error) => {
        reject(error);
      };
    });
  };

  deleteVideoById = (clave) => {
    const trasaccion = this.db.transaction(["videos"], "readwrite");
    const coleccionObjetos = trasaccion.objectStore("videos");
    const conexion = coleccionObjetos.delete(clave);

    conexion.onsuccess = () => {
      // this.consultar();
    };

    conexion.onerror = (error) => {
      console.error("Error al eliminar video:", error);
    };
  };

  exportar = () => {
    document.querySelector(".loader").style.display = "block";
    const transactionAlbum = this.db.transaction(["videos"], "readonly");
    const videoStore = transactionAlbum.objectStore("videos");
  
    const obtenerVideos = new Promise((resolve, reject) => {
      const conexionVideo = videoStore.openCursor();
      const arrayVideo = [];
      conexionVideo.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          arrayVideo.push(cursor.value);
          cursor.continue();
        } else {
          resolve(arrayVideo);
        }
      };
    });
  
    Promise.all([obtenerVideos])
      .then(([arrayVideo]) => {
        // Mapea los datos para incluir solo las claves o IDs de los blobs
        const arrayVideosExport = arrayVideo.map(video => ({ clave: video.clave }));
        const objExport = {
          arrayVideos: arrayVideosExport,
        };
        this.descargarArrayJson(objExport);
        document.querySelector(".loader").style.display = "none";
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };
  


  descargarArrayJson = (array) => {
    // Convertir el arreglo a JSON

    const jsonArreglo = JSON.stringify(array);
    const enlace = document.createElement("a");
    const blob = new Blob([jsonArreglo], { type: "application/json" });
    enlace.href = URL.createObjectURL(blob);
    enlace.download = "videoData.json";
    enlace.click();
  };

  importar = (datos) => {
    this.addAlbumsArray(datos.arrayAlbums); //AgregarAlbumes
    this.agregarImagenesAlbum(datos.arrayImages); //Agregar imagenes
  };

}
