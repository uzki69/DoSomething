const hostname = document.getElementById("input-host");
const selectMethod = document.getElementById("select-method");
const spanOptional = document.getElementById("span-optional");
const textareaOptional = document.getElementById("textarea-optional");
const buttonDoes = document.getElementById("button-do");
const spanResponseStatus = document.getElementById("span-response-status");
const spanResponseContent = document.getElementById("span-response-content");
const checkboxWindowUrl = document.getElementById("checkbox-window-url");
const checkboxBody = document.getElementById("checkbox-body");
const textareaHeaders = document.getElementById("textarea-headers")

let _currentUrl = ""

function whenDocumentLoaded(event) {
    loadContent();
    if (browser) {
        browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
            _currentUrl = tabs[0].url;
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

function setErrorValues(status, message) {
    if (status != null) {
        spanResponseStatus.textContent = status
    }
    if (message != null) {
        spanResponseContent.textContent = message
    }
}

async function doSomething() {
    const host = hostname.value;
    const method = selectMethod.value;
    
    if (!host) {
        setErrorValues(null, "no hostname defined")
        return;
    }

    
    const url = new URL(host);
    
    setErrorValues(null, "...")

    if (checkboxWindowUrl.checked) {
        if (!_currentUrl) {
            setErrorValues(null, "Could not retrieve current URL");
            return
        }
        url.searchParams.append("dsCurrentURL", _currentUrl);
    }


    saveContent();

    let res = null;
    let dsError = "";
    let inputHeaders = textareaHeaders.value;
    let reqHeaders = null;
    if (inputHeaders) {
        try {
            reqHeaders = JSON.parse(inputHeaders)

        } catch(err) {
            setErrorValues(666, err)
            return
        }
        
    }

    try {
        if (method === "post") {
            let body = textareaOptional.value;
            
            // appending body as json
            try {
                if (checkboxBody.checked) {
                    const pageBody = (await getBody()).replace(/^\s+|\s+$/g, '')
                    if (body) {
                        JSON.parse(body)
                        const index = body.lastIndexOf("}")
                        if (index === -1) {
                            throw "'}' not found expect JSON Object at root";
                        }
                        body = body.substring(0, index) + `,"dsDocumentBody": ${JSON.stringify(pageBody)} }`; 
                    } else {
                        body = `{"dsDocumentBody": ${JSON.stringify(pageBody)}}` 
                    }
                }
            } catch (error) {
               throw error
            }
            console.log(reqHeaders)
            // POST
            res = await fetch(url, {
                body: body ? body : "",
                method: "POST",
                headers: reqHeaders ?  new Headers(reqHeaders) : undefined
            })
        } else {
            // GET
            res = await fetch(url, {
                method: "GET",
                headers: reqHeaders ? new Headers(reqHeaders) : undefined,
            });
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
    localStorage.setItem("headers", textareaHeaders.value);
    localStorage.setItem("checkCurrentUrl", checkboxWindowUrl.checked ? "true" : "false");
}

function loadContent() {
    const val = [
        localStorage.getItem("url"),
        localStorage.getItem("body"),
        localStorage.getItem("method"),
        localStorage.getItem("checked"),
        localStorage.getItem("headers"),
        localStorage.getItem("checkCurrentUrl"),
    ];

    if (val[0]) hostname.value = val[0];
    if (val[1]) textareaOptional.value = val[1];
    if (val[2]) selectMethod.value = val[2];
    if (val[3] === "true") checkboxBody.checked = true;
    if (val[4]) textareaHeaders.value = val[4];
    if (val[5] === "true") checkboxWindowUrl.checked = true;
}

