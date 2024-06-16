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
    if (responseContent.token) {
        localStorage.setItem('token', responseContent.token);
        let printResponse = document.getElementById('responseConnexion');
        printResponse.style.color = "green";
        printResponse.textContent = "Connexion réussie";
    } else {
        let printResponse = document.getElementById('responseConnexion');
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
    let byteString = atob(image.split(',')[1]);
    let imageType = image.split(',')[0].split(':')[1].split(';')[0];
    let blob = new Blob([new ArrayBuffer(atob(image.split(',')[1]).length)], {type: imageType});
    
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