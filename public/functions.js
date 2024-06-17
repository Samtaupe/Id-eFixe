var apiUrl = "http://localhost:8080/api/";

/** Appel l'api pour récupérer un token et le stocker dans le localstorage */
async function connexion() {
    let login = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    if (!login || !password) {
        alert("Vous devez entrer un nom d'utilisateur et un mot de passe pour vous connecter");
        return;
    }

    let datas = new FormData();
    datas.append("email", login);
    datas.append("pass", password);

    let response = await fetch(apiUrl + "login", {
        method: "POST",
        body: datas
    });

    let responseContent = await response.json();
    let printResponse = document.getElementById('responseConnexion');
    if (responseContent.token) {

        localStorage.setItem('token', responseContent.token);
        let printResponse = document.getElementById('responseConnexion');

        printResponse.style.color = "green";
        printResponse.textContent = "Connexion réussie";
    } else {
        printResponse.style.color = "red";
        printResponse.textContent = "Identifiant ou mot de passe incorrect";
    }
}

/** ouvre l'explorateur pour choisir un fichier et le stocke dans le local storage */ 
function chooseImage() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png, .jpg, .jpeg';
    input.click();
    input.addEventListener("change", async function(e) {
        if (e.target.files[0]) {
            const file = e.target.files[0];

            const reader = new FileReader();
            reader.onload = function(e) {
                let fileContent = e.target.result;
                // Stocker l'image dans le local storage sous le nom de image
                localStorage.setItem('image', fileContent);
            };
            reader.readAsDataURL(file);

            window.location.href = "./select-image.html";
        }
    })
}

/** Affiche l'image stockée dans le local storage */
function displaySelectedImage() {
    let image = document.getElementById('imgSelected');
    image.src = localStorage.getItem('image');
    console.log(localStorage.getItem('image'));
}

/** envoie l'image choisie */
async function makeGuess() {
    let image = localStorage.getItem('image');

    // Convertir l'URL de données base64 en un Blob
    const byteCharacters = atob(image.split(',')[1]);
    const extension = image.split(',')[0].split(':')[1].split(';')[0];

    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: extension});
    console.log(blob);
    
    let formData = new FormData();
    
    formData.append("guessimage", blob);

    let response = await fetch(apiUrl + "guesses", {
        method: "POST", 
        body: formData
    });

    let responseContent = await response.json();
    if (responseContent) {
        console.log(responseContent);
    } 
}

////////////// GESTION DE LA CAMERA ///////////////

function startCamera() {
    const video = document.getElementById('cameraVideo');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.error("Erreur d'accès à la caméra : ", err);
        });
}

function stopCamera() {
    const video = document.getElementById('cameraVideo');
    if (video.srcObject) {
        let tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
}

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('captureCanvas');
    const context = canvas.getContext('2d');

    // Ajuste la taille du canvas à la taille de la vidéo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    console.log(dataURL);

    // Afficher la photo capturée dans l'élément img
    const photo = document.getElementById('capturedPhoto');
    photo.src = dataURL;
    photo.style.display = 'block';
    video.style.display = 'none';
}

function resetModal() {
    const video = document.getElementById('cameraVideo');
    const photo = document.getElementById('capturedPhoto');
    video.style.display = 'block';
    photo.style.display = 'none';
    photo.src = '';
}

// Écouter l'événement de la modale pour réinitialiser lorsque la modale est ouverte
document.getElementById('cameraModal').addEventListener('shown.bs.modal', resetModal);
