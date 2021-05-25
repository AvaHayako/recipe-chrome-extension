

// 5/24
// we're adding:
// variables to track the button clicks to then send to the content_script.js
// also:
// removing all sendtoCS calls from button listeners that aren't the submit button

let measurementClick = '';
let metricClick = false;

// Add listener for "half" button.
// If clicked, tell content-script.js by calling .executeScript
let half = document.getElementById("radio1/2");
half.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    measurementClick = '.5';
});

// Add listener for "origianl" button.
// If clicked, tell content-script.js by calling .executeScript
let original = document.getElementById("radioOriginal");
original.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    measurementClick = '1';
})

// Add listener for "quarter" button.
// If clicked, tell content-script.js by calling .executeScript
let quarter = document.getElementById("radio1/4");
quarter.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    measurementClick = '.25';

})

// Add listener for "double" button.
// If clicked, tell content-script.js by calling .executeScript
let double = document.getElementById("radioX2");
double.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    measurementClick = '2';
})

let convert = document.getElementById("toMetric");
convert.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});


    metricClick = true;
})

let submit = document.getElementById("submit_button");
submit.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    console.log('DEBUG submit has been clicked');

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: sendMessageToCS(`${measurementClick},${metricClick}`, tab)
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
    console.log('DEBUG sending message to CS');
    if (measurementClick !== '' || metricClick) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tab.id, message, function (response) {
            });
        });
    }
    else{
        console.log('cannot submit with no changes');
    }


}