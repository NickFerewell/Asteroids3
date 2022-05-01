class BackgroundUniverse{
    constructor(layersNum = 0, size = 4, starCount, parallaxSpeed = 0.4, screenWidth = window.innerWidth, screenHeight = window.innerHeight){
        this.Universe = []; //массив слоёв паралакса заднего фона
        this.layersNum = layersNum;
        this.size = size; //5, 1/minZoom?, 1.5, 4
        this.starSize = 1; //1, 1.5, 8, 2
        this.starCount = starCount || size * 70; //backUniverseSize * 16 * 2 * 1.5,  backUniverseSize * 100
        this.parallaxSpeed = parallaxSpeed; //0.9, 0.3, 0.1
        this.sizeW = screenWidth * this.size;// or window size?;
        this.sizeH = screenHeight * this.size;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this.referenceBody = undefined;
        this.zoom = 1;
        this.renderMode = 0;
    }

    Generate(){
        for (var i = 0; i < this.layersNum; i++) {
            this.Universe.push([]);
            for (var j = 0; j < this.starCount; j++) {
                var newStar = {
                    x: randomFromTo(- this.sizeW/2, this.sizeW/2), 
                    y: randomFromTo(-this.sizeH/2, this.sizeH/2), 
                    temperature: (this.layersNum - i)/this.layersNum * randomFromTo(0, 1),
                    size: randomFromTo(1, 4),
                    parLayerShift: randomFromTo(-0.3, 0.3),
                    sprite: undefined
                }
                var temperatureToRGB = colorTemperature2rgb(newStar.temperature*16000 + 4000);
                var starColor = parseInt(Color().fromRgb({r: temperatureToRGB.red, g: temperatureToRGB.green, b: temperatureToRGB.blue}).toString().slice(-6),  16);
                newStar.sprite = new renderModule.Graphics().lineStyle(2, starColor, 1).beginFill(starColor, 1).drawCircle(0, 0, newStar.size).endFill();
                // console.log(Color().fromHsv({h: 100 * newStar.temperature, s: 40, v: 100 * newStar.temperature}).toString())
                /*console.log(BackgroundUniverse.HSVtoNumber(240 * newStar.temperature, 100, 100*newStar.temperature))
                console.log(newStar.temperature)
                console.log(parseInt(Color().fromHsv({h: 120, s: 40, v: 100}).toString().slice(-6), 16))
                console.log(("0x" + Color().fromHsv({h: 120, s: 40, v: 100}).toString().slice(1, 7)))
                console.log((+Color().fromHsv({h: 120, s: 40, v: 100}).toString()).toString(16));
                console.log(parseInt("0x" + Color().fromHsv({h: 180, s: 40, v: 100}).toString().slice(1, 7), 16))*/
                this.Universe[i].push(newStar);
                renderModule.addFigure(newStar.sprite);
            }
        }
    }

    Draw(){
        var referencePoint = {position: this.referenceBody.pos, velocity: this.referenceBody.vel};
        for (var i = 0; i < this.Universe.length; i++) {
            
            for(var j = 0; j < this.Universe[i].length; j++){
                var element = this.Universe[i][j];
                var starParallaxHeight = i + element.parLayerShift; //Удаление звезды от корабля по оси Z, влияющее на параллакс.
                var parLayerSpeed = this.parallaxSpeed / (starParallaxHeight + 1);

                var newX = 0;
                var newY = 0;

                if(this.renderMode == 0){
                    //Ужасно долгий и костыльный способ. Я ведь как раз изобрёл нормальную функцию для таких вещей!
                    // var x = ((-(referencePoint.position.x))*parLayerSpeed / this.zoom + element.x/this.zoom - (Math.sign(referencePoint.position.x))*(this.sizeW/2/this.zoom))% (this.sizeW/this.zoom) + (this.sizeW/2 /this.zoom) + (Math.sign(referencePoint.position.x))*(this.sizeW/2/this.zoom) - this.screenWidth/this.zoom;
                    var newPos = game.world.foldPointIntoBounds(new Vector(element.x, element.y).add(referencePoint.position.mult(parLayerSpeed)), referencePoint.position.x - this.sizeW/2, referencePoint.position.y - this.sizeH/2, this.sizeW, this.sizeH);
                    // var y = ((-(referencePoint.position.y))*parLayerSpeed/this.zoom + element.y/this.zoom - (Math.sign(referencePoint.position.y))*(this.sizeH/2/this.zoom))% (this.sizeH/this.zoom) + (this.sizeH/2 /this.zoom) + (Math.sign(referencePoint.position.y))*(this.sizeH/2/this.zoom) - this.screenHeight/this.zoom;

                    newX = newPos.x;
                    newY = newPos.y;
                } else {
                    // var starSpeed = relativeVelocity(myMult(referencePoint.velocity, parLayerSpeed), referencePoint.velocity);
                    var starSpeed = rmath.sDiff(myMult(referencePoint.velocity, parLayerSpeed), referencePoint.velocity);

                    var starGamma = 1 / Math.sqrt(1 - (starSpeed/c)**2);
                    var direction = myHeading(referencePoint.velocity); //Это надо переместить вне forEach, для каждой звезды заново это считать не надо, да и скорость в это время не меняется.

                    var x = (-(referencePoint.position.x)*parLayerSpeed + element.x);
                    var y = (-(referencePoint.position.y)*parLayerSpeed + element.y);

                    newX = x;
                    newY = y;

                    if(Math.abs(newX) > backUniverseSizeW/2){
                        newX = Math.sign(newX) * (- backUniverseSizeW) + (newX % backUniverseSizeW);
                    }
                    if(Math.abs(newY) > backUniverseSizeH/2){
                        newY = Math.sign(newY) * (- backUniverseSizeH) + (newY % backUniverseSizeH);
                    }

                    newX -= Math.sign(newX)*backUniverseSizeW/2;
                    newY -= Math.sign(newY)*backUniverseSizeH/2;

                    newX *= zoom
                    newY *= zoom
                    //Length, distance contraction
                    var tempCoords = myRotateVec({x: newX, y: newY}, -direction);
                    tempCoords.x /= starGamma;
                    newCoords = myRotateVec(tempCoords, direction);
                    newX = newCoords.x;
                    newY = newCoords.y;

                    newX += width/2;
                    newY += height/2;
                }
                
                var size = clamp(element.temperature * this.starSize * this.zoom, 0.32 * element.temperature * 2, 1000);

                //Color and drawing ->
                // colorMode(HSB);

                //circle stars without stretching
                /*fill(100 * element.temperature, 40, 15 * element.temperature);
                noStroke();
                circle(newX, newY, size);*/

                //stars that stretch into lines like in Star Wars or Elite:Dangerous
                // stroke(100 * element.temperature, 40, 15 * element.temperature);
                // strokeWeight(size);
                var dir = Vector.toAngle2D(referencePoint.velocity);
                // var starSpeed = rmath.sDiff(myMult(referencePoint.velocity, parLayerSpeed), referencePoint.velocity);
                var starSpeed = Vector.copy(referencePoint.velocity).mult(parLayerSpeed);
                // var starGamma = 1 / Math.sqrt(1 - (starSpeed/c)**2);
                // var starStretchLength = starParallaxHeight * size * starGamma;
                // line(newX, newY, newX + cos(dir) * starSpeed * starGamma, newY + sin(dir) * starSpeed * starGamma);

                //Stretching via scale ->(not working)
                /*scale(cos(dir)*starStretchLength + 1, sin(dir)*starStretchLength + 1);
                circle(newX, newY, size);*/

                // newX = 0;
                // newY = 0;
                // console.log(newX, newY)
                // console.log(element)
                // console.log(size, dir, starSpeed)
                /*var c = 6;
                var starGamma = 1 / Math.sqrt(1 - (referencePoint.velocity.mag()/c)**2);

                element.sprite.scale.x = 1 + size * starSpeed.mag() + starGamma;
                element.sprite.rotation = dir;*/
                // element.sprite.scale.y = 1/(0.5 + starSpeed.mag())

                element.sprite.x = newX - Math.cos(dir)*element.sprite.scale.x*element.size;
                element.sprite.y = newY - Math.sin(dir)*element.sprite.scale.x*element.size;
                // console.log(size * Math.cos(dir) * starSpeed)
                // element.sprite.scale.y = 1 + size * Math.sin(dir) * starSpeed.mag();
            };
        }
    }

    static HSVtoNumber(hsv){
        return parseInt(Color().fromHsv({h: hsv.h, s: hsv.s, v: hsv.v}).toString().slice(-6), 16);
    }
}