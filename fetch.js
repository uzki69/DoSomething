const hostname = document.getElementById("input-host");
const selectMethod = document.getElementById("select-method");
const spanOptional = document.getElementById("span-optional");
const textareaOptional = document.getElementById("textarea-optional");
const buttonDoes = document.getElementById("button-do");
const spanResponseStatus = document.getElementById("span-response-status");
const spanResponseContent = document.getElementById("span-response-content");
const inputWindowUrl = document.getElementById("input-window-url");
const checkboxBody = document.getElementById("checkbox-body");

function whenDocumentLoaded(event) {
    loadContent();
    if (browser) {
        browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
            inputWindowUrl.value = tabs[0].url;
        })
    }
}

async function getBody() {
    const [tab] = await browser.tabs.query({active: true, currentWindow: true});
    const res = await browser.scripting.executeScript({
        target:  {tabId: tab.id},
        func: () => {
            return document.body.innerHTML;
        }
    });
    const bodyText = res[0].result;
    
    return bodyText;
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
    let dsError = "";
    try {
        if (method === "post") {
            let body = textareaOptional.value;
            try {
                if (checkboxBody.checked) {
                    const pageBody = (await getBody()).replace(/^\s+|\s+$/g, '')
                    if (body) {
                        JSON.parse(body)
                        const index = body.lastIndexOf("}")
                        if (index === -1) {
                            dsError = "'}' not found expect JSON Object at root";
                            return console.error("'}' not found expect JSON Object at root"); 
                        }
                        body = body.substring(0, index) + `,"dsDocumentBody": ${JSON.stringify(pageBody)} }`; 
                    } else {
                        body = `{"dsDocumentBody": ${JSON.stringify(pageBody)}}` 
                    }
                }
            } catch (error) {
                dsError = error;
                console.error("not valid json:\n", error);
            }
            res = await fetch(url, {
                body: body ? body : "",
                method: "POST",
            })
        } else {
            res = await fetch(url, {});
        }

        if (res) {
            spanResponseStatus.textContent = res.status.toString();
            let resText =  await res.text(); 
            spanResponseContent.textContent = resText;
        } else {
            spanResponseStatus.textContent = "666"
            spanResponseContent.textContent = "Unknown error" 
        }
    } catch(error) {
        spanResponseStatus.textContent = "666";
        spanResponseContent.textContent = error;
    }
}

function saveContent() {
    localStorage.setItem("url", hostname.value);
    localStorage.setItem("body", textareaOptional.value);    
    localStorage.setItem("method", selectMethod.value);    
    localStorage.setItem("checked", checkboxBody.checked ? "true" : "false");    
}

function loadContent() {
    const val = [
        localStorage.getItem("url"),
        localStorage.getItem("body"),
        localStorage.getItem("method"),
        localStorage.getItem("checked"),
    ];

    if (val[0]) hostname.value = val[0];
    if (val[1]) textareaOptional.value = val[1];
    if (val[2]) selectMethod.value = val[2];
    if (val[3]) checkboxBody.checked = true;
}

