class Game{
    constructor(){
        //globals
        this.world;
        this.gui;

        this.fps = new FPS();
        this.myfps = new myFPS();

        this.FPSCount = 0;
        this.startTime;
        this.endTime;
        this.timeDiff;
        this.maxDiff;
        //var inputManager;
    }

    setup(){
        console.log("work");
        //inputManager = InputManager;
        renderModule.start();
        this.world = new World();
        this.gui = GUI;
        this.world.Setup();
        this.gui.Setup();


        // var planet1 = new Asteroid(new Vector(600, 360), 1800, new Vector(0, 0), 0);
        // var planet2 = new Asteroid(new Vector(950, 660), 200);
        // placeToOrbit(planet2, planet1);
        var planet3 = new Asteroid(new Vector(250, 60), 200);
        // placeToOrbit(planet3, planet1);

        var playerShip = new PlayerShip(new Vector(600, 300), new Vector(), 1.7);
        // playerShip.mass = 1;
        // placeToOrbit(playerShip, planet3);
        var enemy1 = new EnemyShip(new Vector(950, 690), new Vector(), 0, playerShip);
        // placeToOrbit(enemy1, planet3);

        var enemy2 = new UFO(new Vector(300, 80));
        enemy2.prey = playerShip;

        var Base = new FriendlyBigShip(new Vector(400, 400));
        this.world.placeToOrbit(Base, planet3)

        var Tank = new EnemyTank(new Vector(600, 600));
        Tank.prey = playerShip;

        var seeker = new Seeker();
        seeker.prey = playerShip;

        var realAsteroid = new RealAsteroid(new Vector(500, 500), 50);

        this.world.Instantiate([playerShip, enemy1, enemy2, Base, planet3, Tank, seeker, realAsteroid]);
    
        for (let i = 0; i < 5; i++) {
            var ufo = new UFO(new Vector(Math.random()*1800, Math.random()*720));
            ufo.prey = playerShip;
            this.world.Instantiate(ufo);
        }
        for (let i = 0; i < 5; i++) {
            var enemy = new EnemyShip(new Vector(Math.random()*1800, Math.random()*720));
            enemy.prey = playerShip;
            this.world.Instantiate(enemy);
        }

        renderModule.pinViewportTo(playerShip);
        this.world.worldBorders.multSize(2);
        this.world.worldBorders.objToFollow = playerShip;
    }

    gameLoop(){
        Keyboard.UpdateKeyboard();
        // console.log(this, game)
        this.world.Update();
        this.gui.Update();

        //sleep(20);
        renderModule.updateViewport();

        this.world.Render();
        this.gui.Render();

        //console.log(Keyboard.getKeyPressed("w"));
        //console.log(Keyboard.getKeyReleased("w"));
        //console.log(Keyboard.keyboardNow["w"] + " " + Keyboard.prevKeyboard["w"] + " " + Keyboard.prevPrevKeyboard["w"]);

        if(Keyboard.getKeyPressed("p")){
            this.world.isPaused = !this.world.isPaused;
        }
        this.myfps.update();

        // console.log("FPS:", myfps.getAverageFPS());
        
        // console.log(this.gameLoop)
        // window.requestAnimationFrame(this.gameLoop);
    }
}

function updateAll(){
    game.gameLoop();
    window.requestAnimationFrame(updateAll);
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
        break;
        }
    }
}

function measureTimeOfFunction(func, ...a){//Работает ли?
    var start = performance.now();
    for(var i = 0; i < 1000; i++){
        func(...a);
    }
    var end = performance.now();
    return end - start;
}

function randomFromTo(from, to){
    return Math.random()*(to-from) + from;
}

function map(value, f1, t1, f2, t2){
    return value / (t1-f1) * (t2-f2) + f2;
}