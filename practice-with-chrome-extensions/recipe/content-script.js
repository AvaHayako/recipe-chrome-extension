console.log('content-script.js')


/*
    START OF:
    Making the ingredient list from the webpage content (for delish.com)

 */



// We know that on delish.com, the ingredients are stored in elements of class "ingredient-item", so:
let htmlIngredientList = Array.from(document.getElementsByClassName("ingredient-item"));

// For each ingredient, store it's name and measurement
let ingredientList = {};
htmlIngredientList.forEach(function (html) {
    // parse ingredient html into list where:
    //  ["measurement","","name"]
    let ingredientInfo = html.innerText.trim().split("\n");
    // access right info
    let name = ingredientInfo[2];
    let amt = ingredientInfo[0];
    // store that info
    ingredientList[name] = amt;
});

console.log(ingredientList);


// console.log(htmlIngredientList);

/*
    END OF:
    Making the ingredient list from the webpage content (for delish.com)
 */





/*
    START OF:
    Modifying the ingredient list

    This content-script will wait until the popup sends it a message about what aspects of the ingredients to modify.
    It will then handle the message and execute a script accordingly.
*/

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // Handle message.

    console.log(message);

    reProportion(Number(message));



    // First, figure out what the message is saying:
    // try to parse message as int or float
        // if it works, then we'll be modifying the ingredient portions
        // call the reproportion function
    // else, we're either:
        // going to be doing metric conversion
        // or doing substitution

    // After determining what we're doing, call the related function

});


// Re-proportion all ingredients by some multiplier

// WHERE WE LEFT OFF 4/15
    // changed structure of the method:
        // NOT looking at ingredientList
        // instead:
        // for each ingredient amount, isolate number and multiply it
    // what's left:
        // configure fraction stuff


function reProportion(multiplier){

    $.each($('.ingredient-amount'), function (){

        // console.log($(this).context.innerHTML);
        // $(this).context.innerHTML = "mommy's";

        amt = $(this).context.innerHTML;

        var nonLettersRegex = /[^a-zA-Z^.]/g;
        var lettersRegex = /[a-zA-Z]/g;
        // var wordAmt = amt.match(lettersRegex).join("");
        var numberAmt = amt.match(nonLettersRegex).join("").trim();
        // console.log(numberAmt);

        if(numberAmt.includes("/")){

            // function fractionToDecimal(fraction) {
            //     return fraction
            //         .split('/')
            //         .reduce((numerator, denominator, i) =>
            //             numerator / (i ? denominator : 1)
            //         );
            // }

            console.log('Fraction: ',numberAmt);
            true;

        }
        else {
            let newNum = Number(numberAmt)*multiplier;
            console.log('Not a fraction: ', numberAmt,newNum);

            $(this).context.innerHTML = newNum;

        }


    });



    // do stuff and update webpage
}

// Convert metrics of all ingredients
function convertMetrics(isImperial){
    let newIngredientList = [];
    // do stuff and update webpage
}

// Make substitutions to specific ingredients
function makeSubstitutions(ingredients){
    let newIngredientList = [];
    // do stuff and update webpage
}


/*
    END OF:
    Modifying the ingredient list
 */


// The ultimate plan of this function:

// 1. access the ingredient again

// 2. change either:
    // 1) measurement
    // 2) ingredient name OR
    // 3) measurement AND measurement type



function makeChanges(newIngredientList){
    // make the changes to the actual webpage content



    // let htmlIngredientList = Array.from(document.getElementsByClassName("ingredient-item"));

    // This is a JQuery script, which does the following:
    // 1. for the entire body of the webpage html (except for scripts), filter by nodeType 3 (Text only)
    // 2. replace all instances of the current word with the word strikethrough'd and capitalized (cause y not)

    finalIngredients = {"chicken":"1"}

    $.each($('.ingredient-amount'), function (){
        console.log($(this).context.innerHTML);
        $(this).context.innerHTML = "test";



    });

    // console.log($('.ingredient-description').children()[0].innerHTML());

    // $('body :not(script)').contents().filter(function() {
    //     return this.nodeType === 3;
    // }).replaceWith(function() {
    //     return this.nodeValue.replace(wordsToChange[i],`<s>${wordsToChange[i]}</s> <b>${wordToChange.toUpperCase()}</b>`);
    // });


}