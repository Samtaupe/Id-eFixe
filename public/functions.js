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

    console.log(page);
    console.log(document.getElementsByClassName(page));
    // indexClass.forEach(element => {
    //     element.classList.add("active");
    // });

    console.log(page);
    console.log(indexClass);
}