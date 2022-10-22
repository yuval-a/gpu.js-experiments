# gpu.js-experiments

This repostiory is dedicated to experiments and benchmarks using the General Purpose Computing GPU Javascript library [GPU.JS](https://github.com/gpujs/gpu.js).

# Getting started
* After installing node modules using `npm install`, `GPU.JS`, and `Benchmark.JS` (the library used for benchmarking) will be installed.
* There is an interactive multiple option console "app", simply run: `node interactive` or `npm run start`.

# Tests
All tests are inside the `benchmarks` test.
Each test file is a `js` file which needs to expose two things:
* `name` - A name for a test
* `run` - A function that run all the tests.

## Adding new tests
If you add more tests, please follow this pattern.
Also, add a `require` to your `js` test file to the `module.exports` of the `index.js` file in the `benchmarks` folder.

## Test structures
The run function typically includes CPU versions of a function and GPU versions of it - then run benchmarkings for all of them, using `Benchmark.JS`.
There is a wrapper around `Benchmark.JS` in the root folder, called `doBenchmark` that makes running the benchmarking more easy, to run tests - require the module - which is a function that returns a Promise. The return a call to it, where the arguments are objects describing each test in the following manner:
```
{
  name: <Name of the test>,
  func: <The function to run>
  [options]: <Additional optional options to pass to Benchmark.js (e.g. `async: true`).
}
```

# General information about GPUs
A GPU (Graphical Processing Unit) is a processing unit mainly dedicated for making calculations and computations related to graphics - these are mostly matrix multiplications and vector calculations.
GPUs typically run programs that are called "Shaders". A popular high-level framework to upload and run these programs is `OpenGL` which can run a language called `GLSL` (GL Shading Language).
Javascript has an API called `WebGL` which exposes access to an OpenGL style library - and the ability to compile and run GLSL code on the GPU.
GPU.JS is a "wrapper" library around this API (and similar wrapper APIs for Node.JS) - that includes a Javascript parser - that can "translate" Javascript code into GLSL - and then run calculations in the GPU. GPUs typicially have many cores (sometimes hundreds, thousands or more, depending on the type and strength) - 
these allow for **real** parallel computations - which, in some cases can be faster than calculations done in the CPU. I say "in some cases" - because typically CPUs have "stronger" cores when it comes to "general" calculations, where the GPU cores are typicially more optimized for graphics related calculations.
There are more limitations existing for using the GPU cores, which are enforced by GPU.JS:

1. GPU cores can simultaniously run the same single function.
2. All cores must have the same dataset as an input (typically, an Array, but the items inside can be of different data types).
3. GPU.JS automatically uploads certain "translated" implementations of common JS operations in the form of GLSL functions, these are pretty limited though: 
for example when you write a GPU function using GPU.JS (called a "Kernel") - you can use arrays, but you cannot use most of the Array API functions JS natively have, etc.
For more information - read GPU.JS's documentation.

# Multiple GPUs
When I started expermenting with this, I didn't see any clear advantage in my benchmarks - after exploring the system I was on further - I realized my laptop has TWO GPUs - an Intel one and an NVidia GeForce. After experimenting - I realized how to make the GeForce my "default" GPU - and then my benchmarks started showing better results for the GPU function.

On Windows, to set your NVidia GPU as the default GPU - run `NVIDIA Control Panel`, go to `Manage 3D settings`, and in the `Global Settings`  tab, select it under `Preferred graphics processor` --- or you can select it explicitely for Node.JS under the `Program Settings` tab.
Once you run the NVIDIA Control Panel it also runs the NVIDIA GPU Activity widget in the widgets panel - which shows which programs (processes) currently use the GPU - so you can make sure NodeJS uses it when you run the benchmarks.

## Optimal GPU settings
I have experimented with the `Manage 3D Settings` in the NVIDIA Control Panel, and have found the following settings to yield the best results (most important ones are in bold):

* Image Sharpening: `Sharpenning Off`.
* **Ambient Occlusion: `Performance`**.
* Anisotropic Filtering: `Application-controlled`.
* Antialiasing - FXAA: `Off`.
* Antialiasing - Mode: `Application-controlled`.
* Antialiasing - Setting: `Application-controlled`.
* Antialiasing - Transparency: `8x (supersample)`.
* Background Application Max Frame Rate: `Off`.
* CUDA - GPUs: `All`.
* Low Latency Mode: `Ultra`.
* Max Frame Rate: `Off`.
* Multi-Frame Sampled AA (MFAA): `Off`.
* OpenGL rendering GPU: `<Choose the model of your strong GPU>`.
* **Power management mode: `Prefer maximum performance`**.
* Shader Cache: `On`
* Texture filtering - Anisotropic sample optimization: `Off`.
* Texture filtering - Negative LOD bias: `Allow`.
* **Texture filtering - Quality: `High performance`**.
* Texture filtering - Trilinear optimization: `Off`.
* Threaded optimization: `Auto`.
* **Triple buffering: `Off`**.
* **`Vertical sync: `Off`**.
* `Virtual Reality pre-rendered frames: 1`
* Prefer high performance: always
* Triple buffering off
* Vertical sync off

These are specific to the GPGPU experiments - so you might wanna set those in the Program Settings tab explicetely for NodeJS.

# Gotchas
When using Benchmark.JS - at first I put a reference to the GPU functions directly - and the measures showed a giant positive performance for them - this didn't make sense - after debugging and exploring I found out the Benchmark.JS tries to get the source for the function with a call to `toString` - and GPU.JS overrides it to return the source code that only prepares the GLSL code, and returns the "Kernel" function itself (which is a very fast operation) - so to actually run the Kernel function and measure it, make sure to run it inside an anonymous function in Benchmark.JS.

# Contributing
Feel free to contribute by pushing to new branches and creating PRs which I will review and merge accordingly.


