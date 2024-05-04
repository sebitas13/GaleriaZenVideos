const dbManager = new IndexedDBManager("ListaVideos", 1);
let array_videos = [];

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".loader").style.display = "block";
  // array_imagenes = await dbManager.obtenerParteAlbumPaginada(pagina); Ya no necesario
  renderVideos();
  document.querySelector(".loader").style.display = "none";
});


const renderVideos = async () => {
  let test = await dbManager.obtenerTodo();
  gallery.innerHTML = test
  .map((item) => {
    const videoUrl = URL.createObjectURL(item.url);
    console.log(videoUrl);
    return `
    <div>
      <video id="video-${item.clave}" controls>
        <source src="${videoUrl}" type="video/mp4">
        Tu navegador no soporta la etiqueta de video.
      </video>
      <button onclick="handleDeleteClick('${item.clave}')">Borrar</button>
    </div>
    `;
  })
  .join("");

  // function handleDeleteClick(){
    
  // }

  // Agrega el evento onclick a cada elemento de video
  // test.forEach((item) => {
  //   const videoElement = document.getElementById(`video-${item.clave}`);
  //   videoElement.addEventListener("click", () => {
  //     // Manejar el clic del video aquí
  //     handleZoomItemClick(item.clave, item.url);
  //   });
  // });

};

const handleDeleteClick = (clave) => {

  dbManager.deleteVideoById(clave);
  renderVideos();
}

let pathSelected;
let positionActual;
// const handleZoomItemClick = (clave, url) => {
//   //hacer visible el form
//   console.log(url);
//   pathSelected = clave;
//   imagen_zoom.classList.toggle("visible");
//   imagenZoom.src = url;
   
// };



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
  const file = event.target.files[0]; // Obtén el primer archivo seleccionado (el video)
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(event) {
    const videoDataUrl = event.target.result; // Obtén la URL de datos del video
    await fetch(videoDataUrl)
      .then(response => response.blob())
      .then(videoBlob => {
        // Aquí tienes el Blob del video, ahora puedes guardarlo en IndexedDB
        data = {
          "clave" : generateSecureRandomId(),
          "url" :  videoBlob
        }
        console.log(data);
        console.log('guardado ok');
      })
      .catch(error => {
        console.error('Error al cargar el video:', error);
      });
  };
  reader.readAsDataURL(file); // Lee el archivo como una URL de datos
});

function generateSecureRandomId() {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0].toString(16);
}

// FORMULARIO CONFIRMAR - CANCELAR SUBIR IMAGENES
// uploadForm.addEventListener("submit", async function (event) {
//   event.preventDefault();
//   try {
//     document.querySelector(".loader").style.display = "block";
//     fileInput.value = null;
//     uploadForm.classList.toggle("visible");
//     renderVideos();
//     document.querySelector(".loader").style.display = "none";
//   } catch (error) {
//     console.log(error);
//   }
// });

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

// imageClose.addEventListener("click", () => {
//   imagen_zoom.classList.toggle("visible");
// });

// window.addEventListener("scroll", function () {
//   var header = document.querySelector("header");
//   if (window.scrollY > 100) {
//     header.classList.add("transparente");
//   } else {
//     header.classList.remove("transparente");
//   }
// });


// IMPORTAR

// const actualizarData = async () => {
//   array_imagenes = await dbManager.obtenerTodo();
// };




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
