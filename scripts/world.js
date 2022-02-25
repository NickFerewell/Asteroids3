class World{
    constructor(){
        this.objects = [];
        this.isPaused = false;
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
    }


    //Добавить открытый мир и параллаксный фон
    Update(){
        if(this.isPaused === false){
            this.objects.forEach(obj => {
                obj.Update();
            });

            this.objects.forEach(obj => {
                placeToBounds(obj, 0, 0, renderModule.app.screen.width, renderModule.app.screen.height)
            });

            for (var i = 0; i < this.objects.length; i++)  
            {  
                for (var j = i + 1; j < this.objects.length; j++)  
                {  
                    if (this.objects[i].colliding(this.objects[j]))  
                    {
                        //console.log("Collision!");
                        this.objects[i].OnCollide(this.objects[j]);
                        this.objects[j].OnCollide(this.objects[i]);

                        this.objects[i].resolveCollision(this.objects[j]);

                        this.objects[i].PostCollide(this.objects[j]);
                        this.objects[j].PostCollide(this.objects[i]);
                    }
                }
            }
            
            for (var i = 0; i < this.objects.length; i++)
            {
                for (var j = i + 1; j < this.objects.length; j++)
                {
                    //console.log("Attraction!");
                    attract(this.objects[i], this.objects[j]);
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
                World.Constants.gravity = 2;
            }
        }
    }

    Render(){
        //background(50);
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
        // for (let i = 0; i < this.objects.length; i++) {
        //     const obj = this.objects[i];
        //     if(object == obj){
        //         this.objects.splice(this.objects.indexOf(object), 1);
        //     }
        // }
        object.Destroy();
        this.objects.splice(this.objects.indexOf(object), 1);
        // console.log("Something was destroyed.")
    }
}

function attract(obj1, obj2){
    var force = (obj1.mass * obj2.mass * World.Constants.gravity) / (Distance(obj1, obj2)**2);
    var dir = obj1.pos.sub(obj2.pos).normalize();
    obj1.ApplyForce(dir.mult(-force));
    obj2.ApplyForce(dir.mult(force));
}

function getSpeedForStableOrbit(posOrbiting, posOrbited, massOrbited, velOrbited){
    var dist = posOrbiting.sub(posOrbited);
    var mag = Math.sqrt(World.Constants.gravity * massOrbited / dist.mag());
    var dir = new Vector(dist.y, -dist.x).normalize();
    console.log(posOrbiting, dir, mag);
    return dir.mult(mag).add(velOrbited || 0);
}

function placeToOrbit(orbiting, around){
    orbiting.vel = getSpeedForStableOrbit(orbiting.pos, around.pos, around.mass, around.vel);
}

function placeToBounds(obj, x, y, w, h){
    var rel = new Vector(obj.pos.x - (x+w/2), obj.pos.y - (y + h/2));
    if(Math.abs(rel.x) > (w/2)){
        // obj.pos.x = rel.x%(w) + (-w)*Math.sign(rel.x) + x; //-4%3 - 3*sign(-4) + 0= -1 - (-3) = 2
        // obj.pos.x = -Math.sign(obj.pos.x)*w/2;
        obj.pos.x = x + w/2 - Math.sign(rel.x)*(w/2); //x + w/2 - Math.sign(rel.x)*(w/2) - to keep obj in bounds. Можно ли это использовать для исправления backgroundUniverse?
    }//-3%3 - 3*sign(-3) = 0 - (-3)= 3
    if(Math.abs(rel.y) > (h/2)){
        obj.pos.y = y + h/2 - Math.sign(rel.y)*(h/2);
    }
}

function getDistInBounds(from, to, x = 0, y = 0, w = renderModule.app.screen.width, h = renderModule.app.screen.height){
    var firstX = to.x - from.x;
    var secondX = w*Math.sign(from.x - to.x) - from.x + to.x;
    distX = Math.abs(firstX) < Math.abs(secondX) ? firstX : secondX; //Math.min(Math.abs(to.x - from.x), Math.abs((to.x - w) - from.x))

    var firstY = to.y - from.y;
    var secondY = h*Math.sign(from.y - to.y) - from.y + to.y;
    distY = Math.abs(firstY) < Math.abs(secondY) ? firstY : secondY;

    // console.log(firstX, secondX)
    return new Vector(distX + x, distY + y);
}