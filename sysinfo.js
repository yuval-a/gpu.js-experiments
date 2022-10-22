const process = require("node:process");
const { execFile } = require('node:child_process');

function stringIt(obj) {
    return JSON.stringify(obj, null, 4);
}

function sysInfo() {
    const information = 
    `
    * CPU architecture: ${process.arch}.
    * Process platform: ${process.platform}.
    * Process release:  ${stringIt(process.release)}.
    * Process versions: ${stringIt(process.versions)}.
    `;
    // Experimental state: * Process active resources: ${process.getActiveResourcesInfo()}.

    /* Not needed:
    * Process report: ${stringIt(process.report)}.
    * Process env: ${stringIt(process.env)}.
    * Process resource usage: ${stringIt(process.resourceUsage())}.
    * Process configuration: ${stringIt(process.config)}.
    */
    console.log (information);
}

function gpuInfo() {
    const OSs = {
        "freebsd": "mac",
        "openbsd": "mac",
        "aix": "ibm",
        "darwin": "linux",
        "sunos": "solaris",
        "win32": "windows"
     };
    const os = OSs[process.platform];

    let gpuInfoProcessName, gpuInfoProcessArgs;

    switch (os) {
        case "mac":     gpuInfoProcessName = "system_profiler | grep GeForce"; break;
        case "linux":   gpuInfoProcessName = "lshw -C display"; break;
        case "windows": gpuInfoProcessName = "wmic"; gpuInfoProcessArgs = ["path", "win32_VideoController", "get", "name"]; break;
    }

    return new Promise( (resolve, reject)=> {
        execFile(gpuInfoProcessName, gpuInfoProcessArgs, (error, stdout, stderr)=> {
            if (error) reject(error);
            resolve(stdout.replace('Name', ""));
        });
    });
}

module.exports = {
   sysInfo, gpuInfo
};
