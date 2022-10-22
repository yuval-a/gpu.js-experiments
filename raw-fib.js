// This file experiments with running the GPU Fibonacci function that leaves out many unused
// GLSL functions that GPU.JS adds by default.

const gl = require('gl')(1, 1);

const glVariables0 = gl.getExtension('STACKGL_resize_drawingbuffer');
const glVariables1 = gl.getExtension('STACKGL_destroy_context');
const glVariables2 = gl.getExtension('OES_texture_float');
/*
const glVariables3 = gl.getExtension('OES_texture_float_linear');
const glVariables4 = gl.getExtension('OES_element_index_uint');
const glVariables5 = gl.getExtension('WEBGL_draw_buffers');
*/
gl.enable(gl.SCISSOR_TEST);
gl.viewport(0, 0, 46, 44);

// Vertex Shader
const glVertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(glVertexShader, 
`precision lowp float;
precision lowp int;
precision lowp sampler2D;

attribute vec2 aPos;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;
uniform vec2 ratio;

void main(void) {
  gl_Position = vec4((aPos + vec2(1)) * ratio + vec2(-1), 0, 1);
  vTexCoord = aTexCoord;
}`);
gl.compileShader(glVertexShader);

const glFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(glFragmentShader, 
`precision lowp float;
precision lowp int;
precision lowp sampler2D;

const int LOOP_MAX = 1000;
ivec3 uOutputDim = ivec3(2000, 1, 1);
ivec2 uTexSize = ivec2(46, 44);
varying vec2 vTexCoord;
ivec3 threadId;
int index;
 
vec4 _round(vec4 x) {
    return floor(x + 0.5);
}
  
float _round(float x) {
    return floor(x + 0.5);
}

vec2 integerMod(vec2 x, float y) {
    vec2 res = floor(mod(x, y));
    return res * step(1.0 - floor(y), -res);
}
  
vec3 integerMod(vec3 x, float y) {
    vec3 res = floor(mod(x, y));
    return res * step(1.0 - floor(y), -res);
}
  
vec4 integerMod(vec4 x, vec4 y) {
    vec4 res = floor(mod(x, y));
    return res * step(1.0 - floor(y), -res);
}
  
float integerMod(float x, float y) {
    float res = floor(mod(x, y));
    return res * (res > floor(y) - 1.0 ? 0.0 : 1.0);
}
  
int integerMod(int x, int y) {
    return x - (y * int(x / y));
}

float divWithIntCheck(float x, float y) {
    if (floor(x) == x && floor(y) == y && integerMod(x, y) == 0.0) {
      return float(int(x) / int(y));
    }
    return x / y;
}

ivec3 indexTo3D(int idx, ivec3 texDim) {
    int z = int(idx / (texDim.x * texDim.y));
    idx -= z * int(texDim.x * texDim.y);
    int y = int(idx / texDim.x);
    int x = int(integerMod(idx, texDim.x));
    return ivec3(x, y, z);
}

const float constants_GR = 1.618033988749895;
const float constants_SQRT5 = 2.23606797749979;
float kernelResult;
void kernel() {
    kernelResult = _round(divWithIntCheck(pow(constants_GR,float(threadId.x)), constants_SQRT5));
    return;
}
void main(void) {
    index = int(vTexCoord.s * float(uTexSize.x)) + int(vTexCoord.t * float(uTexSize.y)) * uTexSize.x;
    threadId = indexTo3D(index, uOutputDim);
    kernel();
    gl_FragData[0][0] = kernelResult;
}`);

gl.compileShader(glFragmentShader);
const glProgram = gl.createProgram();
gl.attachShader(glProgram, glVertexShader);
gl.attachShader(glProgram, glFragmentShader);
gl.linkProgram(glProgram);
const glFrameBuffer = gl.createFramebuffer();
const glBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
gl.bufferData(gl.ARRAY_BUFFER, 64, gl.STATIC_DRAW);
const gl8Array = new Float32Array([-1,-1,1,-1,-1,1,1,1]);
gl.bufferSubData(gl.ARRAY_BUFFER, 0, gl8Array);
const gl8Array2 = new Float32Array([0,0,1,0,0,1,1,1]);
gl.bufferSubData(gl.ARRAY_BUFFER, 32, gl8Array2);
const glAPos = gl.getAttribLocation(glProgram, 'aPos');
gl.enableVertexAttribArray(glAPos);
gl.vertexAttribPointer(glAPos, 2, gl.FLOAT, false, 0, 0);
const glATexCoordLocation = gl.getAttribLocation(glProgram, 'aTexCoord');
gl.enableVertexAttribArray(glATexCoordLocation);
gl.vertexAttribPointer(glATexCoordLocation, 2, gl.FLOAT, false, 0, 32);
gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer);
gl.useProgram(glProgram);
const glTexture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, glTexture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 46, 44, 0, gl.RGBA, gl.FLOAT, null);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glTexture, 0);
const glResizeDrawingBufferExt = gl.getExtension('STACKGL_resize_drawingbuffer');
glResizeDrawingBufferExt.resize(46, 44);

const renderOutput = function (array, width)  {
    const xResults = new Float32Array(width);
    let i = 0;
    for (let x = 0; x < width; x++) {
        xResults[x] = array[i];
        i += 4;
    }
    return xResults;
};

const fibKernel = function () {
    /** start setup uploads for kernel values **/
    /** end setup uploads for kernel values **/
    gl.useProgram(glProgram);
    gl.scissor(0, 0, 46, 44);
    const glUniformLocation = gl.getUniformLocation(glProgram, 'ratio');
    gl.uniform2f(glUniformLocation, 1, 1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    const glFullArray = new Float32Array(8096);
    gl.readPixels(0, 0, 46, 44, gl.RGBA, gl.FLOAT, glFullArray);   
    // gl.getExtension('STACKGL_destroy_context').destroy(); 
    return renderOutput(glFullArray, 2000);
};


const cpuFibonacci = function () {
    let fib = Array(SIZE);
    for (let n = 1; n < SIZE; n++) {
        fib[n] = (Math.round(GR ** n / SQRT5));
    }
    return fib;
}

const GR = (1 + Math.sqrt(5)) / 2;
const SQRT5 = Math.sqrt(5);
const SIZE = 2000;

let start, end, count = 10;

console.log ("GPU:")
while (count-- > 0) {
    start = process.hrtime.bigint();
    fibKernel();
    end = process.hrtime.bigint() - start;
    console.log ("Took " + end + " microseconds");
}

count = 10;
console.log ("CPU:");

while (count-- > 0) {
    start = process.hrtime.bigint();
    cpuFibonacci();
    end = process.hrtime.bigint() - start;
    console.log ("Took " + end + " microseconds");
}



// console.log (fibKernel());
/*
const benchmark = require('./doBenchmark');
return benchmark(
    /*
    {
        name: "cpuFibonacci",
        func: ()=> cpuFibonacci()
    },    
    {
        name: "cpuFibonacciPromises",
        func: cpuFibonacciPromises,
        options: {
            setup: function() {
                // Need to redefine consts here because of context issues
                const GR = (1 + Math.sqrt(5)) /2;
                const SQRT5 = Math.sqrt(5);
                const SIZE = 2000;
                const fibPromises = Array(SIZE);
                for (let n=1;n<SIZE;n++) {
                    fibPromises[n] = new Promise( (resolve)=> resolve(Math.round(GR ** n / SQRT5)));
                }
    
            },
            async: true
        }
    },
    {
        name: "gpuFibonacci",
        func: fibKernel
    }
);
*/

/*
const Benchmark = require('benchmark');
let benchmark = new Benchmark.Suite;
benchmark.add("fibGPURaw", fibKernel);
benchmark
.on('cycle', function(event) {
    console.log(String(event.target));
})
.on('error', function(event) {
    console.log ("Error with running tests: " + event.target.error);
    reject(event.target.error);
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
    // Turn off all listeners
    benchmark.off();
})
.run();
*/