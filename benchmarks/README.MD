# Tests
The following tests currently exist:

## Fibonacci
This generates a Fibonacci series, using the formula: <br>
`Math.round(GR ** n / SQRT5)`
Where:
* `GR` is: `(1 + Math.sqrt(5)) / 2` - "the Golden Ratio.
* `SQRT5` is: `Math.sqrt(5)`
* and `n` is the index of the item in the series.

## Clone
This simply takes an array as an input - and outputs a new identical "clone" of it.

## [The Monty Hall Problem](https://en.wikipedia.org/wiki/Monty_Hall_problem) Simulation
This is a simulation that demonstrates this world renowned statistical problem, each iteration runs the following stages:
1. Create an array of 3 "doors", where 2 of them randomly has a "goat", and one randomly has a "car".
2. The "player" randomly selects one of the doors.
3. The "host" reveals one of the two doors that the player didn't choose, that has a goat in it.
4. The "player" switches to the remaining door. If it has a car in it - `true` is returned.

This experiment runs for many iterations, saving the results in an array. The expected results is for the array to have around 66% of `true` values.
