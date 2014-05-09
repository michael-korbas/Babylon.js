"use strict";

var BABYLON = BABYLON || {};

(function () {
    BABYLON.GeometryManager = function (mesh) {
        this._mesh = mesh;

        this._triggers = [];

        this._geometries = [];
        this._activeGeometryLevelIndex = -1;

        this._activeLevel = -1;

        if (mesh._geometry != null) {
            var geometry = mesh._geometry;

            this._geometries.push(geometry);

            this.setActiveLevel(geometry.level);
        }
    };

    BABYLON.GeometryManager.prototype.addTrigger = function (trigger) {
        this._triggers.push(trigger);
    };

    BABYLON.GeometryManager.prototype.addGeometryLevel = function (id, vertexData, updatable, level) {
        var engine = mesh.getScene().getEngine();
        this._geometries.push(new BABYLON.Geometry(id, engine, vertexData, updatable, level));

        if (this._activeGeometryLevelIndex !== -1) {
            return;
        }

        this._activeGeometryLevelIndex = 0;
        this._activeLevel = level;
    };

    BABYLON.GeometryManager.prototype.getGeometry = function (level) {
        if (level === null) {
            return this._geometries[this._activeGeometryLevelIndex];
        }

        var gl = this._getGeometry(level);

        if (!gl) {
            return null;
        }

        return gl.element;
    };

    BABYLON.GeometryManager.prototype.setGeometry = function (geometry, level) {
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

    BABYLON.GeometryManager.prototype.setActiveLevel = function (level) {
        if (level === this._activeLevel) {
            return;
        }

        var geometryLevel = this._getGeometry(level);

        if (!geometryLevel) {
            return;
        }

        this._activeGeometryLevelIndex = geometryLevel.index;
        this._activeLevel = level;

        geometryLevel.element.removeMeshReference(this._mesh);
        geometryLevel.element.applyToMesh(this._mesh);
    };

    BABYLON.GeometryManager.prototype._getGeometry = function (level) {
        var geometryLevel = BABYLON.Tools.Grep(
            this._geometries,
            function (geometryLevel) {
                if (geometryLevel.level === level) {
                    return true;
                }
                return false;
            },
            true
        );

        return geometryLevel.length ? geometryLevel[0] : null;
    };
})();