/// <reference path="../../../dist/preview release/babylon.d.ts"/>

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var BABYLON;
(function (BABYLON) {
    /**
     * DigitalRainFontTexture is the helper class used to easily create your digital rain font texture.
     *
     * It basically takes care rendering the font front the given font size to a texture.
     * This is used later on in the postprocess.
     */
    var DigitalRainFontTexture = (function (_super) {
        __extends(DigitalRainFontTexture, _super);
        /**
         * Create a new instance of the Digital Rain FontTexture class
         * @param name the name of the texture
         * @param font the font to use, use the W3C CSS notation
         * @param text the caracter set to use in the rendering.
         * @param scene the scene that owns the texture
         */
        function DigitalRainFontTexture(name, font, text, scene) {
            _super.call(this, scene);
            this.name = name;
            this._text == text;
            this._font == font;
            this.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
            this.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
            //this.anisotropicFilteringLevel = 1;
            // Get the font specific info.
            var maxCharHeight = this.getFontHeight(font);
            var maxCharWidth = this.getFontWidth(font);
            this._charSize = Math.max(maxCharHeight.height, maxCharWidth);
            // This is an approximate size, but should always be able to fit at least the maxCharCount.
            var textureWidth = this._charSize;
            var textureHeight = Math.ceil(this._charSize * text.length);
            // Create the texture that will store the font characters.
            this._texture = scene.getEngine().createDynamicTexture(textureWidth, textureHeight, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
            //scene.getEngine().setclamp
            var textureSize = this.getSize();
            // Create a canvas with the final size: the one matching the texture.
            var canvas = document.createElement("canvas");
            canvas.width = textureSize.width;
            canvas.height = textureSize.height;
            var context = canvas.getContext("2d");
            context.textBaseline = "top";
            context.font = font;
            context.fillStyle = "white";
            context.imageSmoothingEnabled = false;
            // Sets the text in the texture.
            for (var i = 0; i < text.length; i++) {
                context.fillText(text[i], 0, i * this._charSize - maxCharHeight.offset);
            }
            // Flush the text in the dynamic texture.
            this.getScene().getEngine().updateDynamicTexture(this._texture, canvas, false, true);
        }
        Object.defineProperty(DigitalRainFontTexture.prototype, "charSize", {
            /**
             * Gets the size of one char in the texture (each char fits in size * size space in the texture).
             */
            get: function () {
                return this._charSize;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Gets the max char width of a font.
         * @param font the font to use, use the W3C CSS notation
         * @return the max char width
         */
        DigitalRainFontTexture.prototype.getFontWidth = function (font) {
            var fontDraw = document.createElement("canvas");
            var ctx = fontDraw.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.font = font;
            return ctx.measureText("W").width;
        };
        // More info here: https://videlais.com/2014/03/16/the-many-and-varied-problems-with-measuring-font-height-for-html5-canvas/
        /**
         * Gets the max char height of a font.
         * @param font the font to use, use the W3C CSS notation
         * @return the max char height
         */
        DigitalRainFontTexture.prototype.getFontHeight = function (font) {
            var fontDraw = document.createElement("canvas");
            var ctx = fontDraw.getContext('2d');
            ctx.fillRect(0, 0, fontDraw.width, fontDraw.height);
            ctx.textBaseline = 'top';
            ctx.fillStyle = 'white';
            ctx.font = font;
            ctx.fillText('jH|', 0, 0);
            var pixels = ctx.getImageData(0, 0, fontDraw.width, fontDraw.height).data;
            var start = -1;
            var end = -1;
            for (var row = 0; row < fontDraw.height; row++) {
                for (var column = 0; column < fontDraw.width; column++) {
                    var index = (row * fontDraw.width + column) * 4;
                    if (pixels[index] === 0) {
                        if (column === fontDraw.width - 1 && start !== -1) {
                            end = row;
                            row = fontDraw.height;
                            break;
                        }
                        continue;
                    }
                    else {
                        if (start === -1) {
                            start = row;
                        }
                        break;
                    }
                }
            }
            return { height: (end - start) + 1, offset: start - 1 };
        };
        /**
         * Clones the current DigitalRainFontTexture.
         * @return the clone of the texture.
         */
        DigitalRainFontTexture.prototype.clone = function () {
            return new DigitalRainFontTexture(this.name, this._font, this._text, this.getScene());
        };
        /**
         * Parses a json object representing the texture and returns an instance of it.
         * @param source the source JSON representation
         * @param scene the scene to create the texture for
         * @return the parsed texture
         */
        DigitalRainFontTexture.Parse = function (source, scene) {
            var texture = BABYLON.SerializationHelper.Parse(function () { return new DigitalRainFontTexture(source.name, source.font, source.text, scene); }, source, scene, null);
            return texture;
        };
        __decorate([
            BABYLON.serialize("font")
        ], DigitalRainFontTexture.prototype, "_font");
        __decorate([
            BABYLON.serialize("text")
        ], DigitalRainFontTexture.prototype, "_text");
        return DigitalRainFontTexture;
    })(BABYLON.BaseTexture);
    BABYLON.DigitalRainFontTexture = DigitalRainFontTexture;
    /**
     * DigitalRainPostProcess helps rendering everithing in digital rain.
     *
     * Simmply add it to your scene and let the nerd that lives in you have fun.
     * Example usage: var pp = new DigitalRainPostProcess("digitalRain", "20px Monospace", camera);
     */
    var DigitalRainPostProcess = (function (_super) {
        __extends(DigitalRainPostProcess, _super);
        /**
         * Instantiates a new Digital Rain Post Process.
         * @param name the name to give to the postprocess
         * @camera the camera to apply the post process to.
         * @param options can either be the font name or an option object following the IDigitalRainPostProcessOptions format
         */
        function DigitalRainPostProcess(name, camera, options) {
            var _this = this;
            _super.call(this, name, 'digitalrain', ['digitalRainFontInfos', 'digitalRainOptions', 'cosTimeZeroOne', 'matrixSpeed'], ['digitalRainFont'], {
                width: camera.getEngine().getRenderWidth(),
                height: camera.getEngine().getRenderHeight()
            }, camera, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, camera.getEngine(), true);
            /**
             * This defines the amount you want to mix the "tile" or caracter space colored in the digital rain.
             * This number is defined between 0 and 1;
             */
            this.mixToTile = 0;
            /**
             * This defines the amount you want to mix the normal rendering pass in the digital rain.
             * This number is defined between 0 and 1;
             */
            this.mixToNormal = 0;
            // Default values.
            var font = "15px Monospace";
            var characterSet = "古池や蛙飛び込む水の音ふるいけやかわずとびこむみずのおと初しぐれ猿も小蓑をほしげ也はつしぐれさるもこみのをほしげなり江戸の雨何石呑んだ時鳥えどのあめなんごくのんだほととぎす";
            // Use options.
            if (options) {
                if (typeof (options) === "string") {
                    font = options;
                }
                else {
                    font = options.font || font;
                    this.mixToTile = options.mixToTile || this.mixToTile;
                    this.mixToNormal = options.mixToNormal || this.mixToNormal;
                }
            }
            this._digitalRainFontTexture = new DigitalRainFontTexture(name, font, characterSet, camera.getScene());
            var textureSize = this._digitalRainFontTexture.getSize();
            var alpha = 0.0;
            var cosTimeZeroOne = 0.0;
            var matrix = new BABYLON.Matrix();
            for (var i = 0; i < 16; i++) {
                matrix.m[i] = Math.random();
            }
            this.onApply = function (effect) {
                effect.setTexture("digitalRainFont", _this._digitalRainFontTexture);
                effect.setFloat4("digitalRainFontInfos", _this._digitalRainFontTexture.charSize, characterSet.length, textureSize.width, textureSize.height);
                effect.setFloat4("digitalRainOptions", _this.width, _this.height, _this.mixToNormal, _this.mixToTile);
                effect.setMatrix("matrixSpeed", matrix);
                alpha += 0.003;
                cosTimeZeroOne = alpha;
                effect.setFloat('cosTimeZeroOne', cosTimeZeroOne);
            };
        }
        return DigitalRainPostProcess;
    })(BABYLON.PostProcess);
    BABYLON.DigitalRainPostProcess = DigitalRainPostProcess;
})(BABYLON || (BABYLON = {}));

BABYLON.Effect.ShadersStore['digitalrainPixelShader'] = "// Samplers.\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform sampler2D digitalRainFont;\n\n// Infos.\nuniform vec4 digitalRainFontInfos;\nuniform vec4 digitalRainOptions;\nuniform mat4 matrixSpeed;\n\nuniform float cosTimeZeroOne;\n\n// Transform color to luminance.\nfloat getLuminance(vec3 color)\n{\n    return clamp(dot(color, vec3(0.2126, 0.7152, 0.0722)), 0., 1.);\n}\n\n// Main functions.\nvoid main(void) \n{\n    float caracterSize = digitalRainFontInfos.x;\n    float numChar = digitalRainFontInfos.y - 1.0;\n    float fontx = digitalRainFontInfos.z;\n    float fonty = digitalRainFontInfos.w;\n\n    float screenx = digitalRainOptions.x;\n    float screeny = digitalRainOptions.y;\n    float ratio = screeny / fonty;\n\n    float columnx = float(floor((gl_FragCoord.x) / caracterSize));\n    float tileX = float(floor((gl_FragCoord.x) / caracterSize)) * caracterSize / screenx;\n    float tileY = float(floor((gl_FragCoord.y) / caracterSize)) * caracterSize / screeny;\n\n    vec2 tileUV = vec2(tileX, tileY);\n    vec4 tileColor = texture2D(textureSampler, tileUV);\n    vec4 baseColor = texture2D(textureSampler, vUV);\n\n    float tileLuminance = getLuminance(tileColor.rgb);\n    \n    int st = int(mod(columnx, 4.0));\n    float speed = cosTimeZeroOne * (sin(tileX * 314.5) * 0.5 + 0.6); \n    float x = float(mod(gl_FragCoord.x, caracterSize)) / fontx;\n    float y = float(mod(speed + gl_FragCoord.y / screeny, 1.0));\n    y *= ratio;\n\n    vec4 finalColor =  texture2D(digitalRainFont, vec2(x, 1.0 - y));\n    vec3 high = finalColor.rgb * (vec3(1.2,1.2,1.2) * pow(1.0 - y, 30.0));\n\n    finalColor.rgb *= vec3(pow(tileLuminance, 5.0), pow(tileLuminance, 1.5), pow(tileLuminance, 3.0));\n    finalColor.rgb += high;\n    finalColor.rgb = clamp(finalColor.rgb, 0., 1.);\n    finalColor.a = 1.0;\n\n    finalColor =  mix(finalColor, tileColor, digitalRainOptions.w);\n    finalColor =  mix(finalColor, baseColor, digitalRainOptions.z);\n\n    gl_FragColor = finalColor;\n}";
