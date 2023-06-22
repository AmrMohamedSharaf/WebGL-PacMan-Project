import * as utils from './util.js';

// Our Game Structure 
export const tilesEnum = {
	visitd: 0,
	not_visited: 1,
	wall: 2,
}

export const gameObjectTypes = {
	points: 0,
	ghosts_1: 1, // use the first AI algorithm
	ghosts_2:2 , // uses the second AI algorithm 
	player:3
}


const movmentDirections = {
	up : 1,
	down : -1 ,
	left : -2 ,
	right : 2, 
	stop : 0
}

export class Tile { 
	constructor(type, renderBufferData ){ 
		this.type = type ;
		this.renderBufferData = renderBufferData;
	}

	getType(){ 
		return this.type; 
	}
	getRenderBufferData(){ 
		return this.renderBufferData;
	}
	setType(type){
		this.type = type;
	}
}

export class GameActor{
	constructor(type ,tileX, tileY , renderBufferData){
		this.movmentdirection = 0;
		this.type = type
		this.tileX = tileX; 
		this.tileY = tileY; 
		this.renderBufferData = renderBufferData; 
	}

	getXCords(){
		return this.tileX;
	}


	getYCords(){
		return this.tileY;
	}

	getMovmentDirec(){
		return this.movmentdirection;
	}


	getRenderBufferData(){
		return utils.getNormllizedCoords(this.renderBufferData , canvas.width , canvas.height);
	}
}

// Desc : takes an array of points data buffer and walls data buffer and a 2d array for the map
export class Level {
	constructor(map , width , highet , wallsDataBuffer ){
		this.map = map; 
		this.width = width; 
		this.highet = highet
		this.wallsDataBuffer = wallsDataBuffer;
		this.gamePointsList = []
		this.updateLevelPoints();
		
	}

	updateLevelPoints(){
		this.gamePointsList = []
		this.map.forEach((row, y) => {
			row.forEach((tile, x) => {
			  if (tile.type === tilesEnum.not_visited) {
				const newPoint = new GameActor( gameObjectTypes.points , x, y , tile.getRenderBufferData());
				this.gamePointsList.push(newPoint);
			  }
			});
		  });
	}

	getGamePoints(){
		return this.gamePointsList;
	}

	getNumOfpoints(){
		return this.numOfPoints;
	}
}


export class GameManager{ 
	constructor(level , timer , maxScore , numOfPoints, player){
		this.level = level; 
		this.timer = timer 
		this.score = 0;
		this.player = player;
		this.ghosts = []; 
		this.numOfPonts = numOfPoints;
	}

	addGhost(newGhost){	this.ghosts.push(newGhost);}
	getGhosts(){return this.ghosts}
	getPlayer(){return this.player}

	getGameData(){ // Debugging 
		console.log(this.score);
		//console.log(this.level.getGamePoints());
	}

	updateGameStatus(){
		if(this.level.map[this.player.getXCords()][this.player.getYCords()].getType() === tilesEnum.not_visited){
			this.level.map[this.player.getXCords()][this.player.getYCords()].setType(tilesEnum.visitd) ;
			this.score+=100;
			this.numOfPonts--;
		}

		this.level.updateLevelPoints();
	}
		// console.log(this.level.map[this.player.getXCords()][this.player.getYCords()]); // Debugging line
	movePlayer(){
			if(this.getPlayer().getMovmentDirec() === movmentDirections.up){
		MoveUp(this.player, this.level.map);
	}
	else if(this.getPlayer().getMovmentDirec() === movmentDirections.down){
		MoveDown(this.player, this.level.map);
	}

	else if (this.getPlayer().getMovmentDirec() === movmentDirections.left){
		MoveLeft(this.player, this.level.map);}

		else if (this.getPlayer().getMovmentDirec() === movmentDirections.right){
			MoveRight(this.player, this.level.map);}


			this.getPlayer().movmentdirection = movmentDirections.stop;
		}

	
}




// Controllers 

export function MoveUp(GameActor , map){
	if  (GameActor.tileY >=9 || map[GameActor.tileX][GameActor.tileY + 1].getType() === tilesEnum.wall  )  {  // To Do change that to the levels cords by passign the level
		console.log("wall");
	}

	else  {
		GameActor.tileY++; 
		console.log("Moving Up")
		return;
	}

	
	}

	export function MoveDown(GameActor , map){
		if  (GameActor.tileY <=0 || map[GameActor.tileX][GameActor.tileY - 1].getType() === tilesEnum.wall)  { 
			console.log("wall");
		}
	
		else  {
			GameActor.tileY--; 
			console.log("Moving Down")
			return;
		}
		}

	export	function MoveRight(GameActor , map){
			if  (GameActor.tileX >=8 || map[GameActor.tileX+1][GameActor.tileY].getType() === tilesEnum.wall)  { 
				console.log("wall");
			}
		
			else  {
				GameActor.tileX++; 
				console.log("Moving Right")
				return;
			}
			}
			

			export function MoveLeft(GameActor , map){
				if  ( GameActor.tileX <=0 ||map[GameActor.tileX-1][GameActor.tileY].getType() === tilesEnum.wall)  { 
					console.log("wall");
				}
			
				else  {
					GameActor.tileX--; 
					console.log("Moving Left")
					return;
				}
				}
	



// ********************************



export function EventListners(gameManager){ 
	document.addEventListener("keydown", (event) => {
		if(gameManager.getPlayer().movmentdirection === movmentDirections.stop){
		if (event.key === "w" || event.key === "W") {
			gameManager.getPlayer().movmentdirection = movmentDirections.up;

		 
		}
		else if (event.key === "s" || event.key === "S"){
			//MoveDown(gameManager.player, gameManager.level.map);
			gameManager.getPlayer().movmentdirection = movmentDirections.down;
		}

		else if (event.key === "d" || event.key === "D"){
			//MoveRight(gameManager.player, gameManager.level.map);
			gameManager.getPlayer().movmentdirection = movmentDirections.right;

		}

		else if (event.key === "a" || event.key === "A"){
			//MoveLeft(gameManager.player, gameManager.level.map);
			gameManager.getPlayer().movmentdirection = movmentDirections.left;

		}
		}	
	  });
}










