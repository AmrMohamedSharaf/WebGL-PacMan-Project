// Our Game Structure 
const tilesEnum = {
	visitd: 0,
	not_visited: 1,
	wall: 2,
}

const gameObjectTypes = {
	points: 0,
	ghosts_1: 1, // use the first AI algorithm
	ghosts_2:2 , // uses the second AI algorithm 
	player:3
}


const movmentDirections = {
	up : 1,
	down : -1 ,
	left : -2 ,
	right : 2 
}

class Tile { 
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

class GameActor{
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
		return this.renderBufferData;
	}
}

// Desc : takes an array of points data buffer and walls data buffer and a 2d array for the map
class Level {
	constructor(map ,  wallsDataBuffer){
		this.map = map; 
		this.wallsDataBuffer = wallsDataBuffer;
		this.gamePointsList = []
	}

	updateLevelPoints(){
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
}


class GameManager{ 
	constructor(level , timer , player){
		this.level = level; 
		this.timer = timer 
		this.score = 0;
		this.player = player;
		this.ghosts = []; 
	}

	addGhost(newGhost){	this.ghosts.push(newGhost);}
	getGhosts(){return this.ghosts}
	getPlayer(){return this.player}

	getGameData(){ // Debugging 
		console.log(this.score);
		console.log(this.level.getGamePoints());
	}
}



function createNewGame(){
	const map = [
		[new Tile(tilesEnum.not_visited, [100, 100]), new Tile(tilesEnum.not_visited, [100, 300]), new Tile(tilesEnum.wall, [100, 500])],
		[new Tile(tilesEnum.not_visited, [300, 100]), new Tile(tilesEnum.not_visited, [300, 300]), new Tile(tilesEnum.not_visited, [300, 500])],
		[new Tile(tilesEnum.not_visited, [500, 100]), new Tile(tilesEnum.not_visited, [500, 300]), new Tile(tilesEnum.not_visited, [500, 500])]
	  ];

	 demoLevel = new Level(map, null);
	 demoLevel.updateLevelPoints();

	 pacManTrig = new GameActor(gameObjectTypes.palayer,0,0 ,[300, 100])

	 currentGameManager = new GameManager(demoLevel , 60 , pacManTrig);
	 return currentGameManager

}


// Controllers 

function MoveUp(GameActor , map){
	if (map[GameActor.tileX][GameActor.tileY + 1].getType() === tilesEnum.not_visited){
		GameActor.tileY++; 
		map[GameActor.tileX][GameActor.tileY].setType(tilesEnum.visitd);
		console.log("Moving Up") // debugging 
		return;
	}

	else if (map[GameActor.tileX][GameActor.tileY + 1].getType() === tilesEnum.visitd){
		GameActor.tileY++; 
		console.log("Moving Up")
		return;
	}

	else if  (map[GameActor.tileX][GameActor.tileY + 1].getType() === tilesEnum.wall)  { 
		console.log("wall");
	}
	}

	function MoveDown(GameActor , map){
		if (map[GameActor.tileX][GameActor.tileY -1].getType() === tilesEnum.not_visited){
			GameActor.tileY--; 
			map[GameActor.tileX][GameActor.tileY].setType(tilesEnum.visitd);
			console.log("Moving Down")
			return true;
		}
	
		else if (map[GameActor.tileX][GameActor.tileY -1].getType() === tilesEnum.visitd){
			console.log("Moving Down")
			GameActor.tileY--; 
			return false ;
		}
	
		else if  (map[GameActor.tileX][GameActor.tileY -1].getType() === tilesEnum.wall)  { 
			console.log("wall");
			return false;
		}
		}

		function MoveRight(GameActor , map){
			if (map[GameActor.tileX+1][GameActor.tileY].getType() === tilesEnum.not_visited){
				GameActor.tileX++; 
				map[GameActor.tileX][GameActor.tileY].setType(tilesEnum.visitd);
				console.log("Moving Right")
				return true ; 
			}
		
			else if (map[GameActor.tileX+1][GameActor.tileY].getType() === tilesEnum.visitd){
				console.log("Moving Right")
				GameActor.tileX++; 
				return false;
			}
		
			else if  (map[GameActor.tileX+1][GameActor.tileY].getType() === tilesEnum.wall)  { 
				console.log("wall");
				return false;
			}
			}

			function MoveLeft(GameActor , map){
				if (map[GameActor.tileX-1][GameActor.tileY].getType() === tilesEnum.not_visited){
					GameActor.tileX--; 
					map[GameActor.tileX][GameActor.tileY].setType(tilesEnum.visitd);
					console.log("Moving Left")
					return true;
				}
			
				else if (map[GameActor.tileX-1][GameActor.tileY].getType() === tilesEnum.visitd){
					console.log("Moving Left")

					GameActor.tileX--; 
					return false;
				}
			
				else if  (map[GameActor.tileX-1][GameActor.tileY].getType() === tilesEnum.wall)  { 
					console.log("wall");
					return false;
				}
				}
	



// ********************************





function InitDemo  () {
	
	const pacManGameMode = createNewGame();
	const  canvas = document.getElementById('game-surface');
	document.addEventListener("keydown", (event) => {
		if (event.key === "w" || event.key === "W") {
		 // MoveUp(pacManGameMode.player, pacManGameMode.level.map);
		 pacManGameMode.getPlayer().movmentdirection = movmentDirections.up;
		}
		else if (event.key === "s" || event.key === "S"){
			//MoveDown(pacManGameMode.player, pacManGameMode.level.map);
			pacManGameMode.getPlayer().movmentdirection = movmentDirections.down;
		}

		else if (event.key === "d" || event.key === "D"){
			//MoveRight(pacManGameMode.player, pacManGameMode.level.map);
			pacManGameMode.getPlayer().movmentdirection = movmentDirections.right;

		}

		else if (event.key === "a" || event.key === "A"){
			//MoveLeft(pacManGameMode.player, pacManGameMode.level.map);
			pacManGameMode.getPlayer().movmentdirection = movmentDirections.left;

		}
	  });

  function update(){
	if(pacManGameMode.getPlayer().getMovmentDirec() === movmentDirections.up){
		MoveUp(pacManGameMode.player, pacManGameMode.level.map);
	}
	else if(pacManGameMode.getPlayer().getMovmentDirec() === movmentDirections.down){
		MoveDown(pacManGameMode.player, pacManGameMode.level.map);
	}
	setTimeout(()=>{requestAnimationFrame(update);},1000)
	}
	update();
};



