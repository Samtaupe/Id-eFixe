var apiUrl = "http://localhost:8080/";

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

    let response = await fetch(apiUrl + "api/login", {
        method: "POST",
        body: datas
    });

    let responseContent = await response.json();
    let printResponse = document.getElementById('responseConnexion');
    if (responseContent.token) {

        localStorage.setItem('token', responseContent.token);

        printResponse.style.color = "green";
        printResponse.textContent = "Connexion réussie";

        setTimeout(() => {  
            window.location.replace("index.html");
        }, 2000);

        console.log("Connexion réussi !");
    } 
    else 
    {
        printResponse.style.color = "red";
        printResponse.textContent = "Identifiant ou mot de passe incorrect";

        console.log("Connexion échoué...");
    }
}

/** ouvre l'explorateur pour choisir un fichier puis le traite */ 
function chooseImage() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png, .jpg, .jpeg';
    input.click();
    input.addEventListener("change", async function(e) {
        if (e.target.files[0]) {
            let file = e.target.files[0];
            
            let reader = new FileReader();
            reader.onload = function(e) {
                let fileContent = e.target.result;
                // Stocker l'image dans le local storage sous le nom de image
                localStorage.setItem('last-image', fileContent);
            };
            reader.readAsDataURL(file);
            await replaceBodyByImageChosen();

            document.getElementById('chooseImage').onclick = async function () {
                await makeGuess(file);
                window.location.href = "./result.html";
            }
        }
    })
}

/** remplace le body de la page d'acceuil par l'image choisie */
async function replaceBodyByImageChosen() {
    await fetch('component/select-image.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('card-content').innerHTML = data;
    });
    await fetch('component/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
    });
    displaySelectedImage();
}

/** Affiche l'image choisie dans l'explorateur */
function displaySelectedImage() {
    let image = document.getElementById('imgSelected');
    image.src = localStorage.getItem('last-image');
}

/** Rempli le contenu de la page de résultat */
function fillResult() {
    displaySelectedImage();
    document.getElementById('result').innerHTML = " Vous avez trouvé " + localStorage.getItem("last-guess");
}

/** envoie l'image choisie */
async function makeGuess(file) {
    var formData = new FormData();
    
    formData.append("guessimage", file);

    let response = await fetch(apiUrl + "api/guesses", {
        method: "POST", 
        body: formData
    });

    let responseContent = await response.json();
    if (responseContent) {
        localStorage.setItem('last-guess', responseContent.guess);
        localStorage.setItem('last-guess-id', responseContent.id);
    } 
}

/** Envoie les résultats à l'api */
async function pushResult(result) {
    await fetch(apiUrl + "api/guesses/" + localStorage.getItem("last-guess-id"), {
        method: "PUT", 
        headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({
            "win": result
        })
    });
    
    // message de confirmation 
    let card = document.getElementById('result-block');
    let success_message = document.createElement('div');
    success_message.innerHTML = " <div class='alert alert-success' role='alert'>Résultat enregistré</div>";
    card.appendChild(success_message);

    // cache le message au bout de 2.5s
    setTimeout(function() {
        document.querySelector('.alert').remove();
    }, 2500);
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

async function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('captureCanvas');
    const context = canvas.getContext('2d');

    // Ajuste la taille du canvas à la taille de la vidéo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');

    // Afficher la photo capturée dans l'élément img
    /**const photo = document.getElementById('capturedPhoto');
    photo.src = dataURL;
    photo.style.display = 'block';
    video.style.display = 'none';*/
    localStorage.setItem('last-image', dataURL);
    await replaceBodyByImageChosen();

    document.getElementById('chooseImage').onclick = async function () {
        await makeGuess(file);
        window.location.href = "./result.html";
    }

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

function pageImports (path = "component/navbar.html")
{
    fetch(path)
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
        });
}


// Obtention du nom de la page actuelle
function currentPage(page)
{
    page = page.split("/").pop().replace(/\.html$/, "");

    console.log(page);
    var pageName = document.getElementById(page);
    // var divElement = document.querySelector('.' + page);
    console.log(pageName);
    pageName.id = "active";

    // console.log(indexClass);
}

function createChart(properJson) {
    var nbError = 0;
    var nbGoodGuessAsterix = 0;
    var nbGoodGuessObelix = 0;
    var nbNotAsterixOrObelix = 0;
    properJson.data.forEach(item => {
        if( item.win == -1){
            nbError += 1;
        }
        if(item.win == 0){
            nbNotAsterixOrObelix +=1;
        }
        if(item.guess.valueOf() == "Asterix" && item.win == 1){
            nbGoodGuessAsterix += 1;
        }
        if(item.guess.valueOf() == "Obelix" && item.win == 1){
            nbGoodGuessObelix += 1;
        }
    });        
    
    var pGuesses = document.getElementsByClassName('nbGuesses');
    for (var i = 0; i < pGuesses.length; i++) {
        pGuesses[i].textContent = properJson.data.length;
    }
    var pError = document.getElementsByClassName('nbErreur');
    for (var i = 0; i < pError.length; i++) {
        pError[i].textContent = nbError;
    }

    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Astérix', 'Obélix', 'Non reconnue'],
            datasets: [{
                data: [nbGoodGuessAsterix, nbGoodGuessObelix, nbNotAsterixOrObelix],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: "Répartition des guesses de l'API en barChart"
                }
            }
        }
    });

    const pieCtx = document.getElementById('myPieChart').getContext('2d');
    const myPieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Astérix', 'Obélix', 'Non reconnue'],
            datasets: [{
                data: [nbGoodGuessAsterix, nbGoodGuessObelix, nbNotAsterixOrObelix],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: "Répartition des guesses de l'API en pieChart"
                }
            }
        }
    });
    // Resize charts dynamically on window resize
    window.addEventListener('resize', () => {
        myChart.resize();
        myPieChart.resize();
    });
}

// History
async function getImagesGuesses()
{
    if (localStorage.getItem('token') != '')
    {
        let response = await fetch(apiUrl + "api/guesses", {
            method: "GET",
            headers: {
                "authorization": 'Bearer ' + localStorage.getItem('token'),
                "Content-Type": "application/json", 
            }
        });

        // -------------------------------------------
        // Decodage
        var uint8array = (await response.body.getReader().read()).value;
        var textString = new TextDecoder().decode(uint8array);
        var properJson = eval('(' + textString + ')');
        
        console.log(properJson);
        console.log("REUSSI !");

        return properJson
    }
    else 
    {
        error = {
            "Error" : "Token Not Setup"
        }

        return error
    }
}

async function createHistoryPage()
{
    var properJson = await getImagesGuesses();
    if(properJson.error)
    {
        console.log("Warning !");
    }
    else
    {
        var original = document.querySelector('#history');
        var firstGuess = original;

        firstGuess.id = properJson[0].id;
        firstGuess.getElementsByTagName('img')[0].src = apiUrl + properJson[0].imagepath;
        firstGuess.getElementsByTagName('h5')[0].innerHTML = properJson[0].guess;
        firstGuess.getElementsByTagName('p')[0].innerHTML = properJson[0].win;
        firstGuess.getElementsByTagName('small')[0].innerHTML = "Ajouté le :\n" + properJson[0].date;

        for (i = 1 ; i != properJson.length ; i ++)
        {
            var clone = original.cloneNode(true);
            clone.id = properJson[i].id;
            clone.getElementsByTagName('img')[0].src = apiUrl + properJson[i].imagepath;
            clone.getElementsByTagName('h5')[0].innerHTML = properJson[i].guess;
            clone.getElementsByTagName('p')[0].innerHTML = properJson[i].win;
            clone.getElementsByTagName('small')[0].innerHTML = "Ajouté le :\n" + properJson[i].date;
            original.parentNode.appendChild(clone);
        }
    }
}