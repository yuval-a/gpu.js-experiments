const { GPU } = require('gpu.js');
const gpu = new GPU();

function run() {

    const GR = (1 + Math.sqrt(5)) / 2;
    const SQRT5 = Math.sqrt(5);
    const SIZE = 2000;

    const gpuFibonacci = gpu.createKernel(
        function () {
            return Math.round(this.constants.GR ** this.thread.x / this.constants.SQRT5);
        },
        {
            output: [SIZE],
            constants: {
                GR,
                SQRT5
            }
        }
    );

    const cpuFibonacci = function () {
        let fib = Array(SIZE);
        for (let n = 1; n < SIZE; n++) {
            fib[n] = (Math.round(GR ** n / SQRT5));
        }
        return fib;
    }


    const cpuFibonacciPromises = function () {
        return new Promise((resolve) => {
            Promise.all(fibPromises)
                .then(fib => resolve(fib));
        });
    };

    const benchmark = require('../doBenchmark');
    return benchmark(
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
        // Do not pass the GPU kernel function directly - because Benchmark.js
        // calls toString - which GPU.JS returns an earlier version of the function that
        // only returns the "innerKernel function"
        {
            name: "gpuFibonacci",
            func: () => gpuFibonacci()
        }
    );
};


module.exports = {
    name: "Fibonacci",
    run
}
