const hostname = document.getElementById("input-host");
const selectMethod = document.getElementById("select-method");
const spanOptional = document.getElementById("span-optional");
const textareaOptional = document.getElementById("textarea-optional");
const buttonDoes = document.getElementById("button-do");
const spanResponseStatus = document.getElementById("span-response-status");
const spanResponseContent = document.getElementById("span-response-content");
const inputWindowUrl = document.getElementById("input-window-url");


function whenDocumentLoaded(event) {
    loadContent();
    if (browser) {
        browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
            inputWindowUrl.value = tabs[0].url;
        })
    }
}

document.addEventListener("DOMContentLoaded", whenDocumentLoaded)

window.onload = () => {
    if (selectMethod.value === "post") {
        spanOptional.classList.remove("hide");
    }
}

buttonDoes.onclick = doSomething;

selectMethod.onchange = (event) => {
    const val = event.target.value;
    val === "get" ? spanOptional.classList.add("hide") : spanOptional.classList.remove("hide");
}

async function doSomething() {
    const host = hostname.value;
    const method = selectMethod.value;
    
    if (!host) {
        spanResponseStatus.textContent = "no hostname defined"
        return;
    }

    const url = new URL(host);

    if (!inputWindowUrl.value) {
        spanResponseStatus.textContent = "no current url defined"
    }

    url.searchParams.append("dsCurrentURL", inputWindowUrl.value);

    saveContent();

    let res = null;

    if (method === "post") {
        const body = textareaOptional.value; 
        res = await fetch(url, {
            body: body ? body : "",
            method: "POST",
            mode: "no-cors"
        })    
    } else {
        res = await fetch(url, {
            mode: "no-cors"
        });
    }
    if (res) {
        spanResponseStatus.textContent = res.status.toString();
        spanResponseContent.textContent = res.text();
    }
}

function saveContent() {
    localStorage.setItem("url", hostname.value);
    localStorage.setItem("body", textareaOptional.value);    
    localStorage.setItem("method", selectMethod.value);    
}

function loadContent() {
    const val = [
        localStorage.getItem("url"),
        localStorage.getItem("body"),
        localStorage.getItem("method"),
    ];

    if (val[0]) hostname.value = val[0];
    if (val[1]) textareaOptional.value = val[1];
    if (val[2]) selectMethod.value = val[2];
}

