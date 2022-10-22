
## System details:
```
OS: Microsoft Windows 11 Home, version 10.0.22000 Build 22000.
System: LENOVO_MT_81X3_BU_idea_FM_IdeaPad Flex 5 15IIL05.
RAM: 16 GB.
CPU: Intel(R) Core(TM) i7-1065G7 CPU @ 1.30GHz, 1498 Mhz, 4 Core(s), 8 Logical Processor(s).
GPU: NVIDIA GeForce MX330. 384 CUDA cores, 2GB GDDR5, 64-Bit, 56 GB/s.
```
### Test Results

#### Fibonacci
```
cpuFibonacci x 6,935 ops/sec ±1.53% (89 runs sampled)
cpuFibonacciPromises x 2,419 ops/sec ±6.65% (33 runs sampled)
gpuFibonacci x 9,146 ops/sec ±1.17% (87 runs sampled)
Fastest is gpuFibonacci
```

#### Clone
```
cpuClone x 200,876 ops/sec ±2.32% (86 runs sampled)
gpuClone x 70,774 ops/sec ±2.05% (86 runs sampled)
Fastest is cpuClone
```
#### Monty Hall
```
cpuMontyHall x 1,589 ops/sec ±2.49% (84 runs sampled)
gpuMontyHall x 3,340 ops/sec ±2.75% (78 runs sampled)
Fastest is gpuMontyHall
```

<hr>

