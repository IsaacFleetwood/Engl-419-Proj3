export var PIXI = window["PIXI"];

const NORTH = {
	id: 0,
	name: "back",
  direction: "North",
};
const EAST = {
	id: 1,
	name: "side-1",
  direction: "East",
};
const SOUTH = {
	id: 2,
	name: "front",
  direction: "South",
};
const WEST = {
	id: 3,
	name: "side-2",
  direction: "West",
};
const SITTING = {
	id: 4,
	name: "sit",
  direction: "NONE",
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
const SCREEN_GRID_WIDTH = 9;
const SCREEN_GRID_HEIGHT = 7;
let GRID_SIZE;

let sceneManager;

class Player {
  
  constructor() {
  	this.sprite = {};
    this.x = 0;
    this.y = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.animationFrame = 0;
    this.currentDirection = SITTING;
    this.playerSpeed = 0.5 * GAME_SPEED;
    
    this.idleTime = 0;
    
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
  	this.idleTime = 0;
  	this.currentDirection = direction;
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
  		this.animationFrame += 1;
  		const framePerAnim = this.playerSpeed / 4;
			this.sprite.texture = textures["fox-" + this.currentDirection.name + "-a" + (Math.floor(this.animationFrame / framePerAnim) % 4)];
  		return;
    }
    if(this.animationFrame != 0) {
			this.animationFrame = 0;
		}
		if(this.animationFrame == 0) {
			this.sprite.texture = textures["fox-" + this.currentDirection.name + "-a0"];
		}
		
    
    if(getKey("w").held || getKey("ArrowUp").held) {
    	this.moveDirection(NORTH);
    } else if(getKey("s").held || getKey("ArrowDown").held) {
    	this.moveDirection(SOUTH);
    } else if(getKey("a").held || getKey("ArrowLeft").held) {
    	this.moveDirection(WEST);
    } else if(getKey("d").held || getKey("ArrowRight").held) {
    	this.moveDirection(EAST);
    } else {
    	this.idleTime += 1;
    	if(this.idleTime >= GAME_SPEED * 5)
    		this.currentDirection = SITTING;
    }
  }
  
  tick() {
  	this.updateMovement();
  }
  
}

const textures = {};

let loader;
let app;
let APPLICATION_WIDTH;
let APPLICATION_HEIGHT;
let FONT_HEIGHT;
let style;

function map(val, min, max, newMin, newMax) {
	let newVal = (val - min) / (max - min) * (newMax - newMin) + newMin;
	if(newVal < newMin) return newMin;
	if(newVal > newMax) return newMax;
	return newVal;
}

class SceneManager extends PIXI.Container {

	constructor() {
  	super();
  	this.sceneNumber = -1;
	  this.scenes = [{
	  	game: {
	  		player: {
	  			enabled: false,
	  			startPoint: {x: 0, y: 0}
	  		},
				interactions: [
					{x: -1, y: -1, width: 3, height: 3, action: () => {
						this.gotoScene(1);
					}}
				],
	  	},
	  	spriteGrid: [
	  		{x:-4, y:-3, id: "title", width: 9, height: 7, static: true},
	  	],
	  }, {
	  	onLoad: () => {
	  		this.drawText("Controls:\nUse WASD or the arrow keys\nto move around.\nPress Enter while facing objects\nto interact with them and to exit dialogue.\n\nPress Enter to continue.", 7, () => {
	  			if(this.text.progress != this.text.text.length) {
	  				this.text.progress = this.text.text.length - 1;
	  			} else {
	  				this.gotoScene(2);
	  			}
	  		});
	  	},
	  	game: {
	  		player: {
	  			enabled: false,
	  			startPoint: {x: 0, y: 0}
	  		},
				interactions: [
					{x: -1, y: -1, width: 3, height: 3, action: () => {
						this.gotoScene(1);
					}}
				],
	  	},
	  	spriteGrid: [],
	  }, {
	  	onLoad: () => {
	  		this.drawText("You wake up to the sounds of crackling around you. After opening your eyes, you look around.", 2);
  		},
  		game: {
	  		player: {
	  			enabled:true, 
	  			startPoint: {x: 7, y: 6}
	  		},
				textureGrid: [[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,10,10,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,10,10,10,10,10,10,10,10,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,1,1,1,1,1,2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,10,10,10,10,10,10,10,10,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,10,10,10,10,10,10,10,10,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,10,10,10,10,10,10,10,10,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,10,10,10,10,10,10,10,10,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,9,6,7,7,8,10,11,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,1,1,1,1,2,4,4,4,4,4,4,4,4,4,4,4,4,4,10,4,4,4,4,4,4,10,10,10,10,10,10,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,9,10,11,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,6,7,7,7,7,11,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,9,10,10,10,11,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,1,1,4,4,2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,10,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,10,10,10,10,10,10,10,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,1,1,1,2,4,4,4,4,4,3,4,4,4,4,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,10,10,10,10,10,10,10,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,5,4,4,4,4,4,3,4,4,4,4,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,10,10,10,10,10,10,10,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,6,7,7,7,8,4,4,4,4,4,6,7,7,7,7,8,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,10,10,10,10,10,10,10,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,9,10,10,10,11,4,4,4,4,4,9,10,10,10,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,4,10,10,4,4,4,4,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,10,10,4,4,4,4,4,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,10,10,10,10,10,10,10,4,4,4,4,4,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,],
[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,],
],
				collisionHeightmap: [[1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
[1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
[1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
[1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,],
[1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,],
[1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,],
[1,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,],
[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,],
[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,],
[1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,],
[1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
[1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
],
				interactions: [
					{x: 16, y: 6, width: 3, height: 2, text: "A lone tree standing in the middle of nowhere. Where could it be from?", textHeight: 2},
				]
	  	},
	  	spriteGrid: (() => {
	  		var sprites = [];
	  		
	  		let grid = [[0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
[0,0,0,0,1,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
[0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,2,0,1,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,],
[0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
[0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
[0,0,1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,4,0,0,0,0,4,0,0,0,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
[0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
[0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,5,0,0,5,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,],
[0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,],
[0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
[0,0,0,0,0,1,0,0,0,1,0,0,3,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
[0,0,0,0,0,0,0,2,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,2,0,0,1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
[0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,3,0,1,0,0,0,3,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
[0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
];
				
				for(let y = 0; y < grid.length; y++) {
					for(let x = 0; x < grid[y].length; x++) {
						switch(grid[y][x]) {
							case 0:
								break;
							case 1:
								sprites.push({x: x, y: y, ids: ["tree-fire-a0", "tree-fire-a1"], framerate: (Math.random()*0.5 + 1)*24, width:3, height: 6});
								break;
							case 2:
								sprites.push({x: x, y: y, id: "tall-grass", width: 1, height: 1, below_player: true});
								break;
							case 3:
								sprites.push({x: x, y: y, ids: ["bush-fire-a0", "bush-fire-a1"], framerate: (Math.random()*0.5 + 1)*24, width: 2, height: 2});
								break;
							case 4:
								sprites.push({x: x, y: y, id: "tree", width: 3, height: 5});
								break;
							case 5:
								sprites.push({x: x, y: y, id: "bush", width: 2, height: 2});
								break;
						}
					}
				}
	  		
	  		return sprites;
	  		
	  	})(),
	  	filter: (() => {
	  		let filter = new PIXI.ColorMatrixFilter();
	  		filter.tint(0xFF7755, false);
	  		return filter;
	  	})(),
	  	interactionEvent: (x, y) => {
	  		if(this.currentScene.game.collisionHeightmap[y][x] == 0)
	  			return {valid: false};
	  		if(this.currentScene.game.textureGrid[y][x] != 4) {
  				return {valid: true, text: "The ground is too steep to climb up the edge.", textHeight: 2};
  			}
  			if(x < 30) {
  				return {valid: true, text: "The burning trees of the forest won't let you pass because of the heat.", textHeight: 2};
  			}
  			return {valid: true, text: "The forest's thick bramble makes it hard to make your way through.", textHeight: 2};
	  	},
	  	events: {},
	  	moveEvent: () => {
	  		let green = map(this.player.x, 35, 40, 0x77, 0xFF);
	  		let blue = map(this.player.x, 35, 40, 0x55, 0xFF);
	  		this.currentScene.filter.tint(0xFF0000 | (green << 8) | blue, false, false);
	  		
	  		if(this.player.x > 10 && !this.currentScene.events["fire-flee"]) {
	  			this.drawText("Terrified, you realize that your home, the forest in which you have spent your life, is burning down all around you. You begin running for your life.", 4);
	  			this.currentScene.events["fire-flee"] = true;
	  		}
	  		if(this.player.x > 25 && !this.currentScene.events["questions"]) {
	  			this.drawText("Many questions come to your mind. What could have caused this? Where did it come from and how far has it grown?", 4);
	  			this.currentScene.events["questions"] = true;
	  		}
	  		if(this.player.x > 26 && !this.currentScene.events["running"]) {
	  			this.drawText("But instead of pondering, you keep running.", 1);
	  			this.currentScene.events["running"] = true;
	  		}
	  		if(this.player.x > 40 && !this.currentScene.events["leave-behind"]) {
	  			this.drawText("As you leave behind the heat of the blaze, you feel an overwhelming sense of dread wash over you as you realize that your home, consumed by flames, will be gone.", 4);
	  			this.currentScene.events["leave-behind"] = true;
	  		}
	  		if(this.player.x > 55 && !this.currentScene.events["bushes"]) {
	  			this.drawText("Through the bushes you come across a clearing that marks the edge of the forest and the start of your search for answers and a new home.", 3);
	  			this.currentScene.events["bushes"] = true;
	  		}
	  		if(this.player.x > 72) {
	  			this.gotoScene(3);
	  		}
	  		
	  	}
	  }, {
	  	onLoad: () => {
	  		this.drawText("You made it out of the burning forest alive, but what comes next?\nThe question still lurks in the back of your mind, what happened to your home and what caused the fire to start in the first place?..\n To Be Continued..", 7, () => {
	  			if(this.text.progress != this.text.text.length) {
	  				this.text.progress = this.text.text.length - 1;
	  			} else {
	  				this.gotoScene(0);
	  			}
	  		});
	  	},
	  	game: {
	  		player: {
	  			enabled: false,
	  			startPoint: {x: 0, y: 0}
	  		},
				interactions: [
					{x: -1, y: -1, width: 3, height: 3, action: () => {
						this.gotoScene(1);
					}}
				],
	  	},
	  	spriteGrid: [],
	  },];
	  this.animations = [];
	  this.currentScene = null;
	  this.layer = new PIXI.Container();
	  this.addChild(this.layer);
	  this.transitionMask = new PIXI.Graphics();
	  this.transitionAlpha = 0;
	  this.transitionScene = 0;
	  this.addChild(this.transitionMask);
	  this.sprites = [];
	  this.spriteMap = {};
	  this.text = {
	  	enabled: false,
	  	text: "",
	  	progress: 0,
	  	enterRunnable: undefined,
	  };
	  this.currentInteraction = {};
	  this.player = new Player();
	}
	
	switchScene() {
		const scene = this.scenes[this.transitionScene];
		this.currentScene = scene;
		this.sceneNumber = this.transitionScene;
		this.layer.removeChildren();
		if(scene.filter) {
			this.layer.filters = [scene.filter];
		} else {
			this.layer.filters = [];
		}
		this.removeChildren();
		this.addChild(this.layer);
	  this.addChild(this.transitionMask);
		this.spriteMap = {};
		this.sprites = [];
	  this.text = {
	  	enabled: false,
	  	text: "",
	  	progress: 0,
	  	enterRunnable: undefined,
	  };
	  scene.events = {};
		this.player = new Player();
		this.player.x = scene.game.player.startPoint.x;
		this.player.y = scene.game.player.startPoint.y;
		for(let i in scene.game.textureGrid) {
			const gridRow = scene.game.textureGrid[i];
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
		for(var obj of scene.spriteGrid) {
			if(!obj.below_player) continue;
			const texture = textures[obj.id];
			const sprite = new PIXI.Sprite(texture);
			if(obj.width) 
				sprite.width = obj.width * GRID_SIZE;
			if(obj.height) 
				sprite.height = obj.height * GRID_SIZE;
			sprite.x = (obj.x + 0.5) * GRID_SIZE - sprite.width / 2;
			sprite.y = (obj.y + 1) * GRID_SIZE - sprite.height;
			this.sprites.push(sprite);
			this.layer.addChild(sprite);
		}
		if(scene.game.player.enabled) {
			const playerSprite = new PIXI.Sprite(textures["fox-" + this.player.currentDirection.name + "-a0"]);
			this.player.sprite = playerSprite;
			playerSprite.width = GRID_SIZE;
			playerSprite.height = GRID_SIZE;
			this.layer.addChild(playerSprite);
			this.sprites.push(playerSprite);
			this.spriteMap["player"] = playerSprite;
		}
		for(var obj of scene.spriteGrid) {
			if(obj.below_player) continue;
			if(obj.ids) {
				obj.id = obj.ids[0];
			}
			const texture = textures[obj.id];
			const sprite = new PIXI.Sprite(texture);
			if(obj.width) 
				sprite.width = obj.width * GRID_SIZE;
			else 
				sprite.width = 3 * GRID_SIZE;
			if(obj.height) 
				sprite.height = obj.height * GRID_SIZE;
			else 
				sprite.height = 5 * GRID_SIZE;
			if(obj.static) {
				sprite.x = (obj.x) * GRID_SIZE;
				sprite.y = (obj.y) * GRID_SIZE;
			} else {
				sprite.x = (obj.x + 0.5) * GRID_SIZE - sprite.width / 2;
				sprite.y = (obj.y + 1) * GRID_SIZE - sprite.height;
			}
			this.sprites.push(sprite);
			this.layer.addChild(sprite);
			
			if(obj.ids) {
				this.animations.push({sprite: sprite, ids: obj.ids, frame: 0, timer: obj.frameRate, framerate: obj.framerate});
			}
		}
		if(scene.onLoad)
			scene.onLoad();
	}
	
	gotoScene(sceneNumber) {
		this.transitionAlpha = 0;
		this.transitionScene = sceneNumber;
	}
	
	drawText(text, textHeight, enterRunnable) {
			var textSprite = new PIXI.Text("", style);
			this.spriteMap["text"] = textSprite;
			
			textSprite.x = GRID_SIZE/2;
			textSprite.y = GRID_SIZE/2;
			
			let background = new PIXI.Graphics();
			this.spriteMap["text-background"] = background;
			background.alpha = 0.5;
			background.beginFill(0x333344);
			background.drawRect(GRID_SIZE / 4, GRID_SIZE/4, APPLICATION_WIDTH - GRID_SIZE / 2, FONT_HEIGHT * textHeight + GRID_SIZE / 2);
			
			this.addChild(this.spriteMap["text-background"]);
			this.addChild(this.spriteMap["text"]);
			
			this.text = {
				enabled: true,
				text: text,
				progress: 0,
				enterRunnable: enterRunnable,
				sprite: text,
				spriteBackground: background,
			};
			
	}
	
	getCollisionHeight(x, y) {
		if(x < 0 || y < 0)
			return -1;
		if(y >= this.currentScene.game.collisionHeightmap.length)
			return -1;
		if(x >= this.currentScene.game.collisionHeightmap[y].length)
			return -1;
		return this.currentScene.game.collisionHeightmap[y][x];
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
		this.transitionMask.clear();
		this.transitionMask.beginFill(0x000000, this.transitionAlpha);
		this.transitionMask.drawRect(0, 0, APPLICATION_WIDTH, APPLICATION_HEIGHT);
	}
	
	tick() {

		if(this.transitionScene != this.sceneNumber) {
			if(this.transitionAlpha < 1) {
				this.transitionAlpha += 0.05;
			} else {
				this.switchScene();
			}
			return;
		}
		if(this.transitionAlpha > 0) {
			this.transitionAlpha -= 0.05;
		}
	
		for(let animation of this.animations) {
			if(animation.timer > 0) {
				animation.timer -= 1;
				continue;
			}
			animation.timer = animation.framerate;
			animation.frame = (animation.frame + 1) % animation.ids.length;
			animation.sprite.texture = textures[animation.ids[animation.frame]];
		}
	
		if(this.text.enabled) {
				if(this.text.progress < this.text.text.length) {
					this.text.progress += 0.5;
					/*
					let graphics = this.spriteMap["mask"];//this.spriteMap["text"].mask;
					graphics.beginFill(0xffffff);
					for(let i = 0; i < this.textProgress; i++) {
						let width = 0;
						if(this.textProgress >= i + 1)
							width = GRID_SIZE * (SCREEN_GRID_WIDTH - 1);
						else
							width = GRID_SIZE * (SCREEN_GRID_WIDTH - 1) * (this.textProgress % 1);
						graphics.drawRect(GRID_SIZE/2, GRID_SIZE / 2 + i * FONT_HEIGHT, width, FONT_HEIGHT);
					}
					*/
					this.removeChild(this.spriteMap["text"]);
					var text = new PIXI.Text(this.text.text.substring(0,Math.floor(this.text.progress)), style);
					text.x = GRID_SIZE/2;
					text.y = GRID_SIZE/2;

					this.spriteMap["text"] = text;					
					this.addChild(text);
				}
		}	
		if(getKey("Enter").press) {
			if(this.text.enabled) {
				if(this.text.enterRunnable) {
					this.text.enterRunnable();
				} else {
					this.text.enabled = false;
					this.removeChild(this.spriteMap["text"]);
					this.removeChild(this.spriteMap["text-background"]);
					this.spriteMap["text"] = undefined;
					this.spriteMap["text-background"] = undefined;
				}
			} else {
				let dX = 0;
				let dY = 0;
				if(this.player.currentDirection == EAST) { dX = 1; dY = 0;} 
				else if(this.player.currentDirection == NORTH) { dX = 0; dY = -1; }
				else if(this.player.currentDirection == SOUTH) { dX = 0; dY = 1; }
				else if(this.player.currentDirection == WEST) { dX = -1; dY = 0; }
				
				const x = this.player.x + dX;
				const y = this.player.y + dY;
				let finished = false;
				for(let interaction of this.currentScene.game.interactions) {
					if(!(x >= interaction.x && x < interaction.x + interaction.width))
						continue;
					if(!(y >= interaction.y && y < interaction.y + interaction.height))
						continue;
					if(interaction.action) {
						interaction.action();
						continue;
					}
					
					this.drawText(interaction.text, interaction.textHeight);
					finished = true;
					
					/*
					
					var text = new PIXI.Text(interaction.text, style);
					
					text.x = GRID_SIZE/2;
					text.y = GRID_SIZE/2;
					this.spriteMap["mask"] = new PIXI.Graphics();
					this.spriteMap["text-background"] = new PIXI.Graphics();
					this.spriteMap["text-background"].alpha = 0.5;
					this.spriteMap["text-background"].beginFill(0x333344);
					this.spriteMap["text-background"].drawRect(GRID_SIZE / 4, GRID_SIZE/4, APPLICATION_WIDTH - GRID_SIZE / 2, FONT_HEIGHT * interaction.textHeight + GRID_SIZE / 2);
					text.mask = this.spriteMap["mask"];
					//this.addChild(this.spriteMap["mask"]);
					this.textProgress = 0;
					this.currentInteraction = interaction;
					this.spriteMap["text"] = text;
					this.textLife = 0;
					
					this.addChild(this.spriteMap["text-background"]);
					this.addChild(this.spriteMap["text"]);
					*/
				}
				if(!finished && this.currentScene.interactionEvent) {
					let res = this.currentScene.interactionEvent(x, y);
					if(res.valid) {
						this.drawText(res.text, res.textHeight);
					}
				}
			}
		}
		//this.spriteMap["player"].texture = textures["fox-" + this.player.currentDirection.name + "-a0"];
		if(this.currentScene.game.player.enabled) {
			if(!this.spriteMap["text"]) {
				this.player.tick();
			}
			if(this.currentScene.moveEvent) {
				this.currentScene.moveEvent();
			}
			this.spriteMap["player"].x = (this.player.x + this.player.offsetX) * GRID_SIZE;
			this.spriteMap["player"].y = (this.player.y + this.player.offsetY) * GRID_SIZE;
		}
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

function main() {
  
  GRID_SIZE = Math.min(document.body.clientWidth / SCREEN_GRID_WIDTH, document.body.clientHeight / SCREEN_GRID_HEIGHT);
  FONT_HEIGHT = GRID_SIZE * 0.3
  
  APPLICATION_WIDTH = GRID_SIZE * SCREEN_GRID_WIDTH;
  APPLICATION_HEIGHT = GRID_SIZE * SCREEN_GRID_HEIGHT;
  
  style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: FONT_HEIGHT,
    fontStyle: 'normal',
    fontWeight: 'bold',
    fill: '#ffffff',
    stroke: '#000000',
    strokeThickness: 0,
    dropShadow: false,
    wordWrap: true,
    wordWrapWidth: GRID_SIZE * (SCREEN_GRID_WIDTH - 1),
    lineJoin: 'round',
	});

  
  app = new PIXI.Application({ width: APPLICATION_WIDTH, height: APPLICATION_HEIGHT });

  document.body.appendChild(app.view);
  
  sceneManager = new SceneManager();
  sceneManager.gotoScene(0);
  
	app.stage.addChild(sceneManager);
	
	// DEBUG
	//var text = new PIXI.Text("(Press Enter on the tree on your right for interaction example)", style);
	
	//text.x = GRID_SIZE / 2;
	//text.y = APPLICATION_HEIGHT - FONT_HEIGHT * 2;
	//app.stage.addChild(text);


	let currentTime = 0;
	let lastTickTime = 0;
	
	const TIME_PER_TICK = 1.0 / GAME_SPEED;
	
  app.ticker.add((delta) => {
  	startUpdateKeyboard();
  	currentTime += delta / 60.0;
  	let loopAmt = 0;
  	while(currentTime >= lastTickTime + TIME_PER_TICK) {
  		sceneManager.tick();
  		lastTickTime = lastTickTime + TIME_PER_TICK;
  		loopAmt++;
  		if(loopAmt > 10) {
  			break;
			}
  	}
  	sceneManager.update();
  	finishUpdateKeyboard();
  });
	
}

var promiseList = [];

function loadResource(key, url) {
	promiseList.push(
		PIXI.Assets.load(url).then((result) => {
			textures[key] = result;
		})
	);
}

async function start() {
	for(var i = 0; i < 3; i++) {
		for(var j = 0; j < 4; j++) {
					loadResource(i + j * 3, 'assets/grass/image'+(i+1)+'x'+(j+1)+'.png');
		}
	}
	loadResource("tree", "assets/tree.png");
	loadResource("tree-fire-a0", "assets/tree_fire.png");
	loadResource("tree-fire-a1", "assets/tree_fire_a1.png");
	loadResource("bush", "assets/bush.png");
	loadResource("bush-fire-a0", "assets/bush-fire-a0.png");
	loadResource("bush-fire-a1", "assets/bush-fire-a1.png");
	loadResource("tall-grass", "assets/tall_grass.png");
	
	loadResource("fox-back-a0", "assets/fox-back-a0.png");
	loadResource("fox-side-1-a0", "assets/fox-side-a0.png");
	loadResource("fox-side-2-a0", "assets/fox-side-2-a0.png");
	loadResource("fox-front-a0", "assets/fox-front-a0.png");

	loadResource("fox-back-a1", "assets/fox-back-a1.png");
	loadResource("fox-side-1-a1", "assets/fox-side-a1.png");
	loadResource("fox-side-2-a1", "assets/fox-side-2-a1.png");
	loadResource("fox-front-a1", "assets/fox-front-a1.png");

	loadResource("fox-back-a2", "assets/fox-back-a2.png");
	loadResource("fox-side-1-a2", "assets/fox-side-a2.png");
	loadResource("fox-side-2-a2", "assets/fox-side-2-a2.png");
	loadResource("fox-front-a2", "assets/fox-front-a2.png");

	loadResource("fox-back-a3", "assets/fox-back-a3.png");
	loadResource("fox-side-1-a3", "assets/fox-side-a3.png");
	loadResource("fox-side-2-a3", "assets/fox-side-2-a3.png");
	loadResource("fox-front-a3", "assets/fox-front-a3.png");
	
	loadResource("fox-sit-a0", "assets/fox-sit.png");
	
	loadResource("title", "assets/title.png");
  await Promise.all(promiseList);
	main();
}

window.addEventListener('load', start);

window.addEventListener('keydown', (e) => {
	pressKeyboardArr.push(e.key);
});

window.addEventListener('keyup', (e) => {
	releaseKeyboardArr.push(e.key);
});

/*
window.addEventListener('resize', (e) => {
  let oldGridSize = GRID_SIZE;
  let newGridSize = Math.min(document.body.clientWidth / SCREEN_GRID_WIDTH, document.body.clientHeight / SCREEN_GRID_HEIGHT);
  
  APPLICATION_WIDTH = GRID_SIZE * SCREEN_GRID_WIDTH;
  APPLICATION_HEIGHT = GRID_SIZE * SCREEN_GRID_HEIGHT;

  app.renderer.resize(APPLICATION_WIDTH, APPLICATION_HEIGHT);
  sceneManager.resize(newGridSize);
  
  GRID_SIZE = newGridSize;
  
});
*/


