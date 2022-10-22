const { GPU } = require('gpu.js');
const gpu = new GPU();


// NOTE GPU.JS kernel's does not "know" about array functions like filter, and findIndex etc. We have to do everything "oldschool"
function run() {

    const NUM_OF_EXPERIMENTS = 10000;
    const GOAT = 0;
    const CAR = 1;

    const cpuResults = Array(NUM_OF_EXPERIMENTS).fill(-1);

    function cpuMontyHall() {
        function randomDoorIndex() {
            return Math.round(Math.random() * 2);
        }

        function randomDoors() {
            let doors = [GOAT, GOAT, GOAT];
            // Randomly select an index to put a car in
            doors[randomDoorIndex()] = CAR;
            return doors;
        }

        function didRevealCar() {
            let doors = randomDoors();
            // Player randomly select a door;
            let playerDoorIndex = randomDoorIndex();
            // Host reveals another non-selected door with a goat
            let revealedGoatDoorIndex = doors.findIndex( (doorContent, index)=> index !== playerDoorIndex && doorContent === GOAT );
            // Now the player switches to the third door - supposibly he have better chances to reveal a car
            let remainingDoorIndex = doors.findIndex ( (door, index)=> index !== playerDoorIndex && index !== revealedGoatDoorIndex );
            // If it's a car return 1
            return doors[remainingDoorIndex] === CAR ? 1 : 0;
        }

        for (let i=0;i<NUM_OF_EXPERIMENTS;i++)
            cpuResults[i] = didRevealCar();
    }

    const gpuMontyHall = gpu.createKernel(
    function() {

        function randomDoorIndex() {
            return Math.round(Math.random() * 2);
        }

        function randomDoors() {
            let doors = [this.constants.GOAT, this.constants.GOAT, this.constants.GOAT];
            // Randomly select an index to put a car in
            doors[randomDoorIndex()] = this.constants.CAR;
            return doors;
        }

        // Can't use arrow functions here, and also most of the Array functions, GPU.JS AST doesn't recognize...
        function didRevealCar() {
            let doors = randomDoors();
            // Player randomly select a door;
            let playerDoorIndex = randomDoorIndex();
            // Host reveals another non-selected door with a goat
            let revealedGoatDoorIndex = -1;
            for (let index=0; index<3; index++) {
                if (index !== playerDoorIndex && doors[index] === this.constants.GOAT) {
                   revealedGoatDoorIndex = index;
                   break;
                }
            }
            // Now the player switches to the third door - supposibly he have better chances to reveal a car
            // Can't use 'filter' for array, because GPU.JS doesn't support it
           let remainingDoorIndex = -1;
           for (let index=0; index<3; index++) {
               if (index !== playerDoorIndex && index !== revealedGoatDoorIndex) {
                   remainingDoorIndex = index;
                   break;
               }
           }
           // If it's a car return true
           return doors[remainingDoorIndex] === this.constants.CAR ? 1 : 0;
        }

        // Returns an array of 1s (player revealed a car after switching), and 0s (player did not reveal a car after switching).
        // There should be around 66% 1s of the total array length
        return didRevealCar();
    },
    {
        output: [ NUM_OF_EXPERIMENTS ],
        constants: {
            GOAT,
            CAR
        }
    });

    const benchmark = require('../doBenchmark');
    return benchmark(
        {
            name: "cpuMontyHall",
            func: ()=> cpuMontyHall()
        },
        {
            name: "gpuMontyHall",
            func: ()=> gpuMontyHall()
        }
    );
}

module.exports = {
    name: "Monty Hall Problem Simulation",
    run
}
