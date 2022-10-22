const Benchmark = require('benchmark');

module.exports = (...tests)=> 
    new Promise( (resolve,reject)=> {
        
        let benchmark = new Benchmark.Suite;
        for (const test of tests) {
            benchmark = test.options ? 
            benchmark.add(test.name, test.func, test.options) : 
            benchmark.add(test.name, test.func);
        }
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
            resolve();
        })

        //console.dir (benchmark[2].fn, { depth: null });
        .run();
    });
