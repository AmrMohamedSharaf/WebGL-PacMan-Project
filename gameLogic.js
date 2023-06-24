import * as utils from './util.js';
var  canvas = document.getElementById('glcanvas');


//AI Logic : 


// there are two ghosts , BFS which will chase the player  
// Greedy which will go for the seond best move , that 's because I want to balance the game by having one ghost covering the parts where the player is not moving 
// while the other ghost (BFS ) is chasing the player 





// Desc : Helpoer fucntion to check if the search state is equal the player positon // Helper for BFS

function checkNode(node1 , gameActor){
	if (node1.X === gameActor.tileX && node1.Y === gameActor.tileY){
		return true;
	} 
	return false ;
}

// Desc : Helper for Greedy Algo 
function manhattanDistance(x , y , player) {
	let distanceX = Math.abs(x - player.tileX);
	let distanceY = Math.abs(y - player.tileY);
	let manhattanDistance = distanceX + distanceY;
	return manhattanDistance;
  }


// Enum that holds differnt type of tiles which can have a point , a spec item or a wall 
// Our Game Structure 
export const tilesEnum = {
	visitd: 0,
	not_visited: 1,
	wall: 2,
	speialItem : 3
}

// types of game actors  

export const gameObjectTypes = {
	points: 0,
	ghosts_1: 1, // use the first AI algorithm
	ghosts_2:2 , // uses the second AI algorithm 
	player:3
}

// movment directions 
export const movmentDirections = {
	up : 1,
	down : -1 ,
	left : -2 ,
	right : 2, 
	stop : 0
}


// Desc : tile objects are the blocks the generate the map 
export class Tile { 
	// Constructor 
	constructor(type, renderBufferData ){ 
		this.type = type ;
		this.renderBufferData = renderBufferData;
	}
	// Getters 
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


// Helper function that reuturns a list of valid moves for a curret search state // used to implement BFS 
function getValidMoves(map , node){
	let validMoves = [] ;
	


	 // checks the tile for every possilbe next move and if it's a valid move , not a wall then adds it to the list
	if(node.X < 8  && map[node.X+1][node.Y].type != tilesEnum.wall){
		validMoves.push({X:node.X+1 , Y:node.Y , action:movmentDirections.right , parent : node})
	}
	

	
	if(node.X >0 && map[node.X-1][node.Y].type != tilesEnum.wall){
		//console.log(node.X , node.Y);
		validMoves.push({X:node.X-1 , Y:node.Y, action:movmentDirections.left , parent : node})
	}
	

	
	if(node.Y <9 && map[node.X][node.Y + 1].type != tilesEnum.wall  ){
		validMoves.push({X:node.X , Y:node.Y+1, action:movmentDirections.up , parent : node})
	}


	
	if(node.Y >0 && map[node.X][node.Y - 1].type != tilesEnum.wall){
		validMoves.push({X:node.X , Y:node.Y-1, action:movmentDirections.down , parent : node})
	}

	//console.log(validMoves)
	return validMoves;

}

// class the has the building block for all the objects of the game , player , ghosts and points 
export class GameActor{
	constructor(type ,tileX, tileY , renderBufferData){
		this.movmentdirection = 0; // current direction
		this.type = type // type 
		this.tileX = tileX;  // initial location on the board 
		this.tileY = tileY; 
		this.renderBufferData = renderBufferData;  // rendering coords 
		this.canMove = true; // bool value that's use to implment the control system 
		this.translationX = 450.0;  // hardcoded value for the current translatoin // ToDO Change it to a paased argument 
		this.translationY = 500.0;
	}

		// Getters 
	getXCords(){
		return this.tileX;
	}


	getYCords(){
		return this.tileY;
	}


	getXtranslation(){
		return this.translationX;
	}


	getYtranslation(){
		return this.translationY;
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

// The master class of the game which has all information on the current game session and also listens to the players controls 
export class GameManager{ 
	constructor(level , timer , maxScore , numOfPoints, player , bFSGhost , greadyGhost , specTileX , specTileY){
		this.level = level;  
		this.timer = timer 
		this.score = 0;
		this.player = player;
		this.bFSGhost = bFSGhost; 
		this.greadyGhost = greadyGhost
		this.numOfPonts = numOfPoints;
		this.bfsGhostmoves = new Array();
		this.stoped = false;
		this.started = false;
		this.numOfSpeicalItems  = 1;
		this.safeMode = false; // if the player consuems the spec item then the player cannot lose points if catched
		this.specTileX = specTileX // for simplicity  I just hard coded this value how ever it should be derived from the map informaiton 
		this.specTileY = specTileY
	}



	// getters 
	getBFSGhost(){return this.bFSGhost}
	getGreedyGhost(){return this.greadyGhost}
	getPlayer(){return this.player}

	getGameData(){ // Debugging 
		console.log(this.score);
		console.log(this.timer);
		//console.log(this.level.getGamePoints());
	}
	// functions that checks for new visited nodes , as well as the end game states 
	updateGameStatus(){

		if(this.player.tileX === this.bFSGhost.tileX && this.player.tileY === this.bFSGhost.tileY){
			if(this.score > 0){
				this.resetMapBFS(); // if caught by a bfs ghost 
			}
			else{
				this.endGame();

			}
		}
		else if(this.player.tileX === this.greadyGhost.tileX && this.player.tileY === this.greadyGhost.tileY){
			if(this.score > 0){
				this.resetMapGreedy(); // if caught by the greedy ghost 
			}
			else {
				this.endGame();
			}
		}
		// end game condtions 
		if(this.timer === 0 || this.numOfPonts === 0){this.endGame();}
		// if we visti an unvisited tile it means that we have consuemd a new point so score +=100
		if(this.level.map[this.player.getXCords()][this.player.getYCords()].getType() === tilesEnum.not_visited){
			this.level.map[this.player.getXCords()][this.player.getYCords()].setType(tilesEnum.visitd) ;
			this.score+=100;
			this.numOfPonts--;
		}
		// if the tile had the spec item then switch the player to the safe mode
		else if(this.level.map[this.player.getXCords()][this.player.getYCords()].getType() === tilesEnum.speialItem){
			this.level.map[this.player.getXCords()][this.player.getYCords()].setType(tilesEnum.visitd) ;
			this.numOfSpeicalItems--;
			this.safeMode = true;
		}
		this.timer --;


		this.level.updateLevelPoints();
	}

	endGame(){
		// end the game and update the score 
		this.score = this.score + this.score*this.timer;
		this.stoped = true;
	}

	
	// Desc : resets the BFS Ghost to the center of the map
	resetMapBFS(){
	
		this.bFSGhost.tileX =4 ; this.bFSGhost.tileY = 4; this.bFSGhost.translationX = 450; this.bFSGhost.translationY = 500;
		if(this.safeMode != true){this.score -= 500;}
		else {this.safeMode = false}
		
		this.bfsGhostmoves = [];

	}

	//Desc : resets the Greedy Ghost to the center of the map

	resetMapGreedy(){
		this.greadyGhost.tileX =4 ; this.greadyGhost.tileY = 5; this.greadyGhost.translationX = 450; this.greadyGhost.translationY = 500;
		this.score -= 500;
	}
	
	// resetGame(map){
	// 	this.level.map = map 
	// 	this.score = 0
	// 	this.timer = 60; 
	// 	this.player.tileX = 4; 
	// 	this.player.tileY = 0 ; 
	// 	this.numOfPonts = 58;
	// 	this.numOfSpeicalItems = 1;
	// 	this.player.translationX = 450; 
	// 	this.player.translationY = 500;
	// 	this.resetMapGreedy();
	// 	this.resetMapBFS();

	// }
		// console.log(this.level.map[this.player.getXCords()][this.player.getYCords()]); // Debugging line

		// Desc : Based on the movment direction the game manager moves the player and updates the translation value 
	movePlayer(){
			if(this.getPlayer().getMovmentDirec() === movmentDirections.up){
		MoveUp(this.player, this.level.map);
	}
	else if(this.getPlayer().getMovmentDirec() === movmentDirections.down){
		MoveDown(this.player, this.level.map);
	}

	else if (this.getPlayer().getMovmentDirec() === movmentDirections.left){
		MoveLeft(this.player, this.level.map);
	}

		else if (this.getPlayer().getMovmentDirec() === movmentDirections.right){
			MoveRight(this.player, this.level.map);
		}

			this.getPlayer().movmentdirection = movmentDirections.stop;
		}

		// Desc :  Generates the BFS path based on the positon of the BFS Ghost

	bfsMoves(){
		let startNode = {X:this.bFSGhost.tileX , Y: this.bFSGhost.tileY , action: 0 , parent : null};
		if (checkNode(startNode , this.player)){return;}

		let queue = new utils.Queue();
		let isVisited = new Array() ; 
		queue.enqueue(startNode);

		while(!queue.isEmpty()){

			let node = queue.dequeue();
		//	console.log(queue);
			isVisited.push(node);
			let validMoves = getValidMoves(this.level.map , node);
			for( let child of validMoves){
				if (!isVisited.includes(child)){
					//console.log(child.X , child.Y);
					if (checkNode(child , this.player) === true){
						let actions = []
						node = child;
						while(node.parent != null){
							actions.push(node.action);
							node = node.parent;
						}
						this.bfsGhostmoves = actions;
					//console.log(this.bfsGhostmoves);
					return;
					}
					queue.enqueue(child)
				}
				
				
			};

		//}
	}
}
	// Sorts the next Valid moves based on the manhatten distance 
	greadyMoves(){

		let validMoves = new Array() ;
		if(this.greadyGhost.tileX < 8  && this.level.map[this.greadyGhost.tileX+1][this.greadyGhost.tileY].type != tilesEnum.wall){
			validMoves.push({dis :manhattanDistance(this.greadyGhost.tileX+1 , this.greadyGhost.tileY , this.player) , dic :2});
			
		}
		
	
		
		if(this.greadyGhost.tileX > 0 && this.level.map[this.greadyGhost.tileX-1][this.greadyGhost.tileY].type != tilesEnum.wall){
			validMoves.push({dis :manhattanDistance(this.greadyGhost.tileX-1 , this.greadyGhost.tileY , this.player) , dic : -2});
		}

		if(this.greadyGhost.tileY < 9  &&this.level.map[this.greadyGhost.tileX][this.greadyGhost.tileY+1].type != tilesEnum.wall){
			validMoves.push({dis :manhattanDistance(this.greadyGhost.tileX , this.greadyGhost.tileY+1 , this.player) , dic : 1});
		}

		if(this.greadyGhost.tileY > 0 &&this.level.map[this.greadyGhost.tileX][this.greadyGhost.tileY-1].type != tilesEnum.wall){
			validMoves.push({dis :manhattanDistance(this.greadyGhost.tileX , this.greadyGhost.tileY-1 , this.player) , dic : -1});
		}

		return validMoves.sort((a, b) => b.dis - a.dis);
	}

	// Takes the move based on the shortes distance 

	moveGreedyGhost(){
		let validmoves = this.greadyMoves();
		let best_move = validmoves[1].dic;
		if(best_move === movmentDirections.up){
				
			if(this.greadyGhost.tileY <9){	this.greadyGhost.tileY+=1
				this.greadyGhost.translationY += 100;
			}
		}
		else if(best_move === movmentDirections.down){
			
			if(this.greadyGhost.tileY >=0){	this.greadyGhost.tileY-=1
				this.greadyGhost.translationY -= 100;
			}
		}

		else if(best_move === movmentDirections.right){
			if(this.greadyGhost.tileX < 8){	this.greadyGhost.tileX+=1
				this.greadyGhost.translationX += 100;
			}
		}

		else if(best_move === movmentDirections.left){
			if(this.greadyGhost.tileX > 0){	this.greadyGhost.tileX-=1
				this.greadyGhost.translationX -= 100;}
		}

		
	}

	//takes the moves based on the path generated by the BFS algorithm
	moveBFSGhost(){
		
			
		// if we no longer have moves in the path genereted then we need a new path 
		if(this.bfsGhostmoves.length === 0){
			this.bfsMoves();
		}

		
			
			 let next_move = this.bfsGhostmoves.pop();
			//console.log(next_move);

			if(next_move === movmentDirections.up){
				
				if(this.bFSGhost.tileY <9){	this.bFSGhost.tileY+=1
					this.bFSGhost.translationY += 100;
				}
			}
			else if(next_move === movmentDirections.down){
				
				if(this.bFSGhost.tileY >=0){	this.bFSGhost.tileY-=1
					this.bFSGhost.translationY -= 100;
				}
			}

			else if(next_move === movmentDirections.right){
				if(this.bFSGhost.tileX < 8){	this.bFSGhost.tileX+=1
					this.bFSGhost.translationX += 100;
				}
			}

			else if(next_move === movmentDirections.left){
				if(this.bFSGhost.tileX > 0){	this.bFSGhost.tileX-=1
					this.bFSGhost.translationX -= 100;}
			}
		
	}
	
	
}




// Controllers 

// The commnad Design pattern is utilized to move the plyayer // To Do // Apply this to every actor 

export function MoveUp(GameActor , map){
	if  (GameActor.tileY >=9 || map[GameActor.tileX][GameActor.tileY + 1].getType() === tilesEnum.wall  )  {  // To Do change that to the levels cords by passign the level
		//console.log("wall");
	}

	else  {
		GameActor.tileY++; 
		GameActor.translationY +=100;
		//console.log("Moving Up")
		return;
	}

	
	}

	export function MoveDown(GameActor , map){
		if  (GameActor.tileY <=0 || map[GameActor.tileX][GameActor.tileY - 1].getType() === tilesEnum.wall)  { 
			//console.log("wall");
		}
	
		else  {
			GameActor.tileY--; 
			GameActor.translationY -=100;
			//console.log("Moving Down")
			return;
		}
		}

	export	function MoveRight(GameActor , map){
			if  (GameActor.tileX >=8 || map[GameActor.tileX+1][GameActor.tileY].getType() === tilesEnum.wall)  { 
				//console.log("wall");
			}
		
			else  {
				GameActor.tileX++; 
				GameActor.translationX +=100;
				//console.log("Moving Right")
				return;
			}
			}
			

			export function MoveLeft(GameActor , map){
				if  ( GameActor.tileX <=0 ||map[GameActor.tileX-1][GameActor.tileY].getType() === tilesEnum.wall)  { 
					//console.log("wall");
				}
			
				else  {
					GameActor.tileX--; 
					GameActor.translationX -=100;
					//console.log("Moving Left")
					return;
				}
				}
	



// ********************************


// event listeners 
export function EventListners(gameManager){ 
	document.addEventListener("keyup",(event)=>{
		gameManager.getPlayer().canMove = true;
	});
	document.addEventListener("keydown", (event) => {
		if(gameManager.getPlayer().movmentdirection === movmentDirections.stop && gameManager.getPlayer().canMove === true){
		if (event.key === "w" || event.key === "W") {
			gameManager.getPlayer().movmentdirection = movmentDirections.up;
			gameManager.getPlayer().canMove = false;
		}
		else if (event.key === "s" || event.key === "S"){
			//MoveDown(gameManager.player, gameManager.level.map);
			gameManager.getPlayer().movmentdirection = movmentDirections.down;
			gameManager.getPlayer().canMove = false;

		}

		else if (event.key === "d" || event.key === "D"){
			//MoveRight(gameManager.player, gameManager.level.map);
			gameManager.getPlayer().movmentdirection = movmentDirections.right;
			gameManager.getPlayer().canMove = false;


		}

		else if (event.key === "a" || event.key === "A"){
			//MoveLeft(gameManager.player, gameManager.level.map);
			gameManager.getPlayer().movmentdirection = movmentDirections.left;
			gameManager.getPlayer().canMove = false;


		}

		else if (event.key === "p" || event.key === "P"){
			gameManager.stoped = true;


		}
		else if (event.key === "r" || event.key === "R"){
			gameManager.stop = false;


		}
		}	
	  });
}










