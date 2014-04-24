"use strict";

var BABYLON = BABYLON || {};

// mesh.getVertexStrideSize?
// when we set vertices for a data, do we want to do it for all others "clones"?
// how to be sure that engine is the same than the one of mesh? (constructor, CreateBox)
// submeshes are not shared

(function () {
    BABYLON.Geometry = function (id, engine, vertexData, updatable, mesh) {
        this.id = id;
        this._engine = engine;
        this._meshes = [];

        // vertexData
        if (vertexData) {
            this.setAllVerticesData(vertexData, updatable);
        }
        else {
            this._totalVertices = 0;
            this._indices = [];
        }

        // applyToMesh
        if (mesh) {
            this.applyToMesh(mesh);
        }
    };

    BABYLON.Geometry.prototype.setAllVerticesData = function (vertexData, updatable) {
        vertexData.applyToGeometry(this, updatable);
    };

    BABYLON.Geometry.prototype.setVerticesData = function (data, kind, updatable) {
        this._vertexBuffers = this._vertexBuffers || {};

        if (this._vertexBuffers[kind]) {
            this._vertexBuffers[kind].dispose();
        }

        this._vertexBuffers[kind] = new BABYLON.VertexBuffer(this._engine, data, kind, updatable, this._meshes.length === 0);

        if (kind === BABYLON.VertexBuffer.PositionKind) {
            var stride = this._vertexBuffers[kind].getStrideSize();

            this._totalVertices = data.length / stride;

            var extend = BABYLON.Tools.ExtractMinAndMax(data, 0, this._totalVertices);

            var meshes = this._meshes;
            var numOfMeshes = meshes.length;

            for (var index = 0; index < numOfMeshes; index++) {
                var mesh = meshes[index];
                mesh._resetPointsArrayCache();
                mesh._boundingInfo = new BABYLON.BoundingInfo(extend.minimum, extend.maximum);
                mesh._createGlobalSubMesh();
            }
        }
    };

    BABYLON.Geometry.prototype.updateVerticesData = function (kind, data, updateExtends) {
        var vertexBuffer = this.getVertexBuffer(kind);

        if (!vertexBuffer) {
            return;
        }

        vertexBuffer.update(data);

        if (kind === BABYLON.VertexBuffer.PositionKind) {

            var extend;

            if (updateExtends) {
                var stride = vertexBuffer.getStrideSize();
                this._totalVertices = data.length / stride;
                extend = BABYLON.Tools.ExtractMinAndMax(data, 0, this._totalVertices);
            }

            var meshes = this._meshes;
            var numOfMeshes = meshes.length;

            for (var index = 0; index < numOfMeshes; index++) {
                var mesh = meshes[index];
                mesh._resetPointsArrayCache();
                if (updateExtends) {
                    mesh._boundingInfo = new BABYLON.BoundingInfo(extend.minimum, extend.maximum);
                }
            }
        }
    };

    BABYLON.Geometry.prototype.getTotalVertices = function () {
        return this._totalVertices;
    };

    BABYLON.Geometry.prototype.getVerticesData = function (kind) {
        return this.getVertexBuffer(kind).getData();
    };

    BABYLON.Geometry.prototype.getVertexBuffer = function (kind) {
        return this._vertexBuffers[kind];
    };

    BABYLON.Geometry.prototype.isVerticesDataPresent = function (kind) {
        if (!this._vertexBuffers) {
            if (this._delayInfo) {
                return this._delayInfo.indexOf(kind) !== -1;
            }
            return false;
        }
        return this._vertexBuffers[kind] !== undefined;
    };

    BABYLON.Geometry.prototype.getVerticesDataKinds = function () {
        var result = [];
        if (!this._vertexBuffers && this._delayInfo) {
            for (var kind in this._delayInfo) {
                result.push(kind);
            }
        } else {
            for (var kind in this._vertexBuffers) {
                result.push(kind);
            }
        }

        return result;
    };

    BABYLON.Geometry.prototype.setIndices = function (indices) {
        if (this._indexBuffer) {
            this._engine._releaseBuffer(this._indexBuffer);
        }

        this._indices = indices;
        if (this._meshes.length !== 0 && this._indices) {
            this._indexBuffer = this._engine.createIndexBuffer(this._indices);
        }

        var meshes = this._meshes;
        var numOfMeshes = meshes.length;

        for (var index = 0; index < numOfMeshes; index++) {
            meshes[index]._createGlobalSubMesh();
        }
    };

    BABYLON.Geometry.prototype.getTotalIndices = function () {
        return this._indices.length;
    };

    BABYLON.Geometry.prototype.getIndices = function () {
        return this._indices;
    };

    BABYLON.Geometry.prototype.releaseForMesh = function (mesh) {
        var meshes = this._meshes;
        var index = meshes.indexOf(mesh);

        if (index === -1) {
            return;
        }

        for (var kind in this._vertexBuffers) {
            this._vertexBuffers[kind].dispose();
        }

        if (this._indexBuffer && this._engine._releaseBuffer(this._indexBuffer)) {
            this._indexBuffer = null;
        }

        meshes.splice(index, 1);

        mesh._geometry = null;
    };

    BABYLON.Geometry.prototype.applyToMesh = function (mesh) {
        var meshes = this._meshes;

        var index = meshes.indexOf(mesh);
        if (index !== -1) {
            return;
        }

        var previousGeometry = mesh._geometry;
        if (previousGeometry) {
            previousGeometry.releaseForMesh(mesh);
        }

        var numOfMeshes = meshes.length;

        // vertexBuffers
        for (var kind in this._vertexBuffers) {
            if (numOfMeshes === 0) {
                this._vertexBuffers[kind].create();
            }
            this._vertexBuffers[kind]._buffer.references = numOfMeshes + 1;
            
            if (kind === BABYLON.VertexBuffer.PositionKind) {
                mesh._resetPointsArrayCache();

                var extend = BABYLON.Tools.ExtractMinAndMax(this._vertexBuffers[kind].getData(), 0, this._totalVertices);
                mesh._boundingInfo = new BABYLON.BoundingInfo(extend.minimum, extend.maximum);

                mesh._createGlobalSubMesh();
            }
        }

        // indexBuffer
        if (numOfMeshes === 0 && this._indices) {
            this._indexBuffer = this._engine.createIndexBuffer(this._indices);
        }
        if (this._indexBuffer) {
            this._indexBuffer.references = numOfMeshes + 1;
        }

        meshes.push(mesh);

        mesh._geometry = this;
    };

    BABYLON.Geometry.prototype.dispose = function () {
        for (var index = 0; index < numOfMeshes; index++) {
            this.releaseForMesh(meshes[index]);
        }
        this._meshes = [];

        for (var kind in this._vertexBuffers) {
            this._vertexBuffers[kind].dispose();
        }
        this._vertexBuffers = [];
        this._totalVertices = 0;

        if (this._indexBuffer) {
            this._engine._releaseBuffer(this._indexBuffer);
        }
        this._indexBuffer = null;
        this._indices = [];
    };

    BABYLON.Geometry.prototype.copy = function (id) {
        var vertexData = new BABYLON.VertexData();
        vertexData.indices = this.getIndices();

        var updatable = false;
        var stopChecking = false;

        for (var kind in this._vertexBuffers) {
            vertexData.set(this.getVerticesData(kind), kind);
            
            if (!stopChecking) {
                updatable = this.getVertexBuffer(kind).isUpdatable();
                stopChecking = !updatable;
            }
        }

        return new BABYLON.Geometry(id, this._engine, vertexData, updatable, null);
    };

    // Statics
    // from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#answer-2117523
    // be aware Math.random() could cause collisions
    BABYLON.Geometry.RandomId = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    BABYLON.Geometry.ExtractFromMesh = function (mesh, id) {
        var geometry = mesh._geometry;

        if (!geometry) {
            return undefined;
        }

        return geometry.copy(id);
    };
})();