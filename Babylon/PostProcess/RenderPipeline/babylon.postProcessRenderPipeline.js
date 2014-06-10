var BABYLON;
(function (BABYLON) {
    var PostProcessRenderPipeline = (function () {
        function PostProcessRenderPipeline(engine, name) {
            this._engine = engine;
            this._name = name;

            this._renderEffects = [];
            this._renderEffectsForIsolatedPass = [];

            this._cameras = [];
        }
        PostProcessRenderPipeline.prototype.addEffect = function (renderEffect) {
            this._renderEffects[renderEffect._name] = renderEffect;
        };

        PostProcessRenderPipeline.prototype.enableEffect = function (renderEffectName, cameras) {
            var renderEffects = this._renderEffects[renderEffectName];

            if (!renderEffects) {
                return;
            }

            renderEffects.enable(BABYLON.Tools.MakeArray(cameras || this._cameras));
        };

        PostProcessRenderPipeline.prototype.disableEffect = function (renderEffectName, cameras) {
            var renderEffects = this._renderEffects[renderEffectName];

            if (!renderEffects) {
                return;
            }

            renderEffects.disable(BABYLON.Tools.MakeArray(cameras || this._cameras));
        };

        PostProcessRenderPipeline.prototype.attachCameras = function (cameras, unique) {
            var _cam = BABYLON.Tools.MakeArray(cameras || this._cameras);

            var indicesToDelete = [];

            for (var i = 0; i < _cam.length; i++) {
                var camera = _cam[i];
                var cameraName = camera.name;

                if (this._cameras.indexOf(camera) === -1) {
                    this._cameras[cameraName] = camera;
                } else if (unique) {
                    indicesToDelete.push(i);
                }
            }

            for (var i = 0; i < indicesToDelete.length; i++) {
                cameras.splice(indicesToDelete[i], 1);
            }

            for (var renderEffectName in this._renderEffects) {
                this._renderEffects[renderEffectName]._attachCameras(_cam);
            }
        };

        // todo
        PostProcessRenderPipeline.prototype.detachCameras = function (cameras) {
            cameras = BABYLON.Tools.MakeArray(cameras || this._cameras);

            for (var renderEffectName in this._renderEffects) {
                this._renderEffects[renderEffectName]._detachCameras(cameras);
            }

            for (var i = 0; i < cameras.length; i++) {
                this._cameras.splice(this._cameras.indexOf(cameras[i]), 1);
            }
        };

        PostProcessRenderPipeline.prototype.enableDisplayOnlyPass = function (passName, cameras) {
            cameras = BABYLON.Tools.MakeArray(cameras || this._cameras);

            var pass = null;

            for (var renderEffectName in this._renderEffects) {
                pass = this._renderEffects[renderEffectName].getPass(passName);

                if (pass != null) {
                    break;
                }
            }

            if (pass == null) {
                return;
            }

            for (var renderEffectName in this._renderEffects) {
                this._renderEffects[renderEffectName]._disable(cameras);
            }

            pass._name = PostProcessRenderPipeline.PASS_SAMPLER_NAME;

            for (var i = 0; i < cameras.length; i++) {
                this._renderEffectsForIsolatedPass[cameras[i].name] = this._renderEffectsForIsolatedPass[cameras[i].name] || new BABYLON.PostProcessRenderEffect(this._engine, PostProcessRenderPipeline.PASS_EFFECT_NAME, "BABYLON.DisplayPassPostProcess", 1.0, null, null);
                this._renderEffectsForIsolatedPass[cameras[i].name].emptyPasses();
                this._renderEffectsForIsolatedPass[cameras[i].name].addPass(pass);
                this._renderEffectsForIsolatedPass[cameras[i].name]._attachCameras(cameras[i]);
            }
        };

        PostProcessRenderPipeline.prototype.disableDisplayOnlyPass = function (cameras) {
            cameras = BABYLON.Tools.MakeArray(cameras || this._cameras);

            for (var i = 0; i < cameras.length; i++) {
                this._renderEffectsForIsolatedPass[cameras[i].name] = this._renderEffectsForIsolatedPass[cameras[i].name] || new BABYLON.PostProcessRenderEffect(this._engine, PostProcessRenderPipeline.PASS_EFFECT_NAME, "BABYLON.DisplayPassPostProcess", 1.0, null, null);
                this._renderEffectsForIsolatedPass[cameras[i].name]._disable(cameras[i]);
            }

            for (var renderEffectName in this._renderEffects) {
                this._renderEffects[renderEffectName]._enable(cameras);
            }
        };

        PostProcessRenderPipeline.prototype._update = function () {
            for (var renderEffectName in this._renderEffects) {
                this._renderEffects[renderEffectName]._update();
            }

            for (var i = 0; i < this._cameras.length; i++) {
                if (this._renderEffectsForIsolatedPass[this._cameras[i].name]) {
                    this._renderEffectsForIsolatedPass[this._cameras[i].name]._update();
                }
            }
        };
        PostProcessRenderPipeline.PASS_EFFECT_NAME = "passEffect";
        PostProcessRenderPipeline.PASS_SAMPLER_NAME = "passSampler";
        return PostProcessRenderPipeline;
    })();
    BABYLON.PostProcessRenderPipeline = PostProcessRenderPipeline;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=babylon.postProcessRenderPipeline.js.map
