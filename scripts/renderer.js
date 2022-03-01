class renderModule{ //Graphics Manager
	static loadImages(){
		
	}
	static images = {

	};
	static app;
	static renderer;
	static Graphics;

	static spriteTemplates = {};

	static viewport;
	static objToFollow;

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

		renderModule.viewport = new pixi_viewport.Viewport({
			screenWidth: window.innerWidth,
			screenHeight: window.innerHeight,
			worldWidth: 1000,
			worldHeight: 1000,
		})
		renderModule.app.stage.addChild(renderModule.viewport);
	}

	static draw(){
		renderModule.renderer.render();
	}

	static drawFigure(graphics, pos, rotation){
		graphics.x = pos.x;
		graphics.y = pos.y;
		graphics.rotation = rotation;
	}

	//add to viewport, world not screen
	static addFigure(graphics){
		renderModule.viewport.addChild(graphics);
	}

	static addFigureToScreen(graphics){
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
		renderModule.addFigure(rectangle);

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
			renderModule.addFigure(poly);
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
        renderModule.addFigure(circle);

        return circle;
    }

	static drawCircle(graphics, pos){
        graphics.x = pos.x;
		graphics.y = pos.y;
	}

	static drawImage(){

	}

	static pinViewportTo(obj){
		renderModule.objToFollow = obj;
	}

	static updateViewport(){
		if(renderModule.objToFollow){
			renderModule.viewport.x = -renderModule.objToFollow.pos.x + renderModule.viewport.screenWidth/2;
			renderModule.viewport.y = -renderModule.objToFollow.pos.y + renderModule.viewport.screenHeight/2;
		}
	}
}