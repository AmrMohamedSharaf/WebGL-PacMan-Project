// WEB GL Section 

var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = vec4(vertPosition, 0.0, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');
//******************************** *
















function createShaders(){
	var  canvas = document.getElementById('game-surface');
var gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//
	// Create shaders
	// 
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}
}









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
	createShaders();
	 // To Do put this into some function
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
	  // ******************************

  function update(){
	// To Do Encapsulate this into a function 
	if(pacManGameMode.getPlayer().getMovmentDirec() === movmentDirections.up){
		MoveUp(pacManGameMode.player, pacManGameMode.level.map);
	}
	else if(pacManGameMode.getPlayer().getMovmentDirec() === movmentDirections.down){
		MoveDown(pacManGameMode.player, pacManGameMode.level.map);
	}

	else if (pacManGameMode.getPlayer().getMovmentDirec() === movmentDirections.left){
		MoveLeft(pacManGameMode.player, pacManGameMode.level.map);}

		else if (pacManGameMode.getPlayer().getMovmentDirec() === movmentDirections.right){
			MoveRight(pacManGameMode.player, pacManGameMode.level.map);}
	//***************************** */




	setTimeout(()=>{requestAnimationFrame(update);},1000)
	}
	update();
};



