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
'uniform vec2 tranlationVect;',
'uniform float pointSize;',
'varying vec3 fragColor;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = vec4(vertPosition + tranlationVect , 0.0, 1.0);',
' gl_PointSize = pointSize;',
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

// Desc Generates a new 2D arrays of tiles based on the size of the canvas 

function createNewMap(tileSize){
    const newMap = [];
    let width = canvas.clientWidth*2;
    let highet = canvas.clientHeight*2;
    
    
    for (let x = tileSize; x <= width; x += tileSize*2) {
        const column = [];
      
        // 
        for (let y = tileSize; y <= highet; y += tileSize*2) {
          // 
          const tile = new gameLogic.Tile(gameLogic.tilesEnum.not_visited , [x , y]);
          column.push(tile);
        }
      
        // 
        newMap.push(column);
      }

      return newMap
}

// Establishes the locations of the wallls and the spec item  return the game mananger 


function createNewGame(timer , maxScore , numOfPoints){
   let  map = createNewMap(50);
   console.log(map);
   map[4][0].setType(gameLogic.tilesEnum.visitd);

   // Fisrt wall 
   map[1][1].setType(gameLogic.tilesEnum.wall); map[2][1].setType(gameLogic.tilesEnum.wall); map[3][1].setType(gameLogic.tilesEnum.wall);
   map[1][2].setType(gameLogic.tilesEnum.wall); map[2][2].setType(gameLogic.tilesEnum.wall); map[3][2].setType(gameLogic.tilesEnum.wall);

   // Second wall 
   map[5][1].setType(gameLogic.tilesEnum.wall); map[6][1].setType(gameLogic.tilesEnum.wall); map[7][1].setType(gameLogic.tilesEnum.wall);
   map[5][2].setType(gameLogic.tilesEnum.wall); map[6][2].setType(gameLogic.tilesEnum.wall); map[7][2].setType(gameLogic.tilesEnum.wall);

   // Third wall 
   map[1][7].setType(gameLogic.tilesEnum.wall); map[2][7].setType(gameLogic.tilesEnum.wall); map[3][7].setType(gameLogic.tilesEnum.wall);
   map[1][8].setType(gameLogic.tilesEnum.wall); map[2][8].setType(gameLogic.tilesEnum.wall); map[3][8].setType(gameLogic.tilesEnum.wall);


      // Fourth wall 
    map[5][7].setType(gameLogic.tilesEnum.wall); map[6][7].setType(gameLogic.tilesEnum.wall); map[7][7].setType(gameLogic.tilesEnum.wall);
    map[5][8].setType(gameLogic.tilesEnum.wall); map[6][8].setType(gameLogic.tilesEnum.wall); map[7][8].setType(gameLogic.tilesEnum.wall);

    // small  wall 
    map[1][4].setType(gameLogic.tilesEnum.wall); map[1][5].setType(gameLogic.tilesEnum.wall); 
    map[7][4].setType(gameLogic.tilesEnum.wall); map[7][5].setType(gameLogic.tilesEnum.wall); 
    map[4][4].setType(gameLogic.tilesEnum.wall); map[4][5].setType(gameLogic.tilesEnum.wall); 
     
    var specItemX = Math.floor(Math.random() * 9);
    var specItemY = Math.random() < 0.5 ? 6 : 9;

    map[specItemX][specItemY].setType(gameLogic.tilesEnum.speialItem);






   let demoLevel = new gameLogic.Level(map, 9 , 10,);  // TODO add the walls 
    let pacManPL = new gameLogic.GameActor(gameLogic.gameObjectTypes.player , 4 ,0 , [50 , 300 , 50 , 350 , 100 , 325]);
    let bFSghost = new gameLogic.GameActor(gameLogic.gameObjectTypes.ghosts_1 , 4 ,4, [450 , 450]);
    let greadyGhost = new gameLogic.GameActor(gameLogic.gameObjectTypes.ghosts_2 , 4 ,5 , [450 , 550]);
   let pacManGM = new gameLogic.GameManager(demoLevel , timer , maxScore , numOfPoints, pacManPL ,  bFSghost, greadyGhost , specItemX , specItemY);
    return pacManGM; 
}


// returns the render buffer data of the game points. this date is update by the game manger 

function getPointsData(gameManager){
    const gamePointsList = gameManager.level.getGamePoints();
	let pointsdata =  gamePointsList.map((point) => point.getRenderBufferData());
	return pointsdata;
}


// Utilized the WebGL interface I wrote in the other file to quickly render the points 
function renderPoints(pointsBuffer , numOfPoints , program){
    let posAtr = new webGL.VertexAtr(gl.FLOAT , 2 , false); 
    let posLayout = new webGL.bufferLayout();
    posLayout.pushAtr(posAtr);
    let vertexAraryPoints = new webGL.VertexArray(pointsBuffer , posLayout);
    let rendrer = new webGL.Renderer(pointsBuffer , vertexAraryPoints , program);
    program.setUniform3("vertColor" , 1.0 , 0.6 , 0.0)
    program.setUniform1("pointSize" , 6.0)
    program.setUniform2("tranlationVect" , 0.0 , 0.0 , 0.0 ,0.0)
    rendrer.drawPoint(numOfPoints);
    //pointsBuffer.unbindBuffer();
}


// Utilized the WebGL interface I wrote in the other file to quickly render the points 

function renderSpecItem(pointsBuffer , numOfPoints , program){
  let posAtr = new webGL.VertexAtr(gl.FLOAT , 2 , false); 
  let posLayout = new webGL.bufferLayout();
  posLayout.pushAtr(posAtr);
  let vertexAraryPoints = new webGL.VertexArray(pointsBuffer , posLayout);
  let rendrer = new webGL.Renderer(pointsBuffer , vertexAraryPoints , program);
  program.setUniform3("vertColor" , 1.0 , 0.9 , 0.0)
  program.setUniform1("pointSize" , 12.0)
  program.setUniform2("tranlationVect" , 0.0 , 0.0 , 0.0 ,0.0)
  rendrer.drawPoint(numOfPoints);
  //pointsBuffer.unbindBuffer();
}


// Utilized the WebGL interface I wrote in the other file to quickly render the triangle  

function renderPlayer(gameManager , playerBuffer , program){

    let posAtr = new webGL.VertexAtr(gl.FLOAT , 2 , false); 
    let posLayout = new webGL.bufferLayout();
    posLayout.pushAtr(posAtr);
    let vertexArrayPlayer = new webGL.VertexArray(playerBuffer , posLayout);
    let rendrer = new webGL.Renderer(playerBuffer , vertexArrayPlayer , program);
    program.setUniform3("vertColor" , 0.192 , 0.286 , 0.655)
    program.setUniform2("tranlationVect" , utils.getNormllizedXCoords(gameManager.getPlayer().getXtranslation() , canvas.clientWidth)  ,  utils.getNormllizedXCoords(gameManager.getPlayer().getYtranslation() , canvas.clientHeight));
   //console.log( gameManager.getPlayer().getYtranslation())
    rendrer.drawTriangle();

}

// Utilized the WebGL interface I wrote in the other file to quickly render the ghosts  


function renderBFSGhost(gameManager , ghostBuffer , program){

  let posAtr = new webGL.VertexAtr(gl.FLOAT , 2 , false); 
  let posLayout = new webGL.bufferLayout();
  posLayout.pushAtr(posAtr);
  let vertexAraryPoints = new webGL.VertexArray(ghostBuffer , posLayout);
  let rendrer = new webGL.Renderer(ghostBuffer , vertexAraryPoints , program);
  program.setUniform3("vertColor" , 1.0 , 0.0 , 0.0)
  program.setUniform1("pointSize" , 20)
  program.setUniform2("tranlationVect" , utils.getNormllizedXCoords(gameManager.getBFSGhost().getXtranslation() , canvas.clientWidth)  ,  utils.getNormllizedXCoords(gameManager.getBFSGhost().getYtranslation() , canvas.clientHeight));
  rendrer.drawPoint(1);
}


function renderGreedyGhost(gameManager , ghostBuffer , program){

  let posAtr = new webGL.VertexAtr(gl.FLOAT , 2 , false); 
  let posLayout = new webGL.bufferLayout();
  posLayout.pushAtr(posAtr);
  let vertexAraryPoints = new webGL.VertexArray(ghostBuffer , posLayout);
  let rendrer = new webGL.Renderer(ghostBuffer , vertexAraryPoints , program);
  program.setUniform3("vertColor" , 0.2 , 0.922 , 0.949)
  program.setUniform1("pointSize" , 20)
  program.setUniform2("tranlationVect" , utils.getNormllizedXCoords(gameManager.getGreedyGhost().getXtranslation() , canvas.clientWidth)  ,  utils.getNormllizedXCoords(gameManager.getGreedyGhost().getYtranslation() , canvas.clientHeight));
  rendrer.drawPoint(1);
}


function renderbox( boxBuffer , program){

  let posAtr = new webGL.VertexAtr(gl.FLOAT , 2 , false); 
  let posLayout = new webGL.bufferLayout();
  posLayout.pushAtr(posAtr);
  let vertexAraryPoints = new webGL.VertexArray(boxBuffer , posLayout);
  let rendrer = new webGL.Renderer(boxBuffer , vertexAraryPoints , program);
  program.setUniform3("vertColor" , 1.0 , 0.6 , 0.0)
  program.setUniform1("pointSize" , 0)
  program.setUniform2("tranlationVect" , 0.0 , 0.0);
  rendrer.drawRectangle();
}

// Desc : the start of our game 
function InitDemo  () {

  // hardcoded values for the walls , player and spec item 
	var pacManGameMode = createNewGame(60 , 500 , 58);

    let playercoords  = [
		[400, 25], [500 , 25] ,[ 450,100]  
    ]


    let box1coords = [ 
      [100,100] , [400, 100] , [100,300], [400, 300]
    ]


    let box2coords = [ 
      [500,100] , [800, 100] , [500,300], [800, 300]
    ]


    let box3coords = [ 
      [500,700] , [800, 700] , [500,900], [800, 900]
    ]

    let box4coords = [ 
      [100,700] , [400, 700] , [100,900], [400, 900]
    ]

    let box5coords = [ 
      [100,400] , [200, 400] , [100,600], [200, 600]
    ]

    let box6coords = [ 
      [700,400] , [800, 400] , [700,600], [800, 600]
    ]




    let specItemCoords = pacManGameMode.level.map[pacManGameMode.specTileX][pacManGameMode.specTileY].getRenderBufferData()

    let specItemdata =  utils.getNormllizedCoords(specItemCoords , canvas.clientWidth , canvas.clientHeight);

    console.log(specItemdata);

    let playerdata =  playercoords.map((coords) => utils.getNormllizedCoords(coords , canvas.clientWidth , canvas.clientHeight));
   let box1data =  box1coords.map((coords) => utils.getNormllizedCoords(coords , canvas.clientWidth , canvas.clientHeight));
   let box2data =  box2coords.map((coords) => utils.getNormllizedCoords(coords , canvas.clientWidth , canvas.clientHeight));
   let box3data =  box3coords.map((coords) => utils.getNormllizedCoords(coords , canvas.clientWidth , canvas.clientHeight));
   let box4data =  box4coords.map((coords) => utils.getNormllizedCoords(coords , canvas.clientWidth , canvas.clientHeight));
   let box5data =  box5coords.map((coords) => utils.getNormllizedCoords(coords , canvas.clientWidth , canvas.clientHeight));
   let box6data =  box6coords.map((coords) => utils.getNormllizedCoords(coords , canvas.clientWidth , canvas.clientHeight));
    //let bfsghostdata =  bfsGhostcoords.map((coords) => utils.getNormllizedCoords(coords , canvas.clientWidth , canvas.clientHeight));

   // console.log(bfsghostdata)


    // Creating the render buffers and the frame varaible which will used in the request next animaiton frame 

    let  pointsData = getPointsData(pacManGameMode);
    let pointsBuffer = new webGL.VertexBuffer(utils.flatten(pointsData) , 1 , 2);
    let playerBuffer = new webGL.VertexBuffer(utils.flatten(playerdata) , 1 , 2);
    let bfsghostBuffer = new webGL.VertexBuffer(utils.flatten(pacManGameMode.getBFSGhost().getRenderBufferData()) , 1 , 2);
    let greedyghostBuffer = new webGL.VertexBuffer(utils.flatten(pacManGameMode.getGreedyGhost().getRenderBufferData()) , 1 , 2);
    let box1Buffer = new webGL.VertexBuffer(utils.flatten(box1data) , 1 , 2);
    let box2Buffer = new webGL.VertexBuffer(utils.flatten(box2data) , 1 , 2);
    let box3Buffer = new webGL.VertexBuffer(utils.flatten(box3data) , 1 , 2);
    let box4Buffer = new webGL.VertexBuffer(utils.flatten(box4data) , 1 , 2);
    let box5Buffer = new webGL.VertexBuffer(utils.flatten(box5data) , 1 , 2);
    let box6Buffer = new webGL.VertexBuffer(utils.flatten(box6data) , 1 , 2);
    let specItemBuffer = new webGL.VertexBuffer(utils.flatten(specItemdata) , 1 , 2);
    let program = new webGL.Program(vertexShaderText , fragmentShaderText);


    var frame;
	gameLogic.EventListners(pacManGameMode);
    var is_paused = false; 

    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    renderPoints(pointsBuffer , pacManGameMode.numOfPonts , program);
    renderPlayer(pacManGameMode , playerBuffer , program);
    renderBFSGhost(pacManGameMode , bfsghostBuffer , program)
    renderGreedyGhost(pacManGameMode , greedyghostBuffer , program)
    renderbox(box1Buffer , program);
    renderbox(box2Buffer , program);
    renderbox(box3Buffer , program);
    renderbox(box4Buffer , program);
    renderbox(box5Buffer , program);
    renderbox(box6Buffer , program);
    renderSpecItem(specItemBuffer , pacManGameMode.numOfSpeicalItems,program)
  
 // update();
  function update(){
    //Update the HTML text
    var Score = document.getElementById('score'); 
    Score.textContent = 'Score: ' + pacManGameMode.score;
    var timer = document.getElementById('timer'); 
    timer.textContent = 'Time: ' + pacManGameMode.timer;
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        //render the objects 
    renderbox(box1Buffer , program);
    renderbox(box2Buffer , program);
    renderbox(box3Buffer , program);
    renderbox(box4Buffer , program);
    renderbox(box5Buffer , program);
    renderbox(box6Buffer , program);
    renderSpecItem(specItemBuffer , pacManGameMode.numOfSpeicalItems,program)
     renderPoints(pointsBuffer , pacManGameMode.numOfPonts , program);
     pacManGameMode.movePlayer();
     renderPlayer(pacManGameMode , playerBuffer , program);
    // Update the game stauts 
     pacManGameMode.updateGameStatus()

     pacManGameMode.moveBFSGhost();
     pacManGameMode.moveGreedyGhost();
     renderBFSGhost(pacManGameMode , bfsghostBuffer , program)
     renderGreedyGhost(pacManGameMode , greedyghostBuffer , program)
     // update the game points 
    let  pointsData = getPointsData(pacManGameMode);
    pointsBuffer.updateData(utils.flatten(pointsData));
    pacManGameMode.getGameData();

      // checks if the P key was pressed if not then render the next frame 
      if(!pacManGameMode.stoped){  frame = setTimeout(()=>{requestAnimationFrame(update);},500)
    }

	}


  // more event listners for the reset start and pause. 

  document.addEventListener("keydown", (event) => {
     if (event.shiftKey && (event.key =="R" || event.key == "r")){
      cancelAnimationFrame(frame);
      pacManGameMode.stoped = true;
      let map = createNewMap(50);
      pacManGameMode = createNewGame(60 , 500 , 58);
      gameLogic.EventListners(pacManGameMode);
    }
    if(event.key == "p"){
      pacManGameMode.stoped = true;
      cancelAnimationFrame(frame);
    }

    else if ((event.key == "r" || event.key == "R") && pacManGameMode.stoped == true){
      pacManGameMode.stoped = false;
      update();
    }
    else if ((event.key == "s" || event.key == "S" )&& pacManGameMode.started == false){
      pacManGameMode.started = true;
      update();
    }
   
  })
	
};





canvas.onload = InitDemo();