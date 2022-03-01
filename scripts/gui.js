class GUI{
    static Setup(){
        PIXI.BitmapFont.from("TitleFont", {
            fontFamily: "Arial",
            fontSize: 14,
            strokeThickness: 2,
            fill: "yellow"
        });
    }

    static elements = [];

    static Update(){
        this.elements.forEach(element => {
            // console.log(element.value, element.obj[element.value])
            element.text.text = String(element.value) + " " + String(element.obj[element.value]);
        })
    }

    static Render(){
        
    }

    static constructLabel(pos, text, w, h){

    }

    static constructMeter(ofObj, ofValue, pos = new Vector(), w = 0, h = 14){
        var text = new PIXI.BitmapText(String(ofObj[ofValue]), { fontName: "TitleFont", fontSize: h, maxWidth: w });

        GUI.elements.push({
            id: 0,
            obj: ofObj,
            value: ofValue,
            pos: pos,
            w: w,
            h: h,
            text: text,
        });

        text.x = pos.x;
        text.y = pos.y;
        renderModule.addFigureToScreen(text);
    }
}