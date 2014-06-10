var BABYLON;
(function (BABYLON) {
    var PostProcessRenderEffect = (function () {
        function PostProcessRenderEffect(engine, name, postProcessType, ratio, samplingMode, singleInstance) {
            this.name = name;
            this._engine = engine;
            this._name = name;
            this._postProcessType = postProcessType;
            this._ratio = ratio || 1.0;
            this._samplingMode = samplingMode || null;
            this._singleInstance = singleInstance || true;

            this._cameras = [];

            this._postProcesses = [];
            this._indicesForCamera = [];

            this._renderPasses = [];
            this._renderEffectAsPasses = [];

            this.parameters = function (effect) {
            };
        }
        PostProcessRenderEffect.GetInstance = function (engine, postProcessType, ratio, samplingMode) {
            var postProcess;
            var instance;
            var args = [];

            var parameters = PostProcessRenderEffect.GetParametersNames(postProcessType);
            for (var i = 0; i < parameters.length; i++) {
                switch (parameters[i]) {
                    case "name":
                        args[i] = postProcessType.toString();
                        break;
                    case "ratio":
                        args[i] = ratio;
                        break;
                    case "camera":
                        args[i] = null;
                        break;
                    case "samplingMode":
                        args[i] = samplingMode;
                        break;
                    case "engine":
                        args[i] = engine;
                        break;
                    case "reusable":
                        args[i] = true;
                        break;
                    default:
                        args[i] = null;
                        break;
                }
            }

            postProcess = function () {
            };
            postProcess.prototype = postProcessType.prototype;

            instance = new postProcess();
            postProcessType.apply(instance, args);

            return instance;
        };

        PostProcessRenderEffect.GetParametersNames = function (func) {
            var commentsRegex = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
            var functWithoutComments = eval(func).toString().replace(commentsRegex, '');

            var parameters = functWithoutComments.slice(functWithoutComments.indexOf('(') + 1, functWithoutComments.indexOf(')')).match(/([^\s,]+)/g);

            if (parameters === null)
                parameters = [];
            return parameters;
        };

        PostProcessRenderEffect.prototype._update = function () {
            for (var renderPassName in this._renderPasses) {
                this._renderPasses[renderPassName]._update();
            }
        };

        PostProcessRenderEffect.prototype.addPass = function (renderPass) {
            this._renderPasses[renderPass.name] = renderPass;

            this._linkParameters();
        };

        PostProcessRenderEffect.prototype.removePass = function (renderPass) {
            delete this._renderPasses[renderPass.name];

            this._linkParameters();
        };

        PostProcessRenderEffect.prototype.addRenderEffectAsPass = function (renderEffect) {
            this._renderEffectAsPasses[renderEffect.name] = renderEffect;

            this._linkParameters();
        };

        PostProcessRenderEffect.prototype.getPass = function (passName) {
            for (var renderPassName in this._renderPasses) {
                if (renderPassName === passName) {
                    return this._renderPasses[passName];
                }
            }
        };

        PostProcessRenderEffect.prototype.emptyPasses = function () {
            this._renderPasses.length = 0;

            this._linkParameters();
        };

        PostProcessRenderEffect.prototype.attachCameras = function (cameras) {
            var cameraKey;

            var _cam = BABYLON.Tools.MakeArray(cameras || this._cameras);

            for (var i = 0; i < _cam.length; i++) {
                var camera = _cam[i];
                var cameraName = camera.name;

                if (this._singleInstance) {
                    cameraKey = 0;
                } else {
                    cameraKey = cameraName;
                }

                this._postProcesses[cameraKey] = this._postProcesses[cameraKey] || PostProcessRenderEffect.GetInstance(this._engine, this._postProcessType, this._ratio, this._samplingMode);

                var index = camera.attachPostProcess(this._postProcesses[cameraKey]);

                if (this._indicesForCamera[cameraName] == null) {
                    this._indicesForCamera[cameraName] = [];
                }

                this._indicesForCamera[cameraName].push(index);

                if (this._cameras.indexOf(camera) == -1) {
                    this._cameras[cameraName] = camera;
                }

                for (var passName in this._renderPasses) {
                    this._renderPasses[passName]._incRefCount();
                }
            }

            this._linkParameters();
        };

        PostProcessRenderEffect.prototype.detachCameras = function (cameras) {
            var _cam = BABYLON.Tools.MakeArray(cameras || this._cameras);

            for (var i = 0; i < _cam.length; i++) {
                var camera = _cam[i];
                var cameraName = camera.Name;

                camera.detachPostProcess(this._postProcesses[this._singleInstance ? 0 : cameraName], this._indicesForCamera[cameraName]);

                var index = this._cameras.indexOf(cameraName);

                this._indicesForCamera.splice(index, 1);
                this._cameras.splice(index, 1);

                for (var passName in this._renderPasses) {
                    this._renderPasses[passName]._decRefCount();
                }
            }
        };

        PostProcessRenderEffect.prototype.enable = function (cameras) {
            cameras = BABYLON.Tools.MakeArray(cameras || this._cameras);

            for (var i = 0; i < cameras.length; i++) {
                for (var j = 0; j < this._indicesForCamera[cameras[i].name].length; j++) {
                    if (cameras[i]._postProcesses[this._indicesForCamera[cameras[i].name][j]] === undefined) {
                        if (this._singleInstance) {
                            cameras[i].attachPostProcess(this._postProcesses[0], this._indicesForCamera[cameras[i].name][j]);
                        } else {
                            cameras[i].attachPostProcess(this._postProcesses[cameras[i].name], this._indicesForCamera[cameras[i].name][j]);
                        }
                    }
                }

                for (var passName in this._renderPasses) {
                    this._renderPasses[passName]._incRefCount();
                }
            }
        };

        PostProcessRenderEffect.prototype.disable = function (cameras) {
            cameras = BABYLON.Tools.MakeArray(cameras || this._cameras);

            for (var i = 0; i < cameras.length; i++) {
                if (this._singleInstance) {
                    cameras[i].detachPostProcess(this._postProcesses[0], this._indicesForCamera[cameras[i].name]);
                } else {
                    cameras[i].detachPostProcess(this._postProcesses[cameras[i].name], this._indicesForCamera[cameras[i].name]);
                }

                for (var passName in this._renderPasses) {
                    this._renderPasses[passName]._decRefCount();
                }
            }
        };

        PostProcessRenderEffect.prototype.getPostProcess = function () {
            return this._postProcesses[0];
        };

        PostProcessRenderEffect.prototype._linkParameters = function () {
            var _this = this;
            for (var index in this._postProcesses) {
                this._postProcesses[index].onApply = function (effect) {
                    _this.parameters(effect);
                    _this._linkTextures(effect);
                };
            }
        };

        PostProcessRenderEffect.prototype._linkTextures = function (effect) {
            for (var renderPassName in this._renderPasses) {
                effect.setTexture(renderPassName, this._renderPasses[renderPassName].getRenderTexture());
            }

            for (var renderEffectName in this._renderEffectAsPasses) {
                effect.setTextureFromPostProcess(renderEffectName + "Sampler", this._renderEffectAsPasses[renderEffectName].getPostProcess());
            }
        };
        return PostProcessRenderEffect;
    })();
    BABYLON.PostProcessRenderEffect = PostProcessRenderEffect;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=babylon.postProcessRenderEffect.js.map
