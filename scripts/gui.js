class GUI{
    static Setup(){
        PIXI.BitmapFont.from("TitleFont", {
            fontFamily: "Arial",
            fontSize: 14,
            strokeThickness: 2,
            fill: "yellow",
            chars: PIXI.BitmapFont.ALPHANUMERIC.push(":,.-(){}=><;")
        });
    }

    static elements = [];

    static Update(){
        this.elements.forEach(element => {
            var resultValue = element.obj;
            if(element.isValueAFunction){
                resultValue = element.value(element.obj) || "[_?_]";
            } else{
                for(const objValue of element.value.split(".")){
                    resultValue = typeof resultValue[objValue] == "function" ? resultValue[objValue]() : resultValue[objValue];
                    // console.log(element.value.split("."), objValue)
                }
            }
            // console.log(element.value, element.obj[element.value], element.obj, game.world.objects[0].pos.x)
            element.text.text = element.name.toString() + ": " + resultValue.toString();
            // console.log(element.text)
            // element.text.updateText();
        })
    }

    static Render(){
        
    }

    static constructLabel(pos, text, w, h){

    }

    static constructMeter(ofObj, ofValue, pos = new Vector(), name, w = 0, h = 14){
        var isFunction = typeof ofValue == "function";
        var text = new PIXI.BitmapText(String(ofObj[name || (isFunction ? "Label" : ofValue)]), { fontName: "TitleFont", fontSize: h, maxWidth: w });

        var newLabel = {
            id: 0,
            obj: ofObj,
            value: ofValue,
            isValueAFunction: isFunction,
            name: name || (isFunction ? "Label" : ofValue),
            pos: pos,
            w: w,
            h: h,
            text: text,
        };
        GUI.elements.push(newLabel);

        text.x = pos.x;
        text.y = pos.y;
        renderModule.addFigureToScreen(text);

        console.log(newLabel)
    }
}