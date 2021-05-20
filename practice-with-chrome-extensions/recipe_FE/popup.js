/*

This file accompanies the popup.html.
Any design components that happen within the scope of the popup window will need to be implemented here.
(e.g. Buttons, button clicks, animations, etc.)

Tasks that need to happen in the scope of the actual web page (i.e. the recipe info changing on the screen)
will be dealt with in the content-script. This includes the process for changing ingredient measurements, units, or
substitutions.
The *only* part the popup.js plays in these tasks is in notifying the content-script that one of these tasks
has been triggered, and what information needs to be changed (see comment block in half.addEventListener()).

 */


// Add listener for "half" button.
// If clicked, tell content-script.js by calling .executeScript
let half = document.getElementById("radio1/2");
half.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});


    /*
    The next line is where we prepare to send a message to the content script
    Use this for tasks that need to be done on the content-script end.
    The only argument that FE will want to edit is "message", where:

         * To multiply the ingredients measurements:
            message: {task: 'reProportion',value: <<value you want to multiple by>>)}
        * To convert the units of measurements:
            message: {task: 'convert', value: <<'toUS' OR 'toMetric'}
        * To substitute an ingredient
            message: {task: 'substitute', value: << String version of a structure such as {'chicken':'tofu', milk: 'almond milk'}>>}
    */

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: sendMessageToCS({task:'reProportion',value:'.5'}, tab)
    });

});

// Add listener for "origianl" button.
// If clicked, tell content-script.js by calling .executeScript
let original = document.getElementById("radioOriginal");
original.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: sendMessageToCS({task:'reProportion',val:'1'}, tab)
    })
})

// Add listener for "quarter" button.
// If clicked, tell content-script.js by calling .executeScript
let quarter = document.getElementById("radio1/4");
quarter.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: sendMessageToCS({task:'reProportion',val:'.25'}, tab)
    })
})

// Add listener for "double" button.
// If clicked, tell content-script.js by calling .executeScript
let double = document.getElementById("radioX2");
double.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: sendMessageToCS({task:'reProportion',val:'2'}, tab)
    })
})

let convert = document.getElementById("toMetric");
convert.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: sendMessageToCS({task:'convert',val:'toMetric'}, tab)
    })
})


/*  In order for the content-script to know what to do and when to do it,
    we will do something called "message passing"
    Once the user chooses an option on the popup, we'll communicate that to the
    content-script using message passing.
    The content-script will wait until it receives that message,
    handle the message, then execute a script in response.

    This is a function that FE will not need to adjust at all
*/
function sendMessageToCS(message, tab) {

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tab.id, message, function (response) {
        });
    });


}


