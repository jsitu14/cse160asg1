// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program

var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform float u_Size;

  void main() {
   gl_Position = a_Position;
    //gl_PointSize = 20.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor; 
  }`
//Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL(){
 // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

 // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
 gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
 
  if (!gl) {
   console.log('Failed to get the rendering context for WebGL');
   return;
 }

}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }
  
    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }
  
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
      console.log('Failed to get the storage location of u_Size');
      return;
    }
}

function resetPreviewShape() {
  if (g_selectedType === POINT) {
    g_previewShape = new Point();
  } else if (g_selectedType === TRIANGLE) {
    g_previewShape = new Triangle();
  } else if (g_selectedType === CIRCLE) {
    g_previewShape = new Circle();
  }

  // Apply the current color and size to the preview shape
  if (g_previewShape) {
    g_previewShape.color = g_selectedColor.slice();
    g_previewShape.size = g_selectedSize;
    g_previewShape.position = [0, 0]; // Default to center of canvas initially
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
let g_selectedColor =   [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;

function addActionsForHtmlUI(){
  document.getElementById('green').onclick = function() {
    g_selectedColor = [0.0,1.0,0.0,1.0]; 
    resetPreviewShape();};
  document.getElementById('red').onclick = function() {
    g_selectedColor = [1.0,0.0,0.0,1.0]; 
    resetPreviewShape();};
    document.getElementById('clearButton').onclick = function() {
      g_shapesList = []; renderALLShapes();
    };
  document.getElementById('pointButton').onclick = function() {g_selectedType = POINT;
    resetPreviewShape();
  }
  document.getElementById('triangleButton').onclick = function() {g_selectedType = TRIANGLE;
    resetPreviewShape();
  }
  document.getElementById('circleButton').onclick = function() {g_selectedType = CIRCLE;
    resetPreviewShape();
  }
  document.getElementById('drawImageButton').onclick = function() {
    drawPresetImage();

  }

  //slider events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100;
    resetPreviewShape();
   });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; 
    resetPreviewShape();
  });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; 
    resetPreviewShape();
  });
  //size slider
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; 
    resetPreviewShape();
  });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() {g_selectedSegments = this.value;
    resetPreviewShape();
  });
  

}

  
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}


var g_shapesList = [];
// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];
let poses = [[0.4,0.2]
,[0.5,0.1]
,[0.3,-0.1]
,[0.5,0.1]
,[0.3,0.1]
,[-0.6,-0.9]
,[-0.5,-0.9]
,[-0.3,-0.9]
,[-0.5,-0.7]
,[-0.5,-0.7]
,[-0.7,-0.9]
,[-0.3,-0.5]
,[-0.5,-0.5]
,[-0.7,-0.5]
,[-0.7,-0.4]
,[-0.3,-0.4]
,[-0.5,-0.5]
,[-0.5,-0.7]
,[-0.5,-0.9]
,[-0.5,-0.9]
,[-0.7,-0.7]
,[-0.6,-0.7]
,[-0.3,-0.7]];
let color = [[0,1,0,1],[1,1,0,1],[1,1,0,1],[1,1,0,1],[1,1,0,1],[1,0,0,1],
[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1]
,[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,0,1],
[1,1,0,1],[1,1,0,1],[1,1,0,1],[1,1,0,1],[1,1,0,1],[1,1,0,1],[1,1,0,1],[1,1,0,1],[1,1,0,1]];
let sizes = [40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40];
let shapers = [0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0];
let vertic = [true,false,true,true,false,false];
let hori = [true,false,false,true,false,true];
function drawPresetImage() {
  let point;
  let h = 0; //hori tracker;
  let v = 0; //vertical tracker
  for (var i = 0; i < poses.length; i++){
    console.log(i);
    if (shapers[i] == TRIANGLE){
      point = new Triangle();
      point.position = poses[i];
      point.flippedH = hori[h];
      h++;
      point.flippedV = vertic[v];
      v++;
      point.color = color[i];
      point.size = sizes[i];
      g_shapesList.push(point);
    }
    else if (shapers[i] == POINT){
      point = new Point();
      point.position = poses[i];
      point.color = color[i];
      point.size = sizes[i];
      g_shapesList.push(point);
    }
    
  }
  renderALLShapes();
}

function click(ev) {
  [x,y] = convertCoordinatesEventToGL(ev);
  
  let point;
  if (g_selectedType == POINT){
    point = new Point();

  }else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  }else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  renderALLShapes();
}
function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);


}
  function renderALLShapes(){

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_points.length
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    
    g_shapesList[i].render();

  }
}

