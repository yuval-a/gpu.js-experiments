const { GPU } = require('gpu.js');
const gpu = new GPU();
const Benchmark = require('benchmark');
const benchmark = new Benchmark.Suite;

/*
 * This test takes an array as an input - and simply return the value of each item in the array from the GPU kernel function.
 * It is a kind of "array clone", to test if it's faster than using the spread operator to clone in the CPU(?)
 */


function run() {

    // When pipeline is true, the output is returned as a Texture - 
    // and is supposed to "stay" in the GPU memory. Read GPU.JS documentation for more information
    const uploadToGpu = gpu.createKernel(
        function(input) { return input[this.thread.x]; },
        {
            dynamicOutput: true,
            pipeline: true
        }
    )

    const kernelClone = gpu.createKernel(
        function(inputArr) { return inputArr[this.thread.x]; },
        {
            dynamicOutput: true,
            pipeline: true
        }
    )


    let arr = Array(10000)
    .fill(null)
    .map(_=> Math.floor(Math.random() * 100 + 1));

    uploadToGpu.setOutput([ arr.length ]);
    kernelClone.setOutput([ arr.length ]);

    // Return as texture
    let arrTexture = uploadToGpu([arr]);

    const benchmark = require('../doBenchmark');
    return benchmark(
        {
            name: "cpuClone",
            func: ()=> [...arr]
        },    
        {
            name: "gpuClone",
            func: ()=> kernelClone(arrTexture)
        }
    );
}

module.exports = {
    name: "Clone",
    run
}