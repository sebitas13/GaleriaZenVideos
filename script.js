const dbManager = new IndexedDBManager("ListaVideos", 1);
let array_videos = [];

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".loader").style.display = "block";
  renderVideos();
  document.querySelector(".loader").style.display = "none";
});


const renderVideos = async () => {
  array_videos= await dbManager.obtenerTodo();
  gallery.innerHTML = array_videos
  .map((item) => {
    if (item.hasOwnProperty("image")){
      return `
    <div>
        <video poster="${item.image}" muted  controls>
          <source src="data:video/mp4;base64,${item.url}">
          Tu navegador no soporta la etiqueta de video.
        </video>
        <button onclick="resetVideo()">Restablecer</button>
        <button onclick="handleDeleteClick('${item.clave}')">Borrar</button>
        <input type="file" onchange="handlePreviewChange(event, '${item.clave}','${item.url}')" name="previewFile" accept="image/*" >
      </div>
    `;
    }else{
      return `
      <div>
        <video  muted  controls>
          <source src="data:video/mp4;base64,${item.url}">
          Tu navegador no soporta la etiqueta de video.
        </video>
        <button onclick="resetVideo()">Restablecer</button>
        <button onclick="handleDeleteClick('${item.clave}')">Borrar</button>
        <input type="file" onchange="handlePreviewChange(event, '${item.clave}','${item.url}')" name="previewFile" accept="image/*" >
      </div>
    `;
    }
    
  })
  .join("");

};

function resetVideo(videoId, posterUrl="") {
    renderVideos();
}


const handlePreviewChange = async (event,clave,url) =>{
  const file = event.target.files[0]; 
  if(!file) return;
  const base64Image = await convertirArchivoAURLBase64(file);
  const data = {
    "clave" : clave,
    "url" : url,
    "image" : base64Image
  }
  dbManager.actualizar(data)
  renderVideos();
}

const handleDeleteClick = (clave) => {

  if(confirm("Seguro?")){
    dbManager.deleteVideoById(clave);
    renderVideos();
  }else{

  }
}


//GUARDAR IMAGENES AL CARGARLOS

document.getElementById("icon_add").addEventListener("click",()=>{
  uploadForm.classList.toggle("visible");
 
  // renderVideos();
})


document.getElementById('uploadForm').addEventListener('submit', function(event) {
  event.preventDefault();
  dbManager.agregar(data);
  uploadForm.classList.toggle("visible");
  renderVideos();
});

let data;
fileInput.addEventListener("change", async function (event) {
  const files = event.target.files; 
  let arrayBuffer= "";
  let base64String="";
  let base64Image="";
  if (!files) return;

  try {
      
    for (const file of files) {
      if (file.type.includes("video")) {
         arrayBuffer = await  readFileAsArrayBuffer(file);
         base64String = arrayBufferToBase64(arrayBuffer);
      } else if (file.type.includes("image")) {
         base64Image = await convertirArchivoAURLBase64(file);
      }
    }
  
    data = {
      "clave" : generateSecureRandomId(),
      "url" :   base64String,
      "image" : base64Image
    }

  } catch (error) {
      console.error(error);
  } 

});

function convertirArchivoAURLBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); 
    reader.onload = function() {
      resolve(reader.result);
    };
    reader.onerror = function(error) {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}


// Función para leer un archivo como ArrayBuffer
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
}

// Función para convertir un ArrayBuffer en una cadena base64
function arrayBufferToBase64(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function generateSecureRandomId() {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0].toString(16);
}


//SALIR

btnSalir.addEventListener("click", () => {
  
  fileInput.value = null;
  uploadForm.classList.toggle("visible");
});


columnas.addEventListener("input", () => {
  {
    const numColumnas = parseInt(columnas.value);
    gallery.style.gridTemplateColumns = `repeat(${numColumnas}, minmax(250px, 1fr))`;
  }
});

function guardarAlbum(){
  dbManager.exportar();
}



// IMPORTAR

function readerVideo(archivo){
  const lector = new FileReader();

  return new Promise((resolve, reject) => {
    lector.onload = function () {
      const datos = JSON.parse(lector.result);
      resolve(datos);
    };

    lector.onerror = function (error) {
      reject(error);
    };

    lector.readAsText(archivo);
  });
  
}


fileInputI.addEventListener("change", async function (event) {
  const archivo = event.target.files[0];
  document.querySelector(".loader").style.display = "block";

  try {
    const videoData = await readerVideo(archivo)
    dbManager.importar(videoData);
    renderVideos();
  } catch (error) {
    console.error("Error al leer el archivo",error);
  } finally{
    document.querySelector(".loader").style.display = "none";
    fileInputI.value = null;
  }
    
});

function deleteAll(){
  if( confirm("Se perderan todos los videos, procure exportarlos antes")){
    dbManager.deleteAllvideos();
    renderVideos();
  }
}

// PAGINACION
// let pagina = 1;
// imagenes.addEventListener("input", () => {
//   {
//     pagina = parseInt(imagenes.value);
//     document.querySelector(".loader").style.display = "block";
//     setTimeout(async () => {
//       array_imagenes = await dbManager.obtenerParteAlbumPaginada(pagina,cantidadSeleccionada);
//       renderVideos();
//       document.querySelector(".loader").style.display = "none";
//       cargar = false;
//     }, 1000);
//   }
// });
