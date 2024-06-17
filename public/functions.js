var apiUrl = "http://localhost:8080/api/";
var token = "";

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
        token = responseContent.token;
        printResponse.style.color = "green";
        printResponse.textContent = "Connexion réussie";
    } else {
        printResponse.style.color = "red";
        printResponse.textContent = "Identifiant ou mot de passe incorrect";
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
