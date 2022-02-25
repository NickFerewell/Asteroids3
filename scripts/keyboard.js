class Keyboard{ //Эта система прекрасно работает, если не лагает. При лагах начинает пропускать события
    static keyStates = {
        "down": 1,
        "up": 0
    };
    static keyboardNow = {};
    static prevKeyboard = {};
    static prevPrevKeyboard = {};

    static UpdateKeyboard(){
        Keyboard.prevPrevKeyboard = cloneObject(Keyboard.prevKeyboard);
        Keyboard.prevKeyboard = cloneObject(Keyboard.keyboardNow);
    };

    static getKeyPressed(key){
        return (Keyboard.prevKeyboard[toStandartKey(key)] - (Keyboard.prevPrevKeyboard[toStandartKey(key)] || 0)) == 1; // undefined|| 0 - когда клавиша нажата первый раз
    }

    static getKeyReleased(key){
        return (Keyboard.prevPrevKeyboard[toStandartKey(key)] - Keyboard.prevKeyboard[toStandartKey(key)]) == 1;
    }

    static getKeyDown(key){
        return Keyboard.prevKeyboard[toStandartKey(key)] == 1;
    }

    static getKeyUp(key){
        return Keyboard.prevKeyboard[toStandartKey(key)] == 0;
    }
}

window.addEventListener("keydown", function (event) {
    // console.log('"' + event.key + '"' + " pressed");
    Keyboard.keyboardNow[toStandartKey(event.key)] = Keyboard.keyStates.down;
}, true);

window.addEventListener("keyup", function (event) {
    //console.log('"' + event.key + '"' + " released");
    Keyboard.keyboardNow[toStandartKey(event.key)] = Keyboard.keyStates.up;
}, true);

function cloneObject(objToClone){ //Только верхний слой
    var result = {...objToClone};
    return result;
}

function toStandartKey(key){
    return key.toUpperCase();
}