var BABYLON;
(function (BABYLON) {
    var GeometryManager = (function () {
        function GeometryManager(mesh) {
            this._triggers = [];
            this._geometries = [];
            this._activeGeometryLevelIndex = -1;
            this._activeLevel = -1;
            this._mesh = mesh;

            if (mesh._geometry != null) {
                var geometry = mesh._geometry;

                this._geometries.push(geometry);

                this.setActiveLevel(geometry.level);
            }
        }
        GeometryManager.prototype.addTrigger = function (trigger) {
            this._triggers.push(trigger);
        };

        GeometryManager.prototype.addGeometryLevel = function (id, vertexData, updatable, level) {
            var engine = this._mesh.getScene().getEngine();

            this._geometries.push(new BABYLON.Geometry(id, engine, vertexData, updatable, level));

            if (this._activeGeometryLevelIndex !== -1) {
                return;
            }

            this._activeGeometryLevelIndex = 0;
            this._activeLevel = level;
        };

        GeometryManager.prototype.getGeometry = function (level) {
            if (level === null) {
                return this._geometries[this._activeGeometryLevelIndex];
            }

            var gl = this._getGeometry(level);

            if (!gl) {
                return null;
            }

            return gl.element;
        };

        GeometryManager.prototype.setGeometry = function (geometry, level) {
            if (level === null) {
                if (this._activeGeometryLevelIndex !== -1) {
                    this._geometries[this._activeGeometryLevelIndex] = geometry;
                }
                return;
            }

            var geometryLevel = this._getGeometry(level);

            if (!geometryLevel) {
                return;
            }

            geometryLevel[0].element = geometry;
        };

        GeometryManager.prototype.setActiveLevel = function (level) {
            if (level === this._activeLevel) {
                return;
            }

            var geometryLevel = this._getGeometry(level);

            if (!geometryLevel) {
                return;
            }

            this._activeGeometryLevelIndex = geometryLevel.index;
            this._activeLevel = level;

            geometryLevel.element.applyToMesh(this._mesh);
        };

        GeometryManager.prototype._getGeometry = function (level) {
            var geometryLevel = BABYLON.Tools.Grep(this._geometries, function (geometryLevel) {
                if (geometryLevel.level === level) {
                    return true;
                }
                return false;
            }, true);

            return geometryLevel.length ? geometryLevel[0] : null;
        };
        return GeometryManager;
    })();
    BABYLON.GeometryManager = GeometryManager;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=babylon.geometryManager.js.map
