module BABYLON {
    export class PostProcessRenderPipeline {
        private _engine: Engine;

        private _renderEffects: PostProcessRenderEffect[];
        private _renderEffectsForIsolatedPass: PostProcessRenderEffect[];

        private _cameras: Camera[];

        // private
        public _name: string;

        private static PASS_EFFECT_NAME: string = "passEffect";
        private static PASS_SAMPLER_NAME: string = "passSampler";

        constructor(engine: Engine, name: string) {
            this._engine = engine;
            this._name = name;

            this._renderEffects = [];
            this._renderEffectsForIsolatedPass = [];

            this._cameras = [];
        }

        public addEffect(renderEffect: PostProcessRenderEffect): void {
            this._renderEffects[renderEffect._name] = renderEffect;
        }

        public enableEffect(renderEffectName: string, cameras: Camera);
        public enableEffect(renderEffectName: string, cameras: Camera[]);
        public enableEffect(renderEffectName: string, cameras: any): void {
            var renderEffects = this._renderEffects[renderEffectName];

            if (!renderEffects) {
                return;
            }

            renderEffects.enable(Tools.MakeArray(cameras || this._cameras));
        }

        public disableEffect(renderEffectName: string, cameras: Camera);
        public disableEffect(renderEffectName: string, cameras: Camera[]);
        public disableEffect(renderEffectName: string, cameras): void {
            var renderEffects = this._renderEffects[renderEffectName];

            if (!renderEffects) {
                return;
            }

            renderEffects.disable(Tools.MakeArray(cameras || this._cameras));
        }

        public attachCameras(cameras: Camera, unique: boolean);
        public attachCameras(cameras: Camera[], unique: boolean);
        public attachCameras(cameras: any, unique: boolean): void {
            var _cam = Tools.MakeArray(cameras || this._cameras);

            var indicesToDelete = [];

            for (var i = 0; i < _cam.length; i++) {
                var camera = _cam[i];
                var cameraName = camera.name;

                if (this._cameras.indexOf(camera) === -1) {
                    this._cameras[cameraName] = camera;
                }
                else if (unique) {
                    indicesToDelete.push(i);
                }
            }

            for (var i = 0; i < indicesToDelete.length; i++) {
                cameras.splice(indicesToDelete[i], 1);
            }

            for (var renderEffectName in this._renderEffects) {
                this._renderEffects[renderEffectName]._attachCameras(_cam);
            }
        }

        // todo
        public detachCameras(cameras): void {
            cameras = Tools.MakeArray(cameras || this._cameras);

            for (var renderEffectName in this._renderEffects) {
                this._renderEffects[renderEffectName]._detachCameras(cameras);
            }

            for (var i = 0; i < cameras.length; i++) {
                this._cameras.splice(this._cameras.indexOf(cameras[i]), 1);
            }
        }

        public enableDisplayOnlyPass(passName, cameras): void {
            cameras = Tools.MakeArray(cameras || this._cameras);

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
                this._renderEffectsForIsolatedPass[cameras[i].name] = this._renderEffectsForIsolatedPass[cameras[i].name] || new PostProcessRenderEffect(this._engine, PostProcessRenderPipeline.PASS_EFFECT_NAME, "BABYLON.DisplayPassPostProcess", 1.0, null, null);
                this._renderEffectsForIsolatedPass[cameras[i].name].emptyPasses();
                this._renderEffectsForIsolatedPass[cameras[i].name].addPass(pass);
                this._renderEffectsForIsolatedPass[cameras[i].name]._attachCameras(cameras[i]);
            }
        }

        public disableDisplayOnlyPass(cameras): void {
            cameras = Tools.MakeArray(cameras || this._cameras);

            for (var i = 0; i < cameras.length; i++) {
                this._renderEffectsForIsolatedPass[cameras[i].name] = this._renderEffectsForIsolatedPass[cameras[i].name] || new PostProcessRenderEffect(this._engine, PostProcessRenderPipeline.PASS_EFFECT_NAME, "BABYLON.DisplayPassPostProcess", 1.0, null, null);
                this._renderEffectsForIsolatedPass[cameras[i].name]._disable(cameras[i]);
            }

            for (var renderEffectName in this._renderEffects) {
                this._renderEffects[renderEffectName]._enable(cameras);
            }
        }

        public _update(): void {
            for (var renderEffectName in this._renderEffects) {
                this._renderEffects[renderEffectName]._update();
            }

            for (var i = 0; i < this._cameras.length; i++) {
                if (this._renderEffectsForIsolatedPass[this._cameras[i].name]) {
                    this._renderEffectsForIsolatedPass[this._cameras[i].name]._update();
                }
            }
        }
    }
}