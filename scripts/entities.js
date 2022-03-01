class Entity{
    constructor(pos = new Vector(0, 0), mass = 1, vel = new Vector(0, 0), rotation = 0){
        this.pos = pos;
        this.vel = vel;
        this.maxVelocity = 5;
        this.acc = new Vector(0, 0);

        this.rotation = rotation;
        this.rotationSpeed = 0;
        this.rotationAcceleration = 0;
        this.maxRotationSpeed = 0.2;

        this.mass = mass;
        this.tags = "Entity";
        this.sprite = {};
        this.physicsBody = {};

        this.physicsBody.type = "Circle";
        this.r = 1;

        this.maxHealth = 100;
        this.health = 100;
        this.energy = 100;

        this.Destroyed = false;
    }

    Update(){
        this.vel = this.vel.add(this.acc);
        if(this.vel.mag() > this.maxVelocity){
            this.vel = Vector.cap(this.vel, this.maxVelocity);
            // console.log("Don't go faster than light! You're just an electron, goofy.");
        }
        this.pos = this.pos.add(this.vel);
        this.acc = this.acc.mult(0);

        this.rotationSpeed += this.rotationAcceleration;
        this.rotation += this.rotationSpeed;
        this.rotationAcceleration = 0;

        this.rotation = this.rotation%(2*Math.PI);
    }

    Draw(){
        if(this.sprite.visible){//проверка не пустой ли это объект.
            renderModule.drawFigure(this.sprite, this.pos, this.rotation);
        }
    }

    ApplyForce(force){
        this.acc = this.acc.add(force.div(this.mass));
    }

    ApplyAcceleration(acceleration){
        this.acc = this.acc.add(acceleration);
    }

    ApplyTorque(torque, point, isWorldCoords = false){
        var M = isWorldCoords ? this.pos.copy().sub(point || Vector.fromAngles(0, this.rotation)) : (point || Vector.fromAngles(0, this.rotation));
        if(torque instanceof Vector){
            var sinA = Vector.cross(M, torque)/ (torque.mag()*M.mag());
            this.rotationAcceleration += torque.mag() * sinA / M.mag();
        }else{
            this.rotationAcceleration += torque / M.mag();
        }

        if(Math.abs(this.rotationSpeed) > this.maxRotationSpeed){
            this.rotationSpeed = this.maxRotationSpeed * Math.sign(this.rotationSpeed);
            // console.log("It's spinning faster than a supermassive blackhole!");
        }
    }

    ApplyRotationAcceleration(acceleration){
        this.rotationAcceleration += acceleration;
    }

    colliding(obj){
        if(obj.physicsBody.type == "Circle"){
            return doCirclesOverlap(this, obj);
        } else return false;
    }


    //Добавить трение, замедляющее движение перпендикулярно столкновению. Кажется, я где-то уже так делал.
    //Добавить ломание объекта при столкновении
    resolveCollision(obj){ //Если масса объекта равна нулю, то он становиться неосязаем - проверено(доказано) экспериментом
        if(obj.physicsBody.type == "Circle"){
            // get the mtd
            var delta = (this.pos.sub(obj.pos));
            var d = delta.mag();
            // minimum translation distance to push balls apart after intersecting
            var mtd = delta.mult(((this.r + obj.r)-d)/d); 


            // resolve intersection --
            // inverse mass quantities
            var im1 = 1 / this.mass; 
            var im2 = 1 / obj.mass;

            // push-pull them apart based off their mass
            this.pos = this.pos.add(mtd.mult(im1 / (im1 + im2)));
            obj.pos = obj.pos.sub(mtd.mult(im2 / (im1 + im2)));

            // impact speed
            var v = (this.vel.sub(obj.vel));
            var vn = v.dot(mtd.normalize());

            // sphere intersecting but moving away from each other already
            if (vn > 0) return;

            // collision impulse
            var i = (-(1 + World.Constants.restitution) * vn) / (im1 + im2);
            var impulse = mtd.normalize().mult(i);

            // change in momentum
            this.vel = this.vel.add(impulse.mult(im1));
            obj.vel = obj.vel.sub(impulse.mult(im2));
        } else return;
    }

    Destroy(){
        this.sprite.destroy();
    }

    PreCollide(){}

    PostCollide(){}

    HasTags(...a){
        var tags = this.tags.split(/[ ,]+/);
        // console.log(a)
        for(var i = 0; i < a.length; i++){
            const tag = a[i];
            // console.log(tags, tags.includes(tag), tag)
            if(!tags.includes(tag)){
                return false;
            }
        }
        return true;
    }

    DealDamage(damage){
        this.health -= damage;
        this.health = Math.max(0, this.health);

        if(this.health <= 0){
            this.postDeath();
            game.world.Destroy(this);
        }
    }

    Heal(amount){
        this.health += amount;
        this.health = Math.min(this.maxHealth, this.health);
    }

    preDeath(){}

    postDeath(){}
}

class Asteroid extends Entity{
    constructor(pos, mass, vel, rotation){
        super(pos, mass, vel, rotation);
        this.r = Math.sqrt(this.mass/Math.PI);
        this.tags = "Asteroid";
        this.sprite = renderModule.getCircle(this.r);
        this.physicsBody.type = "Circle";
    }

    Update(){
        super.Update();
        //this.acc.y = -0.1;
        //console.log(this.pos.x, this.pos.y);
    }

    Draw(){
        super.Draw();

        //ellipse(this.pos.x, this.pos.y, this.r*2);

        renderModule.drawCircle(this.sprite, this.pos);
    }
}

function doCirclesOverlap(circle1, circle2){
    return ((circle1.pos.x - circle2.pos.x) **2 + (circle1.pos.y - circle2.pos.y) **2) <= (circle1.r + circle2.r)**2;
}

function Distance(obj1, obj2){ //distance between two objects
    //return Math.sqrt((obj1.pos.x - obj2.pos.x) **2 + (obj1.pos.y - obj2.pos.y) **2);
    return obj1.pos.dist(obj2.pos).mag();
}


class PlayerShip extends Entity{
    constructor(pos, vel, rotation){
        super(pos, 3, vel, rotation);
        this.tags = "Player Ship";
        this.r = Math.sqrt(this.mass/Math.PI) * 10;
        this.sprite = renderModule.getPolygon([
            {x: -this.r, y: this.r},
            {x: this.r, y: 0},
            {x: -this.r, y: -this.r}
        ]);
        this.physicsBody.type = "Circle";

        this.speed = 0.15;
        this.torqueTrust = 3; //0.76
        this.maxRotationSpeed = 0.06;
        this.boostCooldown = 300;
        this.shootingCooldown = 13;

        GUI.constructMeter(this, "health");
    }

    Update(){
        if(this.rotationAcceleration === 0){
            this.rotationSpeed *= 0.99;
        }
        super.Update();
        if(Keyboard.getKeyDown("w")){
            var dir = Vector.fromAngles(0, this.rotation);
            // console.log(dir)
            this.ApplyAcceleration(dir.mult(this.speed));
            // console.log(dir);
            // console.log("Pushing ship forward");
        }

        this.boostCooldown++;
        if(Keyboard.getKeyPressed("s")){
            if(this.boostCooldown >= 300){
                var dir = Vector.fromAngles(0, this.rotation);
                this.ApplyAcceleration(dir.mult(5));
                this.boostCooldown = 0;
            }
        }

        if(Keyboard.getKeyDown("a")){
            // this.ApplyTorque(-this.torqueTrust);
            this.rotation += -0.06;
        }
        if(Keyboard.getKeyDown("d")){
            // this.ApplyTorque(this.torqueTrust);
            this.rotation += 0.06;
        }

        this.shootingCooldown++;
        if(Keyboard.getKeyDown(" ")){
            if(this.shootingCooldown >= 13){
                var dir = Vector.fromAngles(0, this.rotation);
                game.world.Instantiate(new Laser(this.pos.add(dir.mult(this.r + 2)), dir.mult(Laser.speed + this.vel.mag()))); //TODO: add "+ ship radius" to laser's pos
                this.ApplyForce(dir.negative().mult(0.05)); //0.05 * Laser.mass
                this.shootingCooldown = 0;
            }
        }

        if(Keyboard.getKeyDown("q")){
            if(this.shootingCooldown >= 20){
                var dir = Vector.fromAngles(0, this.rotation);
                game.world.Instantiate(new RepulsionWave(this.pos, this.vel, 50, 20));
                this.shootingCooldown = 0;
            }
        }
    }

    Draw(){
        super.Draw();
        renderModule.drawPolygon(this.sprite, this.pos, this.rotation);
    }

    DealDamage(){}//Godmode
}

class EnemyShip extends Entity{
    constructor(pos, vel, rotation, prey = {}){
        super(pos, 3, vel, rotation);
        this.tags = "Enemy Ship";
        this.r = Math.sqrt(this.mass/Math.PI) * 10;
        this.sprite = renderModule.getPolygon([
            {x: this.r, y: 0},
            {x: 0, y: -this.r*0.8},
            {x: -this.r, y: -this.r*0.8},
            {x: -this.r, y: this.r*0.8},
            {x: 0, y: this.r*0.8}
        ]);
        this.physicsBody.type = "Circle";

        this.prey = prey;
        this.speed = 3;
        this.shootingCooldown = 20;
    }

    Update(){
        // if(this.rotationAcceleration === 0){
        //     this.rotationSpeed *= 0.99;
        // }
        super.Update();

        if(this.prey.pos){
            // var force = this.prey.pos.sub(this.pos).unit().mult(this.speed);
            // console.log(this.prey)
            var dist = game.world.getDistInBounds(this.pos, this.prey.pos);
            this.rotation = Vector.toAngle2D(dist);
            var force = Vector.fromAngles(0, this.rotation).mult(dist.mag()/400);
            this.ApplyForce(force);

            if(dist.mag() < 90){
                this.shootingCooldown++;
                if(this.shootingCooldown >= 20){
                    game.world.Instantiate(new Laser(this.pos.add(this.vel.mult(1).add(Vector.fromAngles(0, this.rotation).mult(this.r + 2))), this.acc.mult(50)));
                    this.shootingCooldown = 0;
                }

                if(dist.mag() < 60){
                    this.ApplyForce(dist.negative().unit().add(Vector.getPerpendicularLeft(dist.unit()).mult((Math.random()*2-1)*6)).mult(3));
                }
            } else{
                this.shootingCooldown = 20;
            }
        }
        // if(Keyboard.getKeyDown("w")){
        //     var dir = Vector.fromAngles(0, this.rotation);
        //     console.log(dir)
        //     this.ApplyAcceleration(dir.mult(0.15));
        //     console.log(dir);
        //     console.log("Pushing ship forward");
        // }

        // if(Keyboard.getKeyDown("a")){
        //     this.ApplyTorque(-this.torqueTrust);
        // }
        // if(Keyboard.getKeyDown("d")){
        //     this.ApplyTorque(this.torqueTrust);
        // }
    }

    Draw(){
        super.Draw();
        renderModule.drawPolygon(this.sprite, this.pos, this.rotation);
    }
}

class Laser extends Entity{
    constructor(pos, vel){
        super(pos, 1, vel);
        this.tags = "Enemy Laser";
        this.mass = 1;
        this.maxVelocity = 15;

        this.sprite = new renderModule.Graphics(renderModule.spriteTemplates.Laser.geometry);
        renderModule.addFigure(this.sprite);

        this.physicsBody.type = "Circle";
        this.r = 1;

        this.lifetime = 100;
    }

    static speed = 10;

    Update(){
        super.Update();
        this.rotation = Vector.toAngle2D(this.vel);
        this.lifetime--;
        if(this.lifetime <= 0){
            game.world.Destroy(this);
        }
    }

    Draw(){
        super.Draw();
        renderModule.drawFigure(this.sprite, this.pos, this.rotation);
    }

    PostCollide(obj){
        if(!(obj.HasTags("Laser") || obj.HasTags("Missile"))){
            obj.ApplyForce(this.vel);
            obj.DealDamage(10);
            game.world.Destroy(this);
        }
    }
}

class Missile extends Entity{
    constructor(pos, vel){
        super(pos, 1, vel);
        this.tags = "Enemy Missile";
        this.mass = 0;
        this.maxVelocity = 15;

        this.sprite = new renderModule.Graphics(renderModule.spriteTemplates.Laser.geometry);
        renderModule.addFigure(this.sprite);

        this.physicsBody.type = "Circle";
        this.r = 1;

        this.lifetime = 100;
    }

    static speed = 10;

    Update(){
        super.Update();
        this.rotation = Vector.toAngle2D(this.vel);
        //самонаводиться на ближайшую цель в каком-нибудь радиусе. Для этого нужны сенсоры и эффекторы
        this.lifetime--;
        if(this.lifetime <= 0){
            //Взорваться, задев всё, что находиться вокруг
            game.world.Destroy(this);
        }
    }

    Draw(){
        super.Draw();
        renderModule.drawFigure(this.sprite, this.pos, this.rotation);
    }
}

class UFO extends Entity{
    constructor(pos = new Vector(), vel, rotation = 0, prey = {}){
        super(pos, 4, vel, rotation);
        this.tags = "Enemy UFO";
        this.r = Math.sqrt(this.mass/Math.PI) * 10;
        this.sprite = renderModule.getPolygon([
            {x: -this.r, y: 0},
            {x: -this.r/2, y: -this.r/2},
            {x: -this.r/4, y: -this.r},
            {x: this.r/4, y: -this.r},
            {x: this.r/2, y: -this.r/2},
            {x: this.r, y: 0},
            {x: this.r/2, y: this.r/2},
            {x: -this.r/2, y: this.r/2},
        ]);
        this.physicsBody.type = "Circle";

        this.prey = prey;
        this.speed = 3;

        this.boostCooldown = 0;
        this.boostSpeed = 10;
    }

    Update(){
        super.Update();

        this.rotation = Vector.toAngle2D(this.vel) + Math.PI/2;

        if(this.prey.pos){
            // console.log(this.pos, this.prey.pos)
            var dist = game.world.getDistInBounds(this.pos, this.prey.pos);
            
            if(dist.mag() > 90){
                if(this.boostCooldown >= 60){
                    this.boostCooldown = 0;
                    this.ApplyForce(dist.unit().mult(this.boostSpeed));
                } else{
                    this.boostCooldown++;
                }
            } else{
                this.rotation = Vector.toAngle2D(dist) - Math.PI/2;
                this.ApplyForce(dist.unit().mult(60).sub(dist).negative().mult(0.1));
                if(this.boostCooldown >=60){
                    this.ApplyForce(Vector.fromAngles(0, this.rotation + (Math.floor(Math.random()*2-1)*Math.PI)).mult(this.speed));
                    this.boostCooldown = 0;
                } else {
                    this.boostCooldown++;
                }
                this.prey.ApplyForce(Vector.fromAngle2D(Math.random()*Math.PI*2));
                // this.prey.ApplyForce(Vector.randomDirection()); //Почему-то это ломает корабль и вообще всю физику. Почему?!
            }
        }
    }
    //Луч, мешающий двигаться. Добавляет случайный вектор силы. Мешает кораблю передвигаться, маневрировать, уклоняться

    Draw(){
        super.Draw();
        renderModule.drawPolygon(this.sprite, this.pos, this.rotation);
    }
}

class FriendlyBigShip extends Entity{
    constructor(pos, vel){
        super(pos, 100, vel);
        this.tags = "Friend Ship";
        this.r = Math.sqrt(this.mass/Math.PI) * 10;
        this.sprite = renderModule.getCircle(this.r);
        this.physicsBody.type = "Circle";
        
        this.shootingCooldown = 100;
        this.currentShootingCooldown = this.shootingCooldown;
    }

    Update(){
        super.Update();
        if(this.currentShootingCooldown >= this.shootingCooldown){
            /*var dir = Vector.fromAngles(0, Math.random()*Math.PI*2);
            game.world.Instantiate(new RepulsionWave(this.pos.add(dir.mult(this.r + 0.5)), this.vel.add(dir.mult(RepulsionWave.speed))));*/
            game.world.Instantiate(new RepulsionWave(this.pos, this.vel));
            this.currentShootingCooldown = 0;
        } else{
            this.currentShootingCooldown++;
        }
    }

    Draw(){
        super.Draw();
    }
}

class RepulsionWave extends Entity{// Переделать, чтобы силовое поле расширялось и отталкивало волнами объекты от её центра, как заклинание патронус отталкивает дементоров.
    constructor(pos, vel, maxRadius = 250, lifetime = 300){
        super(pos, 0, vel); // mass = 0 -> проходит сквозь объекты. Но тогда может ли этот объект получать событие PreCollide?
        this.tags = "Friend Missile";
        this.r = 1;
        this.maxRadius = maxRadius;

        this.sprite = new renderModule.Graphics(renderModule.spriteTemplates.RepulsionWave.geometry);
        renderModule.addFigure(this.sprite);

        this.physicsBody.type = "Circle";
        this.rotationSpeed = 0.05;

        this.lifetime = lifetime;
        this.currentLifetime = this.lifetime;
    }

    static speed = 1;

    Update(){
        super.Update();

        this.r = (this.lifetime-this.currentLifetime)/this.lifetime*this.maxRadius;

        this.currentLifetime--;
        if(this.currentLifetime <= 0){
            game.world.Destroy(this);
        }
    }

    PreCollide(obj){
        // console.log(obj.tags.split(/[ ,]+/));
        // console.log(obj, !obj.HasTags("Friend", "Player"))
        if(!(obj.HasTags("Friend") || obj.HasTags("Player"))){
            obj.ApplyForce(this.vel.add(game.world.getDistInBounds(this.pos, obj.pos).reverse().mult(this.maxRadius*10)));
            // console.log(obj.pos.sub(this.pos), game.world.getDistInBounds(obj.pos, this.pos), obj.pos, this.pos)
        } else{
            obj.Heal(0.01);
        }
        // else if(obj.HasTags("Player")){
        //     obj.ApplyForce(this.pos.sub(obj.pos).unit().mult(this.pos.sub(obj.pos).mag() - 35));
        // }
    }

    Draw(){
        super.Draw();
        this.sprite.scale.x = (this.lifetime-this.currentLifetime)/this.lifetime*this.maxRadius;
        this.sprite.scale.y = (this.lifetime-this.currentLifetime)/this.lifetime*this.maxRadius;
        this.sprite.alpha = (this.currentLifetime)/this.lifetime;
    }
}

class EnemyTank extends Entity{
    constructor(pos, vel, rotation, prey = {}){
        super(pos, 20, vel, rotation);
        this.tags = "Enemy Ship";
        this.r = Math.sqrt(this.mass/Math.PI) * 10;
        this.sprite = renderModule.getPolygon([
            {x: -this.r/3, y: 0},
            {x: -this.r, y: -this.r*0.8},
            {x: this.r, y: -this.r*0.4},
            {x: this.r, y: this.r*0.4},
            {x: -this.r, y: this.r*0.8}
        ]);
        this.physicsBody.type = "Circle";

        this.prey = prey;
        this.speed = 3;
        this.shootingCooldown = 30;
    }

    Update(){
        super.Update();

        if(this.prey.pos){
            var dist = game.world.getDistInBounds(this.pos, this.prey.pos);
            this.rotation = Vector.toAngle2D(dist);
            var force = Vector.fromAngles(0, this.rotation).mult(dist.mag()/400);
            this.ApplyForce(force);

            if(dist.mag() < 250){//shotgun
                this.shootingCooldown++;
                if(this.shootingCooldown >= 30){
                    var position = this.pos.add(this.vel.mult(1).add(Vector.fromAngles(0, this.rotation).mult(this.r + 2)));
                    for(var i = 0; i < 4; i++){
                        var dir = Vector.fromAngle2D(this.rotation + (Math.random()*2-1)*Math.PI/6 );
                        var vel = dir.mult(10 + (Math.random()*2-1)*2 );
                        game.world.Instantiate(new Laser(position, vel));
                    }
                    this.shootingCooldown = 0;
                }

                if(dist.mag() < 60){
                    this.ApplyForce(dist.negative().unit().add(Vector.getPerpendicularLeft(dist.unit()).mult((Math.random()*2-1)*6)).mult(3));
                }
            } else if(dist.mag() <400){//Homing missiles
                if(this.shootingCooldown >= 30){
                    var position = this.pos.add(Vector.fromAngle2D(this.rotation).mult(this.r + 1)).add(this.vel);
                    game.world.Instantiate(new Laser(position.add(Vector.getPerpendicularLeft(dist.unit()).mult(5)), dist.unit().mult(15)));
                    game.world.Instantiate(new Laser(position.add(Vector.getPerpendicularRight(dist.unit()).mult(5)), dist.unit().mult(15)));
                    this.shootingCooldown = 0;
                } else{
                    this.shootingCooldown++;
                }
                
            } else{
                this.shootingCooldown = 20;
            }
        }
    }

    Draw(){
        super.Draw();
        renderModule.drawPolygon(this.sprite, this.pos, this.rotation);
    }
}

class Seeker extends Entity{
    constructor(pos, vel, rotation, prey = {}){
        super(pos, 4, vel, rotation);
        this.tags = "Enemy Seeker";

        this.sprite = new renderModule.Graphics(renderModule.spriteTemplates.Seeker.geometry);
        renderModule.addFigure(this.sprite);

        this.physicsBody.type = "Circle";
        this.r = 20;
        this.sprite.scale.x = this.r;
        this.sprite.scale.y = this.r;

        this.maxVelocity = 4;

        this.prey = prey;

        this.rotationController = new PIDController(2, 2, 0.01, 1/60);
    }

    Update(){
        super.Update();
        if(this.prey.pos){
            var dist = game.world.getDistInBounds(this.pos, this.prey.pos);

            this.rotation = this.rotationController.calculate(Vector.toAngle2D(this.vel), Vector.toAngle2D(dist));
            this.ApplyForce(Vector.fromAngle2D(this.rotation).mult(1));
        }
    }

    Draw(){
        super.Draw();
        renderModule.drawFigure(this.sprite, this.pos, this.rotation);
    }
}

class RealAsteroid extends Entity{
    constructor(pos, r = 10, vel){
        super(pos, Math.PI * (r**2)/300, vel);
        this.tags = "Stuff Asteroid";
        this.r = r;

        this.vertNum = Math.floor(randomFromTo(5, 15));
        var offset = [];
        for (var i = 0; i < this.vertNum; i++) {
        offset[i] = randomFromTo(-this.r*0.5, this.r*0.5);
        }
        this.verts = [];
        for (var i = 0; i < this.vertNum; i++) {
            var angle = map(i, 0, this.vertNum, 0, Math.PI*2);
            // console.log(map(i, 0, 5, 0, Math.PI*2))
            // console.log(this.vertNum)
            var r = this.r + offset[i];
            var X = r * Math.cos(angle);
            var Y = r * Math.sin(angle);
            this.verts.push({x: X, y: Y});
            // console.log(this.r)
        }
        // console.log(offset, this.verts)
        
        this.sprite = renderModule.getPolygon(this.verts);
    }

    breakup(){
        if(this.r > 10){
            var newVelA = this.vel.copy().rotate(Math.PI/4);
            var newVelB = this.vel.copy().rotate(-Math.PI/4);
            // console.log(newVelA, newVelB);
            game.world.Instantiate(new RealAsteroid(new Vector(this.pos.x - (4 + this.r), this.pos.y), this.r/2, newVelA));
            game.world.Instantiate(new RealAsteroid(new Vector(this.pos.x + 4 + this.r, this.pos.y), this.r/2, newVelB));
        }
    }

    postDeath(){
        this.breakup();
    }
}