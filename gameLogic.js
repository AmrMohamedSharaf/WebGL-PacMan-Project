// GLSL Shaders

var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'uniform vec3 vertColor;',
'varying vec3 fragColor;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = vec4(vertPosition, 0.0, 1.0);',
' gl_PointSize = 16.0;',
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


// Helper functions 
var  canvas = document.getElementById('game-surface');
var gl = canvas.getContext('webgl');
var program;



function getNormllizedCoords(coordvec , xAxisSize , yAxisSize){
	let xhalfAxisSize = xAxisSize/2;
	let yhalfAxisSize = yAxisSize/2;

	let normX = (coordvec[0]/xAxisSize)-1;
	let normY = (coordvec[1]/yAxisSize)-1;
	return[normX , normY];

}


function flatten( v )
{
    if ( v.matrix === true ) {
        v = transpose( v );
    }

    var n = v.length;
    var elemsAreArrays = false;

    if ( Array.isArray(v[0]) ) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    var floats = new Float32Array( n );

    if ( elemsAreArrays ) {
        var idx = 0;
        for ( var i = 0; i < v.length; ++i ) {
            for ( var j = 0; j < v[i].length; ++j ) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for ( var i = 0; i < v.length; ++i ) {
            floats[i] = v[i];
        }
    }

    return floats;
}














// To DO rewrite the code for creating shaders
function createShaders(){


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

	 program = gl.createProgram();
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
		return getNormllizedCoords(this.renderBufferData , canvas.width , canvas.height);
	}
}

// Desc : takes an array of points data buffer and walls data buffer and a 2d array for the map
class Level {
	constructor(map , width , highet ,   wallsDataBuffer){
		this.map = map; 
		this.width = width; 
		this.highet = highet
		this.wallsDataBuffer = wallsDataBuffer;
		this.gamePointsList = []
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

	updateGameMap(){
		if(this.level.map[this.player.getXCords()][this.player.getYCords()].getType() === tilesEnum.not_visited){
			this.level.map[this.player.getXCords()][this.player.getYCords()].setType(tilesEnum.visitd) ;
			this.score+=100;
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
		}
	
}




// Controllers 

function MoveUp(GameActor , map){
	if  (GameActor.tileY >=9 || map[GameActor.tileX][GameActor.tileY + 1].getType() === tilesEnum.wall  )  {  // To Do change that to the levels cords by passign the level
		console.log("wall");
	}

	else  {
		GameActor.tileY++; 
		console.log("Moving Up")
		return;
	}

	
	}

	function MoveDown(GameActor , map){
		if  (GameActor.tileY <=0 || map[GameActor.tileX][GameActor.tileY - 1].getType() === tilesEnum.wall)  { 
			console.log("wall");
		}
	
		else  {
			GameActor.tileY--; 
			console.log("Moving Down")
			return;
		}
		}

		function MoveRight(GameActor , map){
			if  (GameActor.tileX >=8 || map[GameActor.tileX+1][GameActor.tileY].getType() === tilesEnum.wall)  { 
				console.log("wall");
			}
		
			else  {
				GameActor.tileX++; 
				console.log("Moving Right")
				return;
			}
			}
			

			function MoveLeft(GameActor , map){
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






function createNewGame(){
	const map = [
		// first Column
		[new Tile(tilesEnum.not_visited, [100, 100]), new Tile(tilesEnum.not_visited, [100, 300]), new Tile(tilesEnum.not_visited, [100, 500]),
		new Tile(tilesEnum.not_visited, [100, 700]), new Tile(tilesEnum.not_visited, [100, 900]), new Tile(tilesEnum.not_visited, [100, 1100]),
		new Tile(tilesEnum.not_visited, [100, 1300]), new Tile(tilesEnum.not_visited, [100, 1500]), new Tile(tilesEnum.not_visited, [100, 1700]),
		new Tile(tilesEnum.not_visited, [100, 1900])
	    ],
	
	// Second Column
	[new Tile(tilesEnum.not_visited, [300, 100]), new Tile(tilesEnum.wall, [300, 300]), new Tile(tilesEnum.wall, [300, 500]),
		new Tile(tilesEnum.not_visited, [300, 700]), new Tile(tilesEnum.wall, [300, 900]), new Tile(tilesEnum.wall, [300, 1100]),
		new Tile(tilesEnum.not_visited, [300, 1300]), new Tile(tilesEnum.wall, [300, 1500]), new Tile(tilesEnum.wall, [300, 1700]),
		new Tile(tilesEnum.not_visited, [300, 1900])
	 ],

	 	// Third Column
	[new Tile(tilesEnum.not_visited, [500, 100]), new Tile(tilesEnum.wall, [500, 300]), new Tile(tilesEnum.wall, [500, 500]),
	new Tile(tilesEnum.not_visited, [500, 700]), new Tile(tilesEnum.not_visited, [500, 900]), new Tile(tilesEnum.not_visited, [500, 1100]),
	new Tile(tilesEnum.not_visited, [500, 1300]), new Tile(tilesEnum.wall, [500, 1500]), new Tile(tilesEnum.wall, [500, 1700]),
	new Tile(tilesEnum.not_visited, [500, 1900])
   ],

   	 	// Fourth Column
	[new Tile(tilesEnum.not_visited, [700, 100]), new Tile(tilesEnum.wall, [700, 300]), new Tile(tilesEnum.wall, [700, 500]),
	new Tile(tilesEnum.not_visited, [700, 700]), new Tile(tilesEnum.not_visited, [700, 900]), new Tile(tilesEnum.not_visited, [700, 1100]),
	new Tile(tilesEnum.not_visited, [700, 1300]), new Tile(tilesEnum.wall, [700, 1500]), new Tile(tilesEnum.wall, [700, 1700]),
	new Tile(tilesEnum.not_visited, [700, 1900])
   ],

    	 	// 5th Column
	[new Tile(tilesEnum.visitd, [900, 100]), new Tile(tilesEnum.not_visited, [900, 300]), new Tile(tilesEnum.not_visited, [900, 500]),
	new Tile(tilesEnum.not_visited, [900, 700]), new Tile(tilesEnum.wall, [900, 900]), new Tile(tilesEnum.wall, [900, 1100]),
	new Tile(tilesEnum.not_visited, [900, 1300]), new Tile(tilesEnum.not_visited, [900, 1500]), new Tile(tilesEnum.not_visited, [900, 1700]),
	new Tile(tilesEnum.not_visited, [900, 1900])
   ],

       	 	// 6th Column
	[new Tile(tilesEnum.not_visited, [1100, 100]), new Tile(tilesEnum.wall, [1100, 300]), new Tile(tilesEnum.wall, [1100, 500]),
	new Tile(tilesEnum.not_visited, [1100, 700]), new Tile(tilesEnum.not_visited, [1100, 900]), new Tile(tilesEnum.not_visited, [1100, 1100]),
	new Tile(tilesEnum.not_visited, [1100, 1300]), new Tile(tilesEnum.wall, [1100, 1500]), new Tile(tilesEnum.wall, [1100, 1700]),
	new Tile(tilesEnum.not_visited, [1100, 1900])
   ],

         	 	// 7th Column
	[new Tile(tilesEnum.not_visited, [1300, 100]), new Tile(tilesEnum.wall, [1300, 300]), new Tile(tilesEnum.wall, [1300, 500]),
	new Tile(tilesEnum.not_visited, [1300, 700]), new Tile(tilesEnum.not_visited, [1300, 900]), new Tile(tilesEnum.not_visited, [1300, 1100]),
	new Tile(tilesEnum.not_visited, [1300, 1300]), new Tile(tilesEnum.wall, [1300, 1500]), new Tile(tilesEnum.wall, [1300, 1700]),
	new Tile(tilesEnum.not_visited, [1300, 1900])
   ],

            	 	// 8th Column
	[new Tile(tilesEnum.not_visited, [1500, 100]), new Tile(tilesEnum.wall, [1500, 300]), new Tile(tilesEnum.wall, [1500, 500]),
	new Tile(tilesEnum.not_visited, [1500, 700]), new Tile(tilesEnum.wall, [1500, 900]), new Tile(tilesEnum.wall, [1500, 1100]),
	new Tile(tilesEnum.not_visited, [1500, 1300]), new Tile(tilesEnum.wall, [1500, 1500]), new Tile(tilesEnum.wall, [1500, 1700]),
	new Tile(tilesEnum.not_visited, [1500, 1900])
   ],

               	 	// 9th Column
	[new Tile(tilesEnum.not_visited, [1700, 100]), new Tile(tilesEnum.not_visited, [1700, 300]), new Tile(tilesEnum.not_visited, [1700, 500]),
	new Tile(tilesEnum.not_visited, [1700, 700]), new Tile(tilesEnum.not_visited, [1700, 900]), new Tile(tilesEnum.not_visited, [1700, 1100]),
	new Tile(tilesEnum.not_visited, [1700, 1300]), new Tile(tilesEnum.not_visited, [1700, 1500]), new Tile(tilesEnum.not_visited, [1700, 1700]),
	new Tile(tilesEnum.not_visited, [1700, 1900])
   ],



	  ];

	 demoLevel = new Level(map, 9 , 10, null);
	 demoLevel.updateLevelPoints();

	 pacManTrig = new GameActor(gameObjectTypes.player,4,0 ,[300, 100])

	 currentGameManager = new GameManager(demoLevel , 60 , pacManTrig);
	 return currentGameManager

}



function EventListners(gameManager){ 
	document.addEventListener("keydown", (event) => {
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
	  });
}






function InitDemo  () {
	



	const pacManGameMode = createNewGame();
	createShaders();
	gl.useProgram(program);
		const gamePointsList = pacManGameMode.level.getGamePoints();
	
		let pointsdata =  gamePointsList.map((point) => point.getRenderBufferData());
	  

	  console.log(pointsdata);
	  

	var pointsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(pointsdata)), gl.STATIC_DRAW);

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getUniformLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);


	gl.enableVertexAttribArray( positionAttribLocation );  
	gl.uniform3f(colorAttribLocation , 1.0,0.0,0.0,);
  



	EventListners(pacManGameMode);

  function update(){

	pacManGameMode.movePlayer();
	pacManGameMode.updateGameMap();
	const gamePointsList = pacManGameMode.level.getGamePoints();
	pointsdata =  gamePointsList.map((point) => point.getRenderBufferData());



	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(pointsdata)), gl.STATIC_DRAW);
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getUniformLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);


	gl.enableVertexAttribArray( positionAttribLocation );  
	gl.clear( gl.COLOR_BUFFER_BIT ); 
    gl.drawArrays( gl.POINTS, 0, pointsdata.length );

	setTimeout(()=>{requestAnimationFrame(update);},1000)
	}
	update();
};



