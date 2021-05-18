// Add listener for "half" button.
// If clicked, tell content-script by calling .executeScript
let half = document.getElementById("half");
half.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: sendMessageToCS(".5", tab)
    });
});


// Add listener for "double" button.
// If clicked, tell content-script by calling .executeScript
let double = document.getElementById("double");
double.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: sendMessageToCS('2', tab)
    })
})


/*  In order for our content-script to know what to do and when to do it,
    we will do something called "message passing"
    Once the user chooses an option on the popup, we'll communicate that to the
    content-script using message passing.
    The content-script will wait until it receives that message,
    handle the message, then execute a script in response.
*/

function sendMessageToCS(message, tab) {

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tab.id, message, function (response) {
        });
    });


}


