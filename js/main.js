export var PIXI = window["PIXI"];

const NORTH = {
	id: 0,
  direction: "North",
};
const EAST = {
	id: 1,
  direction: "East",
};
const SOUTH = {
	id: 2,
  direction: "South",
};
const WEST = {
	id: 3,
  direction: "West",
};

const keyboardMap = {};

const getKey = (key) => {
	if(keyboardMap[key])
		return keyboardMap[key];
	return {
		press: false,
		held: false,
		released: false
	};
}

const GAME_SPEED = 60;
const SCREEN_GRID_WIDTH = 8;
const SCREEN_GRID_HEIGHT = 6;
let GRID_SIZE;

let sceneManager;

class Player {
  
  constructor() {
  	this.sprite = {};
    this.x = 0;
    this.y = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.currentDirection = SOUTH;
    this.playerSpeed = 5 * GAME_SPEED;
  }
  
  move(offsetX, offsetY) {
  	if(sceneManager.getCollisionHeight(this.x, this.y) !=
  		 sceneManager.getCollisionHeight(this.x + offsetX, this.y + offsetY))
  		return
  	this.x += offsetX;
  	this.y += offsetY;
  	this.offsetX -= offsetX;
  	this.offsetY -= offsetY;
  }
  
  moveDirection(direction) {
    if(direction == SOUTH) {
      this.move(0, 1);
    }
    if(direction == NORTH) {
      this.move(0, -1);
    }
    if(direction == EAST) {
      this.move(1, 0);
    }
    if(direction == WEST) {
      this.move(-1, 0);
    }
  }
  
  updateMovement() {
  	if(this.offsetX != 0 || this.offsetY != 0) {
  		const delta = 1.0 / this.playerSpeed;
  		if(Math.abs(this.offsetX) > delta) {
  			//this.x += Math.sign(this.offsetX) * delta;
  			this.offsetX -= Math.sign(this.offsetX) * delta;
  		} else {
  			//this.x += this.offsetX;
  			this.offsetX = 0;
  		}
  		if(Math.abs(this.offsetY) > delta) {
  			//this.y += Math.sign(this.offsetY) * delta;
  			this.offsetY -= Math.sign(this.offsetY) * delta;
  		} else {
  			//this.y += this.offsetY;
  			this.offsetY = 0;
  		}
  		return;
    }
    
    if(getKey("w").held) {
    	this.moveDirection(NORTH);
    } else if(getKey("s").held) {
    	this.moveDirection(SOUTH);
    } else if(getKey("a").held) {
    	this.moveDirection(WEST);
    } else if(getKey("d").held) {
    	this.moveDirection(EAST);
    }
  }
  
  tick() {
  	this.updateMovement();
  }
  
}

const textures = {};

let APPLICATION_WIDTH;
let APPLICATION_HEIGHT;


class SceneManager extends PIXI.Container {

	constructor() {
  	super();
	  this.scenes = [{
	  	startPoint: {x: 2, y: 2},
	  	textureGrid: [
	  		[0,1,1,1,1,1,1,1,1,1,2],
	  		[3,4,4,4,4,4,4,4,4,4,5],
	  		[3,4,4,4,4,4,4,4,4,4,5],
	  		[3,4,4,4,4,4,4,4,4,4,5],
	  		[3,0,1,2,4,4,4,4,4,4,5],
	  		[3,6,7,8,4,4,4,4,4,4,5],
	  		[3,9,10,11,4,4,4,4,4,4,5],
	  		[3,4,4,4,4,4,4,4,4,4,5],
	  		[3,4,4,4,4,4,4,4,4,4,5],
	  		[3,4,4,4,4,4,4,4,4,4,5],
	  		[6,7,7,7,7,7,7,7,7,7,8],
	  	],
	  	collisionHeightmap: [
	  		[0,0,0,0,0,0,0,0,0,0,0],
	  		[0,0,0,0,0,0,0,0,0,0,0],
	  		[0,0,0,0,0,0,0,0,0,0,0],
	  		[0,0,0,0,0,0,0,0,0,0,0],
	  		[0,1,1,1,0,0,0,0,0,0,0],
	  		[0,1,1,1,0,0,0,0,0,0,0],
	  		[0,1,1,1,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0],
	  		[0,0,0,0,0,0,0,0,0,0,0],
	  		[0,0,0,0,0,0,0,0,0,0,0],
	  	],
	  	spriteGrid: [
	  		{x: 5, y: 1, id: "tree"},
	  		{x: 8, y: 1, id: "tree"},
	  		{x: 2, y: 5, id: "tree"},
	  	],
	  }];
	  this.currentScene = null;
	  this.layer = new PIXI.Container();
	  this.addChild(this.layer);
	  this.sprites = [];
	  this.spriteMap = {};
	  this.player = new Player();
	}
	
	switchScene(sceneNumber) {
		const scene = this.scenes[sceneNumber];
		this.currentScene = scene;
		this.layer.removeChildren();
		this.spriteMap = {};
		this.sprites = [];
		this.player.x = scene.startPoint.x;
		this.player.y = scene.startPoint.y;
		//texturesPIXI.Texture.from('assets/grass.png'));
		//textures.push(PIXI.Texture.from('assets/grass_side.png'));
		for(var i = 0; i < 3; i++) {
			for(var j = 0; j < 4; j++) {
						textures[i + j * 3] = PIXI.Texture.from('assets/3x3_grass-'+i+'-'+j+'.png');
			}
		}
		textures["tree"] = PIXI.Texture.from("assets/tree.png");
		for(let i in scene.textureGrid) {
			const gridRow = scene.textureGrid[i];
			for(let j in gridRow) {
				const cell = gridRow[j];
				const texture = textures[cell];
				const sprite = new PIXI.Sprite(texture);
				sprite.x = j * GRID_SIZE;
				sprite.y = i * GRID_SIZE;
				sprite.width = GRID_SIZE;
				sprite.height = GRID_SIZE;
				this.sprites.push(sprite);
				this.layer.addChild(sprite);
			}
		}
		const playerSprite = new PIXI.Sprite(textures[1]);
		playerSprite.width = GRID_SIZE * 3/4;
		playerSprite.height = GRID_SIZE * 3/4;
		playerSprite.x = -GRID_SIZE/2;
		playerSprite.y = -GRID_SIZE/2;
		this.layer.addChild(playerSprite);
		this.sprites.push(playerSprite);
		this.spriteMap["player"] = playerSprite;
		for(var obj of scene.spriteGrid) {
			const texture = textures[obj.id];
			const sprite = new PIXI.Sprite(texture);
			sprite.width = 3 * GRID_SIZE;
			sprite.height = 5 * GRID_SIZE;
			sprite.x = (obj.x + 0.5) * GRID_SIZE - sprite.width / 2;
			sprite.y = (obj.y + 1) * GRID_SIZE - sprite.height;
			this.sprites.push(sprite);
			this.layer.addChild(sprite);
		}
	}
	
	getCollisionHeight(x, y) {
		if(x < 0 || y < 0)
			return -1;
		if(y >= this.currentScene.collisionHeightmap.length)
			return -1;
		if(x >= this.currentScene.collisionHeightmap[y].length)
			return -1;
		return this.currentScene.collisionHeightmap[y][x];
	}
	
	resize(oldGridSize, newGridSize) {
		for(let sprite of this.sprites) {
			sprite.x = sprite.x / oldGridSize * newGridSize;
			sprite.y = sprite.y / oldGridSize * newGridSize;
			sprite.width = sprite.width / oldGridSize * newGridSize;
			sprite.height = sprite.height / oldGridSize * newGridSize;
		}
	}
	
	update() {
		this.layer.position.x = -(this.player.x + this.player.offsetX) * GRID_SIZE + APPLICATION_WIDTH/2 - GRID_SIZE/2;
		this.layer.position.y = -(this.player.y + this.player.offsetY) * GRID_SIZE + APPLICATION_HEIGHT/2 - GRID_SIZE/2;
	}
	
	tick() {
		this.player.tick();
		this.spriteMap["player"].x = (this.player.x + this.player.offsetX) * GRID_SIZE;
		this.spriteMap["player"].y = (this.player.y + this.player.offsetY) * GRID_SIZE;
	}

}

const pressKeyboardArr = [];
const releaseKeyboardArr = [];

function startUpdateKeyboard() {
	while(pressKeyboardArr.length > 0) {
		const key = pressKeyboardArr.pop();
		if(!keyboardMap[key])
			keyboardMap[key] = {
				press: true,
				held: false,
				released: false,
			};
		keyboardMap[key].press = true;
		keyboardMap[key].held = true;
	}
	while(releaseKeyboardArr.length > 0) {
		const key = releaseKeyboardArr.pop();
		if(!keyboardMap[key])
			keyboardMap[key] = {
				press: false,
				held: false,
				released: true,
			};
		keyboardMap[key].released = true;
		keyboardMap[key].held = false;
	}
}

function finishUpdateKeyboard() {
	for(let key in keyboardMap) {
		keyboardMap[key].press = false;
		keyboardMap[key].released = false;
	}
}

let app;

function main() {
  
  GRID_SIZE = Math.min(document.body.clientWidth / SCREEN_GRID_WIDTH, document.body.clientHeight / SCREEN_GRID_HEIGHT);
  
  APPLICATION_WIDTH = GRID_SIZE * SCREEN_GRID_WIDTH;
  APPLICATION_HEIGHT = GRID_SIZE * SCREEN_GRID_HEIGHT;
  
  
  app = new PIXI.Application({ width: APPLICATION_WIDTH, height: APPLICATION_HEIGHT });

  document.body.appendChild(app.view);
  
  sceneManager = new SceneManager();
  sceneManager.switchScene(0);
  
	app.stage.addChild(sceneManager);
	
	let currentTime = 0;
	let lastTickTime = 0;
	
	const TIME_PER_TICK = 1.0 / GAME_SPEED;
	
  app.ticker.add((delta) => {
  	startUpdateKeyboard();
  	currentTime += delta;
  	let loopAmt = 0;
  	while(currentTime >= lastTickTime + TIME_PER_TICK) {
  		sceneManager.tick();
  		lastTickTime = lastTickTime + TIME_PER_TICK;
  		loopAmt++;
  		if(loopAmt > 10)
  			break;
  	}
  	sceneManager.update();
  	finishUpdateKeyboard();
  });
	
}

window.addEventListener('load', main);

window.addEventListener('keydown', (e) => {
	pressKeyboardArr.push(e.key);
});

window.addEventListener('keyup', (e) => {
	releaseKeyboardArr.push(e.key);
});

window.addEventListener('resize', (e) => {
  let oldGridSize = GRID_SIZE;
  let newGridSize = Math.min(document.body.clientWidth / SCREEN_GRID_WIDTH, document.body.clientHeight / SCREEN_GRID_HEIGHT);
  
  APPLICATION_WIDTH = GRID_SIZE * SCREEN_GRID_WIDTH;
  APPLICATION_HEIGHT = GRID_SIZE * SCREEN_GRID_HEIGHT;

  app.renderer.resize(APPLICATION_WIDTH, APPLICATION_HEIGHT);
  sceneManager.resize(newGridSize);
  
  GRID_SIZE = newGridSize;
  
});

























