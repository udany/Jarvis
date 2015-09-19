/**
 * Generates a random integer
 * @param max
 * @param min
 * @returns {number}
 */
Math.randomInt = function(max, min){
    if(!min) min = 0;
    return Math.floor(Math.random()*(max-min))+min;
}

/**
 * Pads a string (e.g.: "9" may become "009" and "10" "010").
 * @param character
 * @param size
 * @param [right]
 * @returns {String}
 */
String.prototype.pad = function (character, size, right) {
    var s = this+"";
    if (!right){
        while (s.length < size) s = character + s;
    }else{
        while (s.length < size) s = s + character;
    }
    return s;
}

Number.prototype.pad = function (size, decimalSize, decimalChar) {
    if (!decimalChar) decimalChar = '.';

    var str = this.toString();
    str = str.split(".");

    var result = str[0].pad("0", size ? size : 0);
    if (str.length==2){
        result += decimalChar + str[1].pad("0", decimalSize, true);
    }

    return result;
}