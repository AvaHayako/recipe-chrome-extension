chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log("message ,", message);
    if (hasNumber(message.toString())) {
        reProportion(Number(message));
    } else if (message.toString() === "metric") {
        convertMetrics(message);
    }
});

// goes through each ingredient item and changes its HTML contents based on desired portion
function reProportion(multiplier) {
    $.each($('.o-Ingredients__a-Ingredient--CheckboxLabel'), function () {
        let context = $(this).context.innerHTML;
        var allNumsRegex = new RegExp(/(\d+\s+\d[/]\d)|((?<!\d\s)\d[/]\d)|((\b[^/]\d[^/]\b)|(\b(?<!(\d\s|[/]))\d(?!(\s\d|[/]))\b))/g);
        var newContext = applyRegexAndMultiply(context, allNumsRegex, multiplier);

        $(this).context.innerHTML = newContext;
    });
}

// finds greatest common denominator between two numbers
var gcd = function (a, b) {
    if (!b) return a;

    return gcd(b, a % b);
};

// converts fractions to floats
function simplify(fract, m) {
    const nume = fract.split("/")[0] * m * 1000;
    const denom = fract.split("/")[1] * 1000;

    if (nume % denom === 0) { // when there is no fraction after multiplication
        console.log("new IN SPECIAL CASE: ", (nume / denom).toString());

        return (nume / denom).toString()
    } else { // when there is a fraction
        if (nume>denom){
            let newFract = fractionToMixedFraction(nume,denom,true);
            let a = newFract[0];
            let b = newFract[1];
            let c = newFract[2];
            const myGCD = gcd(b,c);
            return a.toString() + " " + (b/myGCD).toString() + "/" + (c/myGCD).toString();
        }
        const myGCD = gcd(nume, denom);
        return (nume / myGCD).toString() + "/" + (denom / myGCD).toString();
    }
}

// converts floats to fractions
function decimal2fraction(dec) {
    const nume = dec * 100;
    const denom = 100;
    const myGCD = gcd(nume, denom);
    let out = (nume / myGCD).toString() + "/" + (denom / myGCD).toString();
    if (nume > denom) {
        out = fractionToMixedFraction(nume,denom);
    }

    return out;
}

function fractionToMixedFraction(nume,denom,returnNums=false){
    let whole = Math.floor(nume/denom);
    if (returnNums){
        return [whole, (nume%denom),denom];
    }
    let newNume = nume%denom;
    const myGCD = gcd(newNume,denom);
    return whole.toString() + " " + (newNume/myGCD).toString() + "/" + (denom/myGCD).toString();
}

// determines if a number is a fraction, mixed fraction, whole number and sends it to simplify
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
        var endsWSpace = false;
        console.log("DEBUG dealing with "+value);
        if (value.includes("-") || value.includes(";")){
            if (value.startsWith("-") || value.startsWith(";")){
                match.index++;
            }
            else{
                myRegex.index--;
            }
            value = value.replaceAll("-","").replaceAll(";","");
        }
        if (value.startsWith(" ")) {
            match.index++;
            value = value.toString().slice(1,value.length);
        }
        else if(value.endsWith(" ")){
            myRegex.lastIndex--;
            endsWSpace = true;
            value = value.toString().slice(0,value.length-1);
        }

        if (value.includes("/")) {
            newValue = changeValue(value, multiplier);
        }
        else {
            value = Number(value);
            // multiply value
            newValue = (value * multiplier).toString();
            if (newValue.includes(".")) {
                newValue = decimal2fraction(newValue);
            }
        }

        let shift = charArray.length - ogLength;
        let offset = newValue.length - value.toString().length;

        if (match.index >= 0){ // added >=0 and it did nothing
            if(endsWSpace){
                shift++;
            }
        }

        let startIX = match.index + shift;
        let endIX = myRegex.lastIndex + shift;

        let front =  charArray.join("").substring(0, startIX+1);

        let middle = " ".repeat(value.length);
        if ((Math.abs(offset)+shift)>0){
            middle += " ".repeat(Math.abs(offset)+shift+1);
        }

        let back = charArray.join("").substring(endIX, charArray.length);

        let print = ("DEBUG:\n\n"
                    + "size of shift: " + shift + "\n"
                    + "size of offset: " + offset + "\n\n"
                    + "start "+startIX+", end "+endIX+'\n\n'
                    + front.replaceAll(" ","#") + "\n\n"
                    + middle.replaceAll(" ","#") +"\n\n"
                    + "(what will be) new middle: " + newValue + "\n\n (no longer "+value+")\n\n"
                    + back.replaceAll(" ","#"));
        console.log(print);

        charArray = (front + middle + back).split("");

        for (let i = 0; i < newValue.length; i++) {
            charArray[startIX + i] = newValue[i];
        }
    }

    // finally, return the new context, i.e. the charArray turned into a string
    return charArray.join("");
}

// Convert metrics of all ingredients
function convertMetrics(measurementType) {
    // if desired measurement system is metric, need to convert
    if (measurementType === "metric") {
        let prunedContexts = [];
        $.each($('.o-Ingredients__a-Ingredient--CheckboxLabel'), function () {
            const context = $(this).context.innerHTML;
            if (!context.includes("Deselect")) {
                prunedContexts.push(context.split(" "));
            }
        });
        // pruned is a list of lists of words in each ingredient line
        prunedContexts.forEach(function (contextArray, idx) {
            // console.log("converting: ",contextArray);
            prunedContexts[idx] = convertContext(contextArray, measurementType);
        });
        // console.log("prunedContexts: ", prunedContexts);

        $.each($('.o-Ingredients__a-Ingredient--CheckboxLabel'), function (index) {
            const context = $(this).context.innerHTML;

            if (!context.includes("Deselect")) {
                $(this).context.innerHTML = prunedContexts[index - 1].join(" ");
            }
        });
    }
    // do stuff and update webpage
}

// array parameter is the list of all words in one ingredient line
function convertContext(array, measurementType) {
    let convertedOutput = array;
    let convertMe = 0;
    let numberIndex = 0;
    let size = 0;

    // determining if there is even a number to convert for this ingredient line
    let convertible = hasNumber(array.join(""));

    // if we would like to convert from U.S. to metric, we go here
    if (convertible && measurementType === "metric") {
        // fetching number converted from getNum()
        [convertMe, numberIndex, size] = getNum(array);

        // this is where we find measurement type, apply conversion to appropriate metric type
        if (array.includes("cup") || array.includes("cups")) {
            const ml = Math.floor(convertMe * 236.59)
            const litres = convertMe * 0.236
            if (ml >= 1000) {
                convertedOutput[numberIndex] = litres.toString();
                convertedOutput[numberIndex + size] = "L";
            } else {
                convertedOutput[numberIndex] = ml.toString();
                convertedOutput[numberIndex + size] = "mL";
            }
        } else if (array.includes("teaspoon") || array.includes("teaspoons")) {
            convertedOutput[numberIndex] = (convertMe * 4.93).toString();
            convertedOutput[numberIndex + size] = "mL";
        } else if (array.includes("tablespoon") || array.includes("tablespoons")) {
            convertedOutput[numberIndex] = (convertMe * 14.79).toString();
            convertedOutput[numberIndex + size] = "mL";
        } else if (array.includes("pint") || array.includes("pints")) {
            const ml = Math.floor(convertMe * 473.18)
            const litres = convertMe * 0.473
            if (ml >= 1000) {
                convertedOutput[numberIndex] = litres.toString();
                convertedOutput[numberIndex + size] = "L";
            } else {
                convertedOutput[numberIndex] = ml.toString();
                convertedOutput[numberIndex + size] = "mL";
            }
        } else if (array.includes("quart") || array.includes("quarts")) {
            convertedOutput[numberIndex] = (convertMe * 0.946).toString();
            convertedOutput[numberIndex + size] = "L";
        } else if (array.includes("gallon") || array.includes("gallons")) {
            convertedOutput[numberIndex] = (convertMe * 3.785).toString();
            convertedOutput[numberIndex + size] = "L";
        } else if (array.includes("ounce") || array.includes("ounces")) {
            convertedOutput[numberIndex] = Math.floor(convertMe * 28.35).toString();
            convertedOutput[numberIndex + size] = "grams";
        } else if (array.includes("pound") || array.includes("pounds")) {
            const g = Math.floor(convertMe * 454)
            const kg = (convertMe * 0.454)
            if (g >= 1000) {
                convertedOutput[numberIndex] = kg.toString();
                convertedOutput[numberIndex + size] = "kg";
            } else {
                convertedOutput[numberIndex] = g.toString();
                convertedOutput[numberIndex + size] = "grams";
            }
        }
    }
    // rounding to two decimal places
    if (typeof convertedOutput[numberIndex] === "string" && convertedOutput[numberIndex].includes("/")) {
        convertedOutput[numberIndex] = decimal2fraction(convertedOutput[numberIndex]);
    } else if (typeof convertedOutput[numberIndex] === "string" && convertedOutput[numberIndex].includes(".")) {
        convertedOutput[numberIndex] =
            convertedOutput[numberIndex].substring(0, convertedOutput[numberIndex].indexOf(".") + 3);
    }

    // removing a context array item to accommodate for mixed fractions
    if (size === 2) {
        convertedOutput.splice(numberIndex + 1, 1);
    }

    return convertedOutput;
}

// returns if a string has a number
function hasNumber(myString) {
    return /\d/.test(myString);
}

// go through all items in array, return first instance of number as float
function getNum(array) {
    let value = 0;
    let size = 1;

    let i = -1; // index in the array
    let flag = true; // flag to tell if we DON'T have found the first instance of a number

    while (flag && i <= array.length) {
        i++;
        if (hasNumber(array[i])) {
            flag = false;
            break;
        }
    }

    // I should have used my simplify fraction here but this does the same thing
    if (flag) {
        console.log("something went wrong, there should be a number in this line but there isn't");
    } else if (array[i] && array[i + 1]) { // check for mixed fraction
        if (Number(array[i] && array[i + 1].includes("/") && Number(array[i + 1].split("/")[0]) && Number(array[i + 1].split("/")[1]))) {
            size = 2;
            value = Number(array[i]) + (Number(array[i + 1].split("/")[0]) / Number(array[i + 1].split("/")[1]));
        } else if (array[i].includes("/") && Number(array[i].split("/")[0]) && Number(array[i].split("/")[1])) {
            size = 1;
            value = Number(array[i].split("/")[0]) / Number(array[i].split("/")[1])
        } else {
            size = 1;
            value = Number(array[i]);
        }
    } else if (array[i]) {
        size = 1;
        value = Number(array[i]);
    }

    return [value, i, size];
}