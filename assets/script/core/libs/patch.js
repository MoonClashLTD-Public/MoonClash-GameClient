  
if (!window.crypto) {
    window.crypto = {};
}
if (!crypto.getRandomValues) {
    crypto.getRandomValues = function (array) {
        for (var i = 0, l = array.length; i < l; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return array;
    }
}