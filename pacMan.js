import * as webGL from './WebGL_API.js';
import * as gameLogic from './gameLogic.js';
import * as utils from './util.js';

// Shaders 

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
' gl_PointSize = 6.0;',
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





var  canvas = document.getElementById('glcanvas');



function createNewMap(tileSize){
    const newMap = [];
    let width = canvas.clientWidth*2;
    let highet = canvas.clientHeight*2;
    
    
    for (let x = tileSize; x <= width; x += tileSize*2) {
        const column = [];
      
        // Iterate through each row in the column
        for (let y = tileSize; y <= highet; y += tileSize*2) {
          // Create a new tile with the same coordinates
          const tile = new gameLogic.Tile(gameLogic.tilesEnum.not_visited , [x , y]);
          column.push(tile);
        }
      
        // Add the column to the tiles array
        newMap.push(column);
      }

      return newMap
}




function createNewGame(timer , maxScore , numOfPoints){
   let  map = createNewMap(50);
   console.log(map);
   map[4][0].setType(gameLogic.tilesEnum.visitd);
   let demoLevel = new gameLogic.Level(map, 9 , 10, null);  // TODO add the walls 
    let pacManPL = new gameLogic.GameActor(gameLogic.gameObjectTypes.player , 4 ,0 , [50 , 350]);
   let pacManGM = new gameLogic.GameManager(demoLevel , timer , maxScore , numOfPoints, pacManPL);
    return pacManGM; 
}


function getPointsData(gameManager){
    const gamePointsList = gameManager.level.getGamePoints();
	let pointsdata =  gamePointsList.map((point) => point.getRenderBufferData());
	return pointsdata;
}

function renderPoints(pointsBuffer , numOfPoints){
    let posAtr = new webGL.VertexAtr(gl.FLOAT , 2 , false); 
    let posLayout = new webGL.bufferLayout();
    posLayout.pushAtr(posAtr);
    let vertexAraryPoints = new webGL.VertexArray(pointsBuffer , posLayout);
    let program = new webGL.Program(vertexShaderText , fragmentShaderText);
    let rendrer = new webGL.Renderer(pointsBuffer , vertexAraryPoints , program);
    rendrer.drawPoint(numOfPoints);
    //pointsBuffer.unbindBuffer();
}



function InitDemo  () {


	const pacManGameMode = createNewGame(100 , 500 , 89);

    let  pointsData = getPointsData(pacManGameMode);
    let pointsBuffer = new webGL.VertexBuffer(utils.flatten(pointsData) , 1 , 2);


    

	  
	gameLogic.EventListners(pacManGameMode);


  function update(){
    renderPoints(pointsBuffer , pacManGameMode.numOfPonts);
	pacManGameMode.movePlayer();
	pacManGameMode.updateGameStatus();
	const gamePointsList = pacManGameMode.level.getGamePoints();
	pointsData =  gamePointsList.map((point) => point.getRenderBufferData());
    pointsBuffer.updateData(utils.flatten(pointsData));
    pacManGameMode.getGameData();

	setTimeout(()=>{requestAnimationFrame(update);},500)
	}
	update();
};





canvas.onload = InitDemo();