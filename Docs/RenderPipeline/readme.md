# How to use Render Pipeline

Renders pipelines allow you to create a chain of post processes and attach it to a camera.
A render pipeline can be managed by enabling and disabling some effect and displaying a specific pass for debugging.


[TOC]


## Base Render Pipeline

![](https://raw.githubusercontent.com/michael-korbas/Babylon.js/Docs/Docs/RenderPipeline/Resources/Architecture.png)

Renders Pipelines are composed of serval classes.

| Class | Description |
|--------|--------|
|**`BABYLON.RenderPipelineManager`**| Manage all pipelines, allow you to enable or disable an effect in a pipeline, display a pass of process for debugging.|
|**`BABYLON.RenderPipeline`**|Set of effects that can be orderer.|
|**`BABYLON.RenderEffect`**|A render effect is a smart postprocess who can manage there own instances itself.|
|**`BABYLON.RenderPass`**|A render pass is a render texture that you can use in differents renders effects.|

## Reference

### BABYLON.RenderPipelineManager

<center>`new BABYLON.RenderPipelineManager();`</center><br>


| Method | Description |
|--------|--------|
|**`RenderPipelineManager()`**|Create a new instance of RenderPipelineManager.|
|**`addPipeline(BABYLON.RenderPipeline renderPipeline)`**|Add a new pipeline to an instance of RenderPipelineManager.|
|**`attachCamerasToRenderPipeline(string renderPipelineName, BABYLON.Camera[] cameras, bool unique)`**|Attach a render pipeline to a list(or unique) of cameras|
|**`detachCamerasFromRenderPipeline(string renderPipelineName, BABYLON.Camera[] cameras)`**|Detach a render to a list(or unique) of cameras|
|**`enableEffectInPipeline(string renderPipelineName, string renderEffectName, BABYLON.Camera[] cameras)`**|Enable an effect in a pipeline for a list(or unique) of cameras|
|**`disableEffectInPipeline(string renderPipelineName, string renderEffectName, BABYLON.Camera[] cameras)`**|Disable an effect in a pipeline for a list(or unique) of cameras|
|**`enableDisplayOnlyPass(string renderPipelineName, string passName, BABYLON.Camera[] cameras)`**|Enable displaying of a specific pass used in a specific render pipeline, for a list(or unique) of cameras|
|**`disableDisplayOnlyPass(string renderPipelineName, string passName, BABYLON.Camera[] cameras)`**|Disable displaying of a specific pass used in a specific render pipeline, for a list(or unique) of cameras|
|**`update`**|Update all the pipelines.|


### BABYLON.RenderPipeline

<center>`new BABYLON.RenderPipeline(BABYLON.Engine engine, string name);`</center><br>

| Method | Description |
|--------|--------|
|**`RenderPipeline(BABYLON.Engine engine, string name)`**|Create a new instance of RenderPipeline.|
|**`addEffect(BABYLON.RenderEffect renderEffect)`**|Add a new render effect to the pipeline.|


### BABYLON.RenderEffect

<center>`new BABYLON.RenderEffect(BABYLON.Engine engine, string name, string postProcessType, number ratio, BABYLON.Texture.SAMPLING_MODE samplingMode, bool singleInstance);`</center><br>

| Method | Description |
|--------|--------|
|**`RenderEffect(BABYLON.Engine engine, string name, string postProcessType, number ratio, BABYLON.Texture.SAMPLING_MODE samplingMode, bool singleInstance)`**|Create a new instance of RenderEffect.|
|**`addPass(BABYLON.RenderPass)`**|Add a new pass to the effect.|
|**`addRenderEffectAsPass(BABYLON.RenderEffect)`**|Add a render effect as a pass.|
|**`removePass(BABYLON.RenderPass)`**|Delete a pass from the effect.|

<br>

| Attribut | Description |
|--------|--------|
|parameters|Callback used for passed extra parameters on a post process.|

### BABYLON.RenderPass

<center>`new BABYLON.RenderPass(BABYLON.Scene scene, string name, object size, BABYLON.Mesh[] renderList, function(){} beforeRender, function(){} afterRender)`</center><br>

| Method | Description |
|--------|--------|
|**`RenderPass(BABYLON.Scene scene, string name, object size, BABYLON.Mesh[] renderList, function(){} beforeRender, function(){} afterRender)`**|Create a new instance of Render Pass.|
|**`setRenderList(BABYLON.Mesh[] meshes)`**|Update the renderList.|


## Let's play with Render Pipeline


```
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);


var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 0, -10), scene);
var light0 = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 100, 100), scene);
var sphere = BABYLON.Mesh.CreateSphere("Sphere", 16, 3, scene);


var renderPipelineManager = new BABYLON.RenderPipelineManager();

var standardPipeline = new BABYLON.RenderPipeline(engine, "standardPipeline");

var blackAndWhiteEffect = new BABYLON.RenderEffect(engine, "blackAndWhite", "BABYLON.BlackAndWhitePostProcess", 1.0);
standardPipeline.addEffect(blackAndWhiteEffect);

var horizontalBlurEffect = new BABYLON.RenderEffect(engine, "horizontalBlurEffect", "BABYLON.BlurPostProcess", 1.0);
horizontalBlurEffect.parameters = function(effect) { 
	effect.setFloat2("screenSize", canvas.width, canvas.height);
    effect.setVector2("direction", new BABYLON.Vector2(1.0, 0.0));
    effect.setFloat("blurWidth", 2.0);
};
standardPipeline.addEffect(horizontalBlurEffect);

renderPipelineManager.attachCamerasToRenderPipeline("standardPipeline", camera);


var renderLoop = function () {
	renderPipelineManager.update();
	scene.render();
};

engine.runRenderLoop(renderLoop);
```