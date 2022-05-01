//https://stackoverflow.com/questions/8885323/speed-of-the-math-object-in-javascript#8885656 - в помощь
class World{
    constructor(){
        this.objects = [];
        this.isPaused = false;
        // console.log(localStorage.getItem("DEBUGMODE"), new Boolean(localStorage.getItem("DEBUGMODE")), !!+localStorage.getItem("DEBUGMODE"), !!new Boolean(localStorage.getItem("DEBUGMODE")))
        this.DEBUGMODE = !!+localStorage.getItem("DEBUGMODE");

        this.worldBorders = {
            x: 0,
            y: 0,
            width: renderModule.app.screen.width,
            height: renderModule.app.screen.height,
            multSize: function(times){
                console.log("Old borders are: x: " + this.x + ", y: "+ this.y + ", width: " + this.width + ", height: " + this.height + ".");
                console.log("Border mult quotient is: " + times);

                var centerX = this.x + this.width/2;
                var centerY = this.y + this.height/2;

                this.x = centerX - this.width/2*times;
                this.y = centerY - this.height/2*times;

                this.width = this.width*times;
                this.height = this.height*times;
                
                this.updateSprite();
                console.log("New borders are: x: " + this.x + ", y: "+ this.y + ", width: " + this.width + ", height: " + this.height + ".");
            },
            sprite: new renderModule.Graphics().lineStyle(2, 0xFF00FF, 1).beginFill(0x650A5A, 0.25).drawRoundedRect(0, 0, renderModule.app.screen.width, renderModule.app.screen.height, 2).endFill(),
            moveTo: function(pos){
                this.x = pos.x - this.width/2;
                this.y = pos.y - this.height/2;
                this.updateSprite();
            },
            updateSprite: function(){
                this.sprite.clear().lineStyle(2, 0xFF00FF, 1).beginFill(0x650A5A, 0.25).drawRoundedRect(this.x, this.y, this.width, this.height, 2).endFill();
            },

            objToFollow: undefined,
            update: function(){
                if(this.objToFollow){
                    this.moveTo(this.objToFollow.pos);
                }
            }
        }

        this.queueToDestroy = [];

        // this.backgroundUniverse = new BackgroundUniverse(0, 1, undefined, 0.5);
    }

    static Constants = {
        restitution: 0,
        gravity: 1,
    }

    Setup(){
        //this.objects.push(new Asteroid(new Vector(50, 10), 200, new Vector(0, 0), 0)); //20, 10
        // this.objects.push(new Asteroid(new Vector(55, 45), 200, new Vector(0, 0), 0)); //80, 45

        //this.objects.push(new Asteroid(new Vector(550, 510), 200, new Vector(0, 0), 0)); //20, 10
        // this.objects.push(new Asteroid(new Vector(555, 545), 200, new Vector(0, 0), 0));

        //this.objects.push(new Asteroid(new Vector(300, 260), 1800, new Vector(0, 0), 0));
        renderModule.addFigure(this.worldBorders.sprite);

        

        this.backgroundUniverse = new BackgroundUniverse(1, 1, undefined, 0.3, this.worldBorders.width, this.worldBorders.height);
        this.backgroundUniverse.Generate();
        console.log(this.backgroundUniverse.Universe[0])
        this.backgroundUniverse.referenceBody = renderModule.objToFollow;
    }


    //Добавить открытый мир и параллаксный фон, сенсоры и эффекторы, гиперпрыжки и врага-телепортера
    Update(){
        if(this.isPaused === false){
            this.objects.forEach(obj => {
                obj.Update();
            });

            this.worldBorders.update();

            /*if(this.worldBorders.objToFollow){
                //Необязательно делать это в зависимости от расстояния, можно от времени, но тогда это будет не очень логично.
                // if(this.worldBorders.objToFollow.pos.x > (this.worldBorders.x+this.worldBorders.width) || this.worldBorders.objToFollow.pos.y > (this.worldBorders.y+this.worldBorders.height))
                // if(Math.abs((this.worldBorders.x+this.worldBorders.width)-this.worldBorders.objToFollow.pos.x) > this.worldBorders.width || Math.abs((this.worldBorders.y+this.worldBorders.height)-this.worldBorders.objToFollow.pos.y) > this.worldBorders.height){
                //     this.moveObjectsToOrigin(this.worldBorders.objToFollow.pos);
                // }
                if(Math.abs(this.worldBorders.objToFollow.pos.x) > this.worldBorders.width || Math.abs(this.worldBorders.objToFollow.pos.y) > this.worldBorders.height){
                    this.moveObjectsToOrigin(this.worldBorders.objToFollow.pos);
                }
            }*/

            this.objects.forEach(obj => {
                this.placeToBounds(obj, this.worldBorders.x, this.worldBorders.y, this.worldBorders.width, this.worldBorders.height);
            });

            for (var i = 0; i < this.objects.length; i++)  
            {  
                for (var j = i + 1; j < this.objects.length; j++)  
                {  
                    if (this.objects[i].colliding(this.objects[j]))  
                    {
                        //console.log("Collision!");
                        this.objects[i].PreCollide(this.objects[j]);
                        this.objects[j].PreCollide(this.objects[i]);

                        this.objects[i].resolveCollision(this.objects[j]);

                        this.objects[i].PostCollide(this.objects[j]);
                        this.objects[j].PostCollide(this.objects[i]);
                    }
                }
            }


            // console.log(this.queueToDestroy)
            for (var i = this.queueToDestroy.length-1; i >= 0; i--){//Чтобы не возникало ситуаций, когда объект был уничтожен, но мир вызывает у него postCollide
                this.CompletelyDestroy(this.queueToDestroy[i]);
                this.queueToDestroy.pop();
            }
            // console.log(this.queueToDestroy)
            
            for (var i = 0; i < this.objects.length; i++)
            {
                for (var j = i + 1; j < this.objects.length; j++)
                {
                    //console.log("Attraction!");
                    this.attract(this.objects[i], this.objects[j]);
                    // var force = (this.objects[i].mass * this.objects[j].mass * World.Constants.gravity) / (Distance(this.objects[i], this.objects[j])**2);
                    // var dir = this.objects[i].pos.sub(this.objects[j].pos).normalize();
                    // this.objects[i].ApplyForce(dir.mult(-force));
                    // this.objects[j].ApplyForce(dir.mult(force));
                }
            }


            if(Keyboard.getKeyReleased("g")){
                console.log("Gravity normalised.");
                World.Constants.gravity = 1;
            }

            if(Keyboard.getKeyPressed("g")){
                console.log("Gravity increased.");
                World.Constants.gravity = 3;
            }
        }
    }

    Render(){
        //background(50);
        this.backgroundUniverse.Draw();
        for(var i = 0; i < this.objects.length; i++){
            this.objects[i].Draw();
        }
    }

    Instantiate(entity, ...a){
        if(typeof entity === "string"){
            switch (entity) {
                case "Asteroid":
                    this.PushToObjects(new Asteroid(new Vector() , 40, new Vector(), 0, ...a));
                    // console.log("Asteroid instantiated.");
                    break;
            
                default:
                    // this.PushToObjects(eval("new " + entity + "(" + a + ")"));
                    this.PushToObjects(window[entity](...a));
                    // console.log("Object by string " + entity + " wasn't instantiated.")
                    // console.log("Nothing instantiated.");
                    break;
            }
        } else if(entity instanceof Array){
            entity.forEach((obj) =>{
                this.Instantiate(obj);
            })
        } else if(typeof entity === "object"){
            this.PushToObjects(entity);
            // console.log("Object was pushed to objects.");
        } else if(typeof entity === "function"){
            this.PushToObjects(new entity());
            // console.log("Instance of function was pushed to objects.");
            // console.log(new entity())
        } else{
            console.log("Nothing was instantiated by "+ entity + " of type " + typeof entity + ".");
        }
    }

    PushToObjects(object){
        this.objects.push(object);
    }

    Destroy(object){
        if(object.Destroyed == false){
            // if(this.queueToDestroy.indexOf(object) != -1){
            this.queueToDestroy.push(object);
            // }
            object.Destroyed = true;
        }
    }

    CompletelyDestroy(object){
        // for (let i = 0; i < this.objects.length; i++) {
        //     const obj = this.objects[i];
        //     if(object == obj){
        //         this.objects.splice(this.objects.indexOf(object), 1);
        //     }
        // }
        // console.log(this.objects.length)
        this.objects.splice(this.objects.indexOf(object), 1);
        object.Destroy();
        // console.log("Something was destroyed.", object, this.objects.length)
    }

    getDistInBounds(from, to, x = this.worldBorders.x, y = this.worldBorders.y, w = this.worldBorders.width, h = this.worldBorders.height){
        var firstX =  to.x - from.x ;//Работает
        var secondX = w*Math.sign(from.x - to.x) - from.x + to.x;
        var distX = Math.abs(firstX) < Math.abs(secondX) ? firstX : secondX; //Math.min(Math.abs(to.x - from.x), Math.abs((to.x - w) - from.x))
    
        var firstY = to.y - from.y;
        var secondY = h*Math.sign(from.y - to.y) - from.y + to.y;
        var distY = Math.abs(firstY) < Math.abs(secondY) ? firstY : secondY;
    
        // console.log(firstX, secondX)
        return new Vector(distX, distY);


        // var bFrom = this.foldPointIntoBounds(from); //(x+w-b)-(a-x) = x+w-b-a+x = 2x+w-a-b = w-(b-a) !
        // var bTo = this.foldPointIntoBounds(to);
        /*var bFrom = from; //Прекрасно работает, но не экономично
        var bTo = to;
        var distX = bTo.x - bFrom.x;
        if(Math.abs(distX) > w/2){
            // this.borderCount++;
            // console.log(this.borderCount);
            distX = w - Math.abs(distX);
        }
        // else{
        //     this.normalCount++;
        //     console.log(this.normalCount)
        // }
        var distY = bTo.y - bFrom.y;
        if(Math.abs(distY) > h/2){
            distY = h - distY;
        }
        // console.log(to.sub(from), new Vector(distX, distY));
        return new Vector(distX, distY);*/


        /*var normalDistX = to.x - from.x; //Тоже, что и следующее
        var boundsDistX = w - to.x + from.x;
        var normalDistY = to.y - from.y;
        var boundsDistY = h - to.y + from.y;
        return new Vector(Math.min(normalDistX, boundsDistX), Math.min(normalDistY, boundsDistY));*/

        /*var DistX = to.x - from.x; //Работает именно что для расстояний, но не для направлений. :(
        if(DistX > w/2){
            DistX = w - to.x + from.x;
        }
        var DistY = to.y - from.y;
        if(DistY > h/2){
            DistY = h - to.y + from.y;
        }
        return new Vector(DistX, DistY);*/
    }

    attract(obj1, obj2){
        var force = (obj1.mass * obj2.mass * World.Constants.gravity) / (this.getDistInBounds(obj2.pos, obj1.pos).mag()**2);
        //var dir = obj1.pos.sub(obj2.pos).normalize();// <- Здесь была ошибка с гравитацией?
        var dir = this.getDistInBounds(obj2.pos, obj1.pos).normalize();
        obj1.ApplyForce(dir.mult(-force));
        obj2.ApplyForce(dir.mult(force));
    }

    getSpeedForStableOrbit(posOrbiting, posOrbited, massOrbited, velOrbited){
        var dist = posOrbiting.sub(posOrbited);//<- Добавить поддержку границы мира
        var mag = Math.sqrt(World.Constants.gravity * massOrbited / dist.mag());
        var dir = new Vector(dist.y, -dist.x).normalize();
        console.log(posOrbiting, dir, mag);
        return dir.mult(mag).add(velOrbited || 0);
    }

    placeToOrbit(orbiting, around){
        orbiting.vel = this.getSpeedForStableOrbit(orbiting.pos, around.pos, around.mass, around.vel);
    }

    foldPointIntoBounds(pos, x = this.worldBorders.x, y = this.worldBorders.y, w = this.worldBorders.width, h = this.worldBorders.height){
        /*var newX = ((x+w) - (x-pos.x)%w)%w;
        var newY = ((y+h) - (y-pos.y)%h)%h;
        return new Vector(newX, newY);*/

        /*var newX = 0;
        if(pos.x > x+w){
            newX = (pos.x-x)%w + x;
        } else if(pos.x >= x){
            newX = pos.x;
        } else{
            newX = (x+w) - (x - pos.x)%w;
        }

        var newY = 0;
        if(pos.y > y+h){
            newY = (pos.y-y)%h + y;
        } else if(pos.y >= y){
            newY = pos.y;
        } else{
            newY = (y+h) - (y - pos.y)%h;
        }
        return new Vector(newX, newY);*/


        var newX = (pos.x-x)%w + x //Проверка на нахождениев границах происходит в операции %
        if(pos.x < x){
            newX += w;
        }
        var newY = (pos.y-y)%h + y
        if(pos.y < y){
            newY += h;
        }

        return new Vector(newX, newY);
    }

    placeToBounds(obj, x = this.worldBorders.x, y = this.worldBorders.y, w = this.worldBorders.width, h = this.worldBorders.height){
        /*var rel = new Vector(obj.pos.x - (x+w/2), obj.pos.y - (y + h/2));
        if(Math.abs(rel.x) > (w/2)){
            // obj.pos.x = rel.x%(w) + (-w)*Math.sign(rel.x) + x; //-4%3 - 3*sign(-4) + 0= -1 - (-3) = 2
            // obj.pos.x = -Math.sign(obj.pos.x)*w/2;
            obj.pos.x = x + w/2 - Math.sign(rel.x)*(w/2); //x + w/2 - Math.sign(rel.x)*(w/2) - to keep obj in bounds. Можно ли это использовать для исправления backgroundUniverse?
        }//-3%3 - 3*sign(-3) = 0 - (-3)= 3
        if(Math.abs(rel.y) > (h/2)){
            obj.pos.y = y + h/2 - Math.sign(rel.y)*(h/2);
        }*/
    
        obj.pos = this.foldPointIntoBounds(obj.pos, x, y, w, h);
    }

    moveObjectsToOrigin(pointToOrigin){
        const pointToOriginCopy = pointToOrigin.copy();
        this.objects.forEach(obj => {
            obj.pos = obj.pos.sub(pointToOriginCopy);
            // console.log(pointToOrigin, obj.sub)
        })
    }

    changeDEBUG(){
        localStorage.setItem("DEBUGMODE", this.DEBUGMODE ? 0 : 1);
        // console.log("Setting DEBUGMODE to", this.DEBUGMODE ? 0 : 1)
        window.location.reload(false);//true, если содержимое на сервере изменилось
    }
}