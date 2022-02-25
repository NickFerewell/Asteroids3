/*
class  InputManager{
    static keyboard = {};
    static keyStates = {};

    static nextStateAssignTrue = {
        undefined: "pushed",
        "pushed": "pulled", //тыкнуто -> нажато(задержать)
        "pulled": "pulled",
        "released": "pushed",
        "clicked": "pushed",
        "up": "pushed"
    }
    static nextStateAssignFalse = {
        undefined: "up",
        "pushed": "clicked",
        "released": "up",
        "pulled": "released",
        "clicked": "up",
        "up": "up"
    }

    static gameKeys = ["W", "A", "S", "D"]; //Массив символов, используемых в игре. Вместе с ними вызывается event.preventDefault()

    static keyDown(key){ //введённый символ
        let upperKey = key.length == 1 ? key.toUpperCase(): key;
        if(InputManager.gameKeys.includes(upperKey)){
        InputManager.keyboard[upperKey] = true;
        InputManager.updateKeyStates();
        return false; //prevent default
        } else return true;
    }

    static keyUp(key){ //введённый символ
        let upperKey = key.length == 1 ? key.toUpperCase(): key;
        if(InputManager.gameKeys.includes(upperKey)){
        InputManager.keyboard[upperKey] = false;
        InputManager.updateKeyStates();
        return false; //prevent default
        } else return true;
    }

    static keyCodeDown(code){ //физические клавиши на клавиатуре

    }

    static keyCodeUp(code){ //физические клавиши на клавиатуре

    }

    static updateKeyStates(){
        // Object.keys(InputManager.keyboard).forEach( function(key, index) {
        //   if(InputManager.keyboard[key]){
        //     InputManager.keyStates[key] = InputManager.nextStateAssignTrue[InputManager.keyStates[key]];
        //   } else {
        //     InputManager.keyStates[key] = InputManager.nextStateAssignFalse[InputManager.keyStates[key]];
        //   }
        // });

        InputManager.gameKeys.forEach( function(key, index) {
        if(InputManager.keyboard[key]){
            InputManager.keyStates[key] = InputManager.nextStateAssignTrue[InputManager.keyStates[key]];
        } else {
            InputManager.keyStates[key] = InputManager.nextStateAssignFalse[InputManager.keyStates[key]];
        }
        });
    }

    static getKeyPressed(key){
        InputManager.updateKeyStates();
        //console.log(InputManager.keyStates[key.length == 1 ? key.toUpperCase(): key], key)
        //console.log(InputManager.keyStates[key.length == 1 ? key.toUpperCase(): key], InputManager.keyboard)
        return InputManager.keyStates[key.length == 1 ? key.toUpperCase(): key] == "pulled";
    }

    static getKeyReleased(key){
        InputManager.updateKeyStates();
        //console.log(InputManager.keyboard)
        //console.log(InputManager.keyStates[key.length == 1 ? key.toUpperCase(): key], key)
        //console.log(InputManager.keyStates[key.length == 1 ? key.toUpperCase(): key], InputManager.keyboard)
        return InputManager.keyStates[key.length == 1 ? key.toUpperCase(): key] == "released";
    }
}



window.addEventListener("keydown", function (event) { //document.addEventListener()
    InputManager.keyDown(event.key)
    // if (event.defaultPrevented) {
    //   return; // Do nothing if the event was already processed
    // }

    // if(InputManager.keyDown(event.key) === false){ //keyDown возвращает false, если эту клавишу не надо пропускать дальше(?)
    //   // Cancel the default action to avoid it being handled twice
    //   event.preventDefault();
    // }

    // if(InputManager.keyCodeDown(event.keyCode) === false){ //keyCodeDown возвращает false, если эту клавишу не надо пропускать дальше(?)
    //   // Cancel the default action to avoid it being handled twice
    //   event.preventDefault();
    // }

}, true);
    // the last option dispatches the event to the listener first,
    // then dispatches event to window



window.addEventListener("keyup", function (event) { //document.addEventListener()
    InputManager.keyUp(event.key)
    // if (event.defaultPrevented) {
    //   return; // Do nothing if the event was already processed
    // }

    // if(InputManager.keyUp(event.key) === false){ //keyUp возвращает false, если эту клавишу не надо пропускать дальше(?)
    //   // Cancel the default action to avoid it being handled twice
    //   event.preventDefault();
    // }

    // if(InputManager.keyCodeUp(event.keyCode) === false){ //keyCodeDown возвращает false, если эту клавишу не надо пропускать дальше(?)
    //   // Cancel the default action to avoid it being handled twice
    //   event.preventDefault();
    // }

}, true); 
*/