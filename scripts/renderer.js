class renderModule{ //Graphics Manager
	static loadImages(){
		
	}
	static images = {

	};
	static app;
	static renderer;
	static Graphics;

	static spriteTemplates = {};

	static camera = {
		pos: new Vector(),
		scale: new Vector(),
		rotation: 0,
		width: window.innerWidth,
		height: window.innerHeight,
		objToFollow: undefined,
	};

	static start(){
		let type = "WebGL"
		if(!PIXI.utils.isWebGLSupported()){
			type = "canvas"
		}

		PIXI.utils.sayHello(type)
		console.log(PIXI)


		//Create a Pixi Application
		renderModule.app = new PIXI.Application({
			width: window.innerWidth, //innerWidth
			height: window.innerHeight,
			antialias: true,
			transparent: false,
			resolution: 1,
			//resizeTo: window
		});
		renderModule.renderer = renderModule.app.renderer;
		renderModule.Graphics = PIXI.Graphics;


		console.log(renderModule.app.view.width, window.clientWidth, window.innerWidth)
		//Add the canvas that Pixi automatically created for you to the HTML document
		document.body.appendChild(renderModule.app.view);

		renderModule.spriteTemplates.Laser = new renderModule.Graphics().lineStyle(2, 0xFF00FF, 1).beginFill(0x650A5A, 0.25).drawRoundedRect(0, 0, 10, 2, 2).endFill();
		renderModule.spriteTemplates.RepulsionWave = renderModule.getPolygon([
            {x: 1/3, y: -1},
            {x: 1, y: -1/3},
            {x: 1, y: 1/3},
            {x: 1/3, y: 1},
            {x: -1/3, y: 1},
            {x: -1, y: 1/3},
            {x: -1, y: -1/3},
            {x: -1/3, y: -1}
        ], false);
		renderModule.spriteTemplates.Seeker = renderModule.getPolygon([
			{x: 1, y: 0},
			{x: -1/2, y: 1*Math.sqrt(3)/2},
			{x: 0, y: 0},
			{x: -1/2, y: -1*Math.sqrt(3)/2}
		], false);
	}

	static draw(){
		renderModule.renderer.render();
	}

	static drawFigure(graphics, pos, rotation){
		graphics.x = pos.x;
		graphics.y = pos.y;
		graphics.rotation = rotation;
	}

	static addFigure(graphics){
		renderModule.app.stage.addChild(graphics);
	}

	static getRect(w, h){//Рисует прямоугольник на буффер и передаёт буффер на stage, где потом рендерится на view PIXI
		var rectangle = new renderModule.Graphics();
		rectangle.lineStyle(4, 0xFF3300, 1);
		rectangle.beginFill(0x66CCFF);
		rectangle.drawRect(0, 0, w, h);
		rectangle.endFill();
		rectangle.x = 0;
		rectangle.y = 0;
		renderModule.app.stage.addChild(rectangle);

		return rectangle;
	}

	static drawRect(graphics, pos){
		graphics.x = pos.x;
		graphics.y = pos.y;
	}

	static getPolygon(verts, addToStage = true){
		var poly = new renderModule.Graphics();
		var points = [];
		verts.forEach(point => points.push(point.x, point.y));

		poly.beginFill(0x5d0015);
		poly.drawPolygon(points);
		poly.endFill();
		if(addToStage){
			renderModule.app.stage.addChild(poly);
		}

		return poly;
	}
	static drawPolygon(graphics, pos, rotation){
		renderModule.drawFigure(graphics, pos, rotation);
	}

    static getCircle(radius){
        var circle = new renderModule.Graphics();

        circle.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
        circle.beginFill(0xDE3249, 1);
        circle.drawCircle(0, 0, radius);
        circle.endFill();
        renderModule.app.stage.addChild(circle);

        return circle;
    }

	static drawCircle(graphics, pos){
        graphics.x = pos.x;
		graphics.y = pos.y;
	}

	static drawImage(){

	}

	static pinCameraTo(obj){
		renderModule.camera.objToFollow = obj;
	}

	static updateCamera(){
		renderModule.camera.pos.x = renderModule.camera.objToFollow.pos.x;
		renderModule.camera.pos.y = renderModule.camera.objToFollow.pos.y;

		renderModule.app.stage.x = -renderModule.camera.pos.x + renderModule.camera.width/2;
		renderModule.app.stage.y = -renderModule.camera.pos.y + renderModule.camera.height/2;
	}
}