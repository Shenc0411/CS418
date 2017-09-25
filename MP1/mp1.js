
var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;


// Create a place to store vertex colors
var vertexColorBuffer;

var mvMatrix = mat4.create();
var rotAngle = 0;
var lastTime = 0;
var elapsed = 0;
var sinAngle = 0;
var offset = 0;

/**
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}


/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  
}

/**
 * Populate buffers with data
 */
function setupBuffers() {
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
//  Setup the vertices position
  var triangleVertices = [
    
//    Upper Part
//    Uppermost Horizontal Bar
    -0.8,  0.9, 0.0,
    -0.8,  0.7, 0.0,
    0.8,  0.7, 0.0,
    -0.8,  0.9, 0.0,
    0.8,  0.9, 0.0,
    0.8,  0.7, 0.0,
    
//    Left Vertical Bar
    -0.65,  0.7, 0.0,
    -0.65, -0.2, 0.0,
    -0.35, -0.2, 0.0,
    -0.65, 0.7, 0.0,
    -0.35, 0.7, 0.0,
    -0.35, -0.2, 0.0,
//    The Small Rectangle to the Left
    -0.35,  0.4, 0.0,
    -0.35,  0.1, 0.0,
    -0.2,  0.1, 0.0,
    -0.2,  0.4, 0.0,
    -0.2,  0.1, 0.0,
    -0.35,  0.4, 0.0,
//    The Right Part of the Upper Part is mirroring the left part. So we just need to negate the sign of x cordinates.
    0.65,  0.7, 0.0,
    0.65, -0.2, 0.0,
    0.35, -0.2, 0.0,
    0.65, 0.7, 0.0,
    0.35, 0.7, 0.0,
    0.35, -0.2, 0.0,

    0.35,  0.4, 0.0,
    0.35,  0.1, 0.0,
    0.2,  0.1, 0.0,
    0.2,  0.4, 0.0,
    0.2,  0.1, 0.0,
    0.35,  0.4, 0.0,
    
//    Lower Part
//    Left Part
//    The Leftmost Bar and the Triganle Below It
    -0.65, -0.25, 0.0,
    -0.65,  -0.35, 0.0,
    -0.55,  -0.35, 0.0,
    -0.55, -0.35, 0.0,
    -0.55, -0.25, 0.0,
    -0.65, -0.25, 0.0,
    -0.65, -0.35, 0.0,
    -0.55, -0.35, 0.0,
    -0.55, -0.45, 0.0,
//    The Middle Bar in the Left Part and the Triangle Below It
    -0.45, -0.25, 0.0,
    -0.45, -0.55, 0.0,
    -0.35, -0.55, 0.0,
    -0.35, -0.55, 0.0,
    -0.35, -0.25, 0.0,
    -0.45, -0.25, 0.0,
    -0.45, -0.55, 0.0,
    -0.35, -0.55, 0.0,
    -0.35, -0.65, 0.0,
//    The Rightmost Bar in the Left Par and the Triangle Below It
    -0.25, -0.25, 0.0,
    -0.25, -0.75, 0.0,
    -0.15, -0.75, 0.0,
    -0.15, -0.75, 0.0,
    -0.15, -0.25, 0.0,
    -0.25, -0.25, 0.0,
    -0.25, -0.75, 0.0,
    -0.15, -0.75, 0.0,
    -0.15, -0.85, 0.0,
    
//    Right Part
//    It is Also Mirroring the Left Part
    0.65, -0.25, 0.0,
    0.65,  -0.35, 0.0,
    0.55,  -0.35, 0.0,
    0.55, -0.35, 0.0,
    0.55, -0.25, 0.0,
    0.65, -0.25, 0.0,
    0.65, -0.35, 0.0,
    0.55, -0.35, 0.0,
    0.55, -0.45, 0.0,

    0.45, -0.25, 0.0,
    0.45, -0.55, 0.0,
    0.35, -0.55, 0.0,
    0.35, -0.55, 0.0,
    0.35, -0.25, 0.0,
    0.45, -0.25, 0.0,
    0.45, -0.55, 0.0,
    0.35, -0.55, 0.0,
    0.35, -0.65, 0.0,

    0.25, -0.25, 0.0,
    0.25, -0.75, 0.0,
    0.15, -0.75, 0.0,
    0.15, -0.75, 0.0,
    0.15, -0.25, 0.0,
    0.25, -0.25, 0.0,
    0.25, -0.75, 0.0,
    0.15, -0.75, 0.0,
    0.15, -0.85, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 84;
    
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  var colors = [
    //blue RGB : 19, 41, 75
    //Upper Part has 30 Vertices
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,
    0.07421875, 0.16015625, 0.29296875, 1.0,


    //orange RGB: 232, 74, 39
    //Lower Part has 54 Vertices
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    0.90625, 0.2890625, 0.15234375, 1.0,
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = 84;  
}

/**
 * Draw call that applies matrix transformations to model and draws model in frame
 */
function draw() { 
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
  
//  Initialize mvMatrix to Be a Identity Matrix
  mat4.identity(mvMatrix);
//  Rotate mvMatrix in Y Direction.
  mat4.rotateY(mvMatrix, mvMatrix, degToRad(rotAngle));  
//  Rotate mvMatrix in Z Direction.
  mat4.rotateZ(mvMatrix, mvMatrix, degToRad(rotAngle)); 
//  Rotate mvMatrix in X Direction.
  mat4.rotateX(mvMatrix, mvMatrix, degToRad(rotAngle));  
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
//  Apply the Transform of mvMatrix
  setMatrixUniforms();
  
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
}

/**
 * Animation to be called from tick. Updates globals and performs animation for each tick.
 */
function animate() {
//  Calculate the Rotation Angle and Position of Vertices in the Mesh.
//  Get Current Time
  var timeNow = new Date().getTime();
//  Check if lastTime is updated. Otherwise the elapsed will get a unanticipatedly large value.
  if (lastTime != 0) {
//    Calculate the Time Elapsed Between Last Frame and This Frame.
    elapsed += timeNow - lastTime;
    if(elapsed > 25){
//      Increase the Sine Angle every 25 ms
      elapsed = 0;
      sinAngle += 0.2;
      offset = Math.sin(sinAngle) / 30;
    }
//    Increase the Rotation Angle 
    rotAngle= (rotAngle + elapsed / 10) % 360;
  }
//  Upadte lastTime
  lastTime = timeNow;
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  var triangleVertices = [
    -0.8,  0.9, 0.0,
    -0.8,  0.7, 0.0,
    0.8,  0.7, 0.0,
    -0.8,  0.9, 0.0,
    0.8,  0.9, 0.0,
    0.8,  0.7, 0.0,

    -0.65,  0.7, 0.0,
    -0.65, -0.2, 0.0,
    -0.35, -0.2, 0.0,
    -0.65, 0.7, 0.0,
    -0.35, 0.7, 0.0,
    -0.35, -0.2, 0.0,

    -0.35,  0.4, 0.0,
    -0.35,  0.1, 0.0,
    -0.2,  0.1, 0.0,
    -0.2,  0.4, 0.0,
    -0.2,  0.1, 0.0,
    -0.35,  0.4, 0.0,

    0.65,  0.7, 0.0,
    0.65, -0.2, 0.0,
    0.35, -0.2, 0.0,
    0.65, 0.7, 0.0,
    0.35, 0.7, 0.0,
    0.35, -0.2, 0.0,

    0.35,  0.4, 0.0,
    0.35,  0.1, 0.0,
    0.2,  0.1, 0.0,
    0.2,  0.4, 0.0,
    0.2,  0.1, 0.0,
    0.35,  0.4, 0.0,

    
//  Lower Part
//  The Left Part and the Right Part Will Oscillate in Horizontal and Vertical Directions Respectively
    -0.65 + offset * 2, -0.25 + offset, 0.0,
    -0.65 + offset * 2,  -0.35 + offset, 0.0,
    -0.55 + offset * 2,  -0.35 + offset, 0.0,
    -0.55 + offset * 2, -0.35 + offset, 0.0,
    -0.55 + offset * 2, -0.25 + offset, 0.0,
    -0.65 + offset * 2, -0.25 + offset, 0.0,
    -0.65 + offset * 2, -0.35 + offset, 0.0,
    -0.55 + offset * 2, -0.35 + offset, 0.0,
    -0.55 + offset * 2, -0.45 + offset, 0.0,

    -0.45 + offset * 2, -0.25 + offset, 0.0,
    -0.45 + offset * 2, -0.55 + offset, 0.0,
    -0.35 + offset * 2, -0.55 + offset, 0.0,
    -0.35 + offset * 2, -0.55 + offset, 0.0,
    -0.35 + offset * 2, -0.25 + offset, 0.0,
    -0.45 + offset * 2, -0.25 + offset, 0.0,
    -0.45 + offset * 2, -0.55 + offset, 0.0,
    -0.35 + offset * 2, -0.55 + offset, 0.0,
    -0.35 + offset * 2, -0.65 + offset, 0.0,

    -0.25 + offset * 2, -0.25 + offset, 0.0,
    -0.25 + offset * 2, -0.75 + offset, 0.0,
    -0.15 + offset * 2, -0.75 + offset, 0.0,
    -0.15 + offset * 2, -0.75 + offset, 0.0,
    -0.15 + offset * 2, -0.25 + offset, 0.0,
    -0.25 + offset * 2, -0.25 + offset, 0.0,
    -0.25 + offset * 2, -0.75 + offset, 0.0,
    -0.15 + offset * 2, -0.75 + offset, 0.0,
    -0.15 + offset * 2, -0.85 + offset, 0.0,

    0.65 - offset * 2, -0.25 + offset, 0.0,
    0.65 - offset * 2,  -0.35 + offset, 0.0,
    0.55 - offset * 2,  -0.35 + offset, 0.0,
    0.55 - offset * 2, -0.35 + offset, 0.0,
    0.55 - offset * 2, -0.25 + offset, 0.0,
    0.65 - offset * 2, -0.25 + offset, 0.0,
    0.65 - offset * 2, -0.35 + offset, 0.0,
    0.55 - offset * 2, -0.35 + offset, 0.0,
    0.55 - offset * 2, -0.45 + offset, 0.0,

    0.45 - offset * 2, -0.25 + offset, 0.0,
    0.45 - offset * 2, -0.55 + offset, 0.0,
    0.35 - offset * 2, -0.55 + offset, 0.0,
    0.35 - offset * 2, -0.55 + offset, 0.0,
    0.35 - offset * 2, -0.25 + offset, 0.0,
    0.45 - offset * 2, -0.25 + offset, 0.0,
    0.45 - offset * 2, -0.55 + offset, 0.0,
    0.35 - offset * 2, -0.55 + offset, 0.0,
    0.35 - offset * 2, -0.65 + offset, 0.0,

    0.25 - offset * 2, -0.25 + offset, 0.0,
    0.25 - offset * 2, -0.75 + offset, 0.0,
    0.15 - offset * 2, -0.75 + offset, 0.0,
    0.15 - offset * 2, -0.75 + offset, 0.0,
    0.15 - offset * 2, -0.25 + offset, 0.0,
    0.25 - offset * 2, -0.25 + offset, 0.0,
    0.25 - offset * 2, -0.75 + offset, 0.0,
    0.15 - offset * 2, -0.75 + offset, 0.0,
    0.15 - offset * 2, -0.85 + offset, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 84;
}

/**
 * Startup function called from html code to start program.
 */
function startup() {
//  Initialize the Canvas
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
//  Start Animation
  tick();
}

/**
 * Tick called for every animation frame.
 */
function tick() {
    requestAnimFrame(tick);
//  Draw the Image for Every Frame
    draw();
    animate();
}
