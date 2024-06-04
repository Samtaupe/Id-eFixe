function pageImports (path = "component/navbar.html")
{
    fetch(path)
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
        });
}

// ---------------------

function currentPage(page)
{
    page = page.split("/").pop().replace(/\.html$/, "");
    
    if (page == "index.html")
    {
        var indexClass = document.querySelectorAll("." + page);
        indexClass.forEach(element => {
            element.classList.add("active");
        });
    }
    if (page == "history.html")
    {
        var indexClass = document.querySelectorAll("." + page);
        indexClass.forEach(element => {
            element.classList.add("active");
        });
    }
}