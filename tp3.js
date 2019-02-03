function ShaderLoader(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/plain");
    xhr.send(null);
    if(xhr.status == 200 && xhr.readyState  == 4)
        return xhr.responseText;
    else {
        return;
    }
}

var canvas;
var canvasHeight;
var canvasWidth;

var gl;
var program;
var posPoints = [];
var tabColor = [];
var buffer, pos, size, color, bufferColor, perspective, rotation, translation;
var pMatrix = mat4.create();
var sMatrix = mat4.identity(mat4.create());
var tMatrix = mat4.identity(mat4.create());
var rMatrix = mat4.identity(mat4.create());

var rangeRotateX = document.querySelector("#rotateX");
var rangeRotateY = document.querySelector("#rotateY");
var rangeRotateZ = document.querySelector("#rotateZ");

var rangeTranslateX = document.querySelector("#translateX");
var rangeTranslateY = document.querySelector("#translateY");
var rangeTranslateZ = document.querySelector("#translateZ");

var rangeFOV = document.querySelector("#fov");

var currentPos = {
    rotateX : 0.00,
    rotateY : 0.00,
    rotateZ : 0.00,
    translateX : 0.00,
    translateY : 0.00,
    translateZ : 0.00,
    fov: 75
};

function initContext() {
    canvas = document.getElementById('dawin-webgl');
    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;
    gl = canvas.getContext('webgl');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    mat4.perspective(pMatrix, currentPos.fov * Math.PI / 180, canvasWidth/canvasHeight, 0.1, 100.0);
}

function initShaders() {
    var top = -0.5;
    var bottom = 0.5;
    var left = -0.5;
    var right = 0.5;
    var front = 0.5;
    var back = -0.5;
    color1 = Math.random();
    color2 = Math.random();
    color3 = Math.random();
    color4 = Math.random();
    color5 = Math.random();
    color6 = Math.random();
    color7 = Math.random();
    posPoints = [
                        top, left, back,
                        bottom, left, back,
                        top, right, back,

                        bottom, right, back,
                        bottom, left, back,
                        top, right, back,

                        bottom, right, front,
                        top, right, front,
                        top, right, back,

                        bottom, right, front,
                        top, right, back,
                        bottom, right, back,

                        top, left, front,
                        bottom, left, front,
                        top, left, back,

                        top, left, back,
                        bottom, left, back,
                        bottom, left, front,

                        top, left, front,
                        top, right, back,
                        top, right, front,

                        top, left, front,
                        top, right, back,
                        top, left, back,

                        bottom, right, front,
                        bottom, left, front,
                        bottom, right, back,

                        bottom, right, back,
                        bottom, left, front,
                        bottom, left, back,

                        top, left, front,
                        bottom, left, front,
                        top, right, front,

                        bottom, right, front,
                        top, right, front,
                        bottom, left, front
    ];
    tabColor = [
                    color1, color3, color5, 1,
                    color1, color3, color5, 1,
                    color1, color3, color5, 1,

                    color1, color3, color5, 1,
                    color1, color3, color5, 1,
                    color1, color3, color5, 1,

                    color2, color3, color4, 1,
                    color2, color3, color4, 1,
                    color2, color3, color4, 1,

                    color2, color3, color4, 1,
                    color2, color3, color4, 1,
                    color2, color3, color4, 1,

                    color1, color5, color7, 1,
                    color1, color5, color7, 1,
                    color1, color5, color7, 1,

                    color1, color5, color7, 1,
                    color1, color5, color7, 1,
                    color1, color5, color7, 1,

                    color2, color1, color6, 1,
                    color2, color1, color6, 1,
                    color2, color1, color6, 1,

                    color2, color1, color6, 1,
                    color2, color1, color6, 1,
                    color2, color1, color6, 1,

                    color3, color6, color2, 1,
                    color3, color6, color2, 1,
                    color3, color6, color2, 1,

                    color3, color6, color2, 1,
                    color3, color6, color2, 1,
                    color3, color6, color2, 1,

                    color4, color1, color7, 1,
                    color4, color1, color7, 1,
                    color4, color1, color7, 1,

                    color4, color1, color7, 1,
                    color4, color1, color7, 1,
                    color4, color1, color7, 1
    ];

    var fragmentSource = ShaderLoader('fragment.glsl');
    var vertexSource = ShaderLoader('vertex.glsl');

    var fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment, fragmentSource);
    gl.compileShader(fragment);

    var vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, vertexSource);
    gl.compileShader(vertex);

    gl.getShaderParameter(fragment, gl.COMPILE_STATUS);
    gl.getShaderParameter(vertex, gl.COMPILE_STATUS);

    program = gl.createProgram();
    gl.attachShader(program, fragment);
    gl.attachShader(program, vertex);
    gl.linkProgram(program);
    gl.useProgram(program);

}

function initEvents() {

    rangeRotateX.addEventListener("input", (e) => {
        mat4.rotateX(rMatrix, rMatrix, +(e.target.valueAsNumber - currentPos.rotateX).toFixed(2));
        currentPos.rotateX = e.target.valueAsNumber;
        refreshBuffers();
    });

    rangeRotateY.addEventListener("input", (e) => {
        mat4.rotateY(rMatrix, rMatrix, +(e.target.valueAsNumber - currentPos.rotateY).toFixed(2));
        currentPos.rotateY = e.target.valueAsNumber;
        refreshBuffers();
    });

    rangeRotateZ.addEventListener("input", (e) => {
        mat4.rotateZ(rMatrix, rMatrix, +(e.target.valueAsNumber - currentPos.rotateZ).toFixed(2));
        currentPos.rotateZ = e.target.valueAsNumber;
        refreshBuffers();
    });

    rangeTranslateX.addEventListener("input", (e) => {
        mat4.translate(tMatrix, tMatrix, [0, +(e.target.valueAsNumber - currentPos.translateX).toFixed(2), 0]);
        currentPos.translateX = e.target.valueAsNumber;
        refreshBuffers();
    });

    rangeTranslateY.addEventListener("input", (e) => {
        mat4.translate(tMatrix, tMatrix, [+(e.target.valueAsNumber - currentPos.translateY).toFixed(2), 0, 0]);
        currentPos.translateY = e.target.valueAsNumber;
        refreshBuffers();
    });

    rangeTranslateZ.addEventListener("input", (e) => {
        mat4.translate(tMatrix, tMatrix, [0, 0, +(e.target.valueAsNumber - currentPos.translateZ).toFixed(2)]);
        currentPos.translateZ = e.target.valueAsNumber;
        refreshBuffers();
    });

    rangeFOV.addEventListener("input", (e) => {
        mat4.perspective(pMatrix, e.target.valueAsNumber * Math.PI / 180, canvasWidth/canvasHeight, 0.1, 100.0);
        mat4.translate(pMatrix, pMatrix, [0, 0, -2]);
        currentPos.fov = e.target.valueAsNumber;
        refreshBuffers();
    });

    document.querySelector("#reset").addEventListener('click', () => {
        console.log(currentPos);
        resetPosition();
    })
}
function rotationY(rotation){
    mat4.rotateY(rMatrix, rMatrix, (((rotation - 50) / 10) - currentPos).toFixed(2));
    currentPos = ((rotation - 50) / 10);
}

function initBuffers() {
    buffer = gl.createBuffer();
    bufferColor = gl.createBuffer();
    pos = gl.getAttribLocation(program, "position");
    color = gl.getAttribLocation(program, "color");
    perspective = gl.getUniformLocation(program, "perspective");
    translation = gl.getUniformLocation(program, "translation");
    rotation = gl.getUniformLocation(program, "rotation");
    size = 3;

    gl.enableVertexAttribArray(pos);
    gl.enableVertexAttribArray(color);
    mat4.translate(pMatrix, pMatrix, [0, 0, -2]);

    refreshBuffers()
}

function refreshBuffers() {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posPoints), gl.STATIC_DRAW)
    gl.vertexAttribPointer(pos, size, gl.FLOAT, true, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tabColor), gl.STATIC_DRAW)
    gl.vertexAttribPointer(color, 4, gl.FLOAT, true, 0, 0);
    gl.uniformMatrix4fv(translation, false, tMatrix);
    gl.uniformMatrix4fv(rotation, false, rMatrix);
    gl.uniformMatrix4fv(perspective, false, pMatrix);
    draw();
}

function resetPosition(){
    mat4.rotateZ(rMatrix, rMatrix, -currentPos.rotateZ)
    mat4.rotateY(rMatrix, rMatrix, -currentPos.rotateY)
    mat4.rotateX(rMatrix, rMatrix, -currentPos.rotateX)
    mat4.translate(tMatrix, tMatrix, [-currentPos.translateX, -currentPos.translateY, -currentPos.translateZ]);
    currentPos.rotateX = 0.0;
    currentPos.rotateY = 0.0;
    currentPos.rotateZ = 0.0;
    currentPos.translateX = 0.0;
    currentPos.translateY = 0.0;
    currentPos.translateZ = 0.0;
    updateRange();
    refreshBuffers();
}

function updateRange(){
    rangeRotateX.value = currentPos.rotateX;
    rangeRotateY.value = currentPos.rotateY;
    rangeRotateZ.value = currentPos.rotateZ;
    rangeTranslateX.value = currentPos.translateX;
    rangeTranslateY.value = currentPos.translateY;
    rangeTranslateZ.value = currentPos.translateZ;
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, posPoints.length/size);
}


function main() {
    initContext();
    initShaders();
    initBuffers();
    initAttributes();
    initEvents();
    draw();
}
