var apiUrl = "http://localhost:8080/api/";
var token = "";
var selectedImage;

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
        token = responseContent.token;
        let printResponse = document.getElementById('responseConnexion');
        printResponse.style.color = "green";
        printResponse.textContent = "Connexion réussie";
    } else {
        let printResponse = document.getElementById('responseConnexion');
        printResponse.style.color = "red";
        printResponse.textContent = "Identifiant ou mot de passe incorrect";
    }
}

function chooseImage() {
    var input = document.createElement('input');
    input.type = 'file';
    input.click();
    input.addEventListener("change", function(e) {
        if (e.target.files[0]) {
            selectedImage = e.target.files[0];
            window.location.href = "./select-image.html";
        }
    })
}

function displaySelectedImage() {
    console.log(selectedImage);
}