chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    reProportion(Number(message));
});

function reProportion(multiplier) {
    $.each($('.o-Ingredients__a-Ingredient--CheckboxLabel'), function () {
        let context = $(this).context.innerHTML;
        var allNumsRegex = new RegExp(/(\d+\s+\d[/]\d)|((?<!\d\s)\d[/]\d)|((\b[^/]\d[^/]\b)|(\b(?<!(\d\s|[/]))\d(?!(\s\d|[/]))\b))/g);
        var newContext = applyRegexAndMultiply(context, allNumsRegex, multiplier);

        $(this).context.innerHTML = newContext;
    });
}

var gcd = function (a, b) {
    if (!b) return a;

    return gcd(b, a % b);
};

function simplify(fract, m) {
    const nume = fract.split("/")[0] * m * 1000;
    const denom = fract.split("/")[1] * 1000;

    if (nume % denom === 0) { // when there is no fraction after multiplication
        console.log("new IN SPECIAL CASE: ", (nume / denom).toString());

        return (nume / denom).toString()
    } else { // when there is a fraction
        const myGCD = gcd(nume, denom);
        return (nume / myGCD).toString() + "/" + (denom / myGCD).toString();
    }
}

function decimal2fraction(dec) {
    const nume = dec * 100;
    const denom = 100;
    const myGCD = gcd(nume, denom);
    return (nume / myGCD).toString() + "/" + (denom / myGCD).toString();
}

// multiplier can be 0.25, 0.5, 2, 3, 4
function changeValue(input, mult) {
    let out = "";

    const splitInput = input.split(" ");

    if (splitInput.length === 1) { // HANDLE NORMAL CASE
        out = simplify(splitInput[0], mult);
    } else { // HANDLE MIX FRACTION CASE
        const whole = parseInt(splitInput[0]);
        const numerator = parseInt(splitInput[1].split('/')[0]);
        const denomonator = parseInt(splitInput[1].split('/')[1]);
        const unsimplified = (whole * denomonator + numerator).toString() + "/" + denomonator.toString();
        out = simplify(unsimplified, mult);
    }
    return (out);
}


/* Applies regex function to the context (innerHTML) of some element on a FoodNetwork recipe.
    The goal is to multiply ingredients by some value. */
function applyRegexAndMultiply(context, myRegex, multiplier) {
    // split up context into char array, so it's easier to change values of
    let charArray = context.split("");
    let ogLength = charArray.length;

    /*    while there are matches in the context for our regex expression
        (e.g. the string "5 tablespoons and 1 teaspoon" has 2 matches for wholeNumberRegex)*/
    while ((match = myRegex.exec(context)) !== null) {
        var value = match[0]; // e.g. "5"
        var newValue;
        if (value.includes("/")) {
            newValue = changeValue(value, multiplier);
        } else {
            // if value includes extra space(s) (due to regex filtering)
            // -> remove spaces and update indexes
            if (value.includes(" ")) {
                if (value.endsWith(" ")) {
                    myRegex.lastIndex--;
                } else {
                    match.index++;
                }
                value = Number(value.toString().trim());
            } else {
                value = Number(value);
            }
            // multiply value
            newValue = (value * multiplier).toString();
            if (newValue.includes(".")) {
                newValue = decimal2fraction(newValue);
            }
        }

        let shift = charArray.length - ogLength;
        let startIX = match.index + shift;
        let endIX = myRegex.lastIndex + shift;

        // I learned that sometimes we need to "offset" the charArray to make room for shorter/longer numbers
        let offset = newValue.length - value.toString().length;
        if (offset > 0) {
            charArray = (charArray.join("").substring(0, startIX + 1)
                + " ".repeat(offset)
                + charArray.join("").substring(endIX, charArray.length)).split("");
        } else if (offset < 0) {
            charArray = (charArray.join("").substring(0, startIX - offset)
                + " ".repeat(Math.abs(offset))
                + charArray.join("").substring(endIX - 1 - offset, charArray.length)).split("");
        }

        for (let i = 0; i < newValue.length; i++) {
            charArray[startIX + i] = newValue[i];
        }
    }

    // finally, return the new context, i.e. the charArray turned into a string
    return charArray.join("");
}

// Convert metrics of all ingredients
function convertMetrics(isImperial) {
    let newIngredientList = [];
    // do stuff and update webpage
}