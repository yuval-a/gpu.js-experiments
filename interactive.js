const process = require("node:process");
const benchmarks = require("./benchmarks");
const { sysInfo, gpuInfo } = require('./sysinfo');
const stdin  = process.stdin;
const stdout = process.stdout;


function selection(prompt, selections) {

    function getSelected(data) {
        let selected = Number(data.toString().trim());
        if (isNaN(selected) || selected < 1 || selected > selections.length) {
            console.log (" Please select an available option from above");
            stdout.write (' >');
            return null;
        }
        return selected;
    }

    return new Promise( (resolve)=> {

        function onInput(data) {
            let selected = getSelected(data);
            if (selected) {
                stdin.off('data', onInput);
                resolve (selected);
            }
        }
    
        console.log();
        console.log (prompt);
        let count = 1;
        selections.forEach(selection=>
            console.log(` ${count++}. ${selection}`)    
        );
        stdout.write (' >');
        stdin.on('data', onInput);
        
    });
}


(async function() {
    let answer = null;
    while (answer != 3) {
        answer = await selection(" Select an option:", ["See system information.", "See Graphic card(s) information.", "Run CPU vs. GPU benchmarks.", "Exit."]);
        switch (answer) {
            case 1: sysInfo(); break;
            case 2: console.log (await gpuInfo()); break; // <- Need to enhance this
            case 4: process.exit();
        }
    }

    answer = undefined; 
    let selections = [...benchmarks.slice(1).map(b=> b.name), "Exit."];

    do {
        answer = await selection(" Select benchmark to run:", selections);
        if (answer != selections.length) {
            console.log (` \r\n Running ${benchmarks[answer].name} benchmark tests... \r\n`);
            await benchmarks[answer].run();
        }
    }
    while (answer != selections.length);

    process.exit();
})();