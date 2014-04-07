"use strict";

var BABYLON = BABYLON || {};

(function () {
    BABYLON.Geometry = function (verticesData, indices, engine, mesh) {
        this._engine = engine;

        // indexBuffer
        this._indexBuffer = this._engine.createIndexBuffer(indices);

        // vertexBuffers
        var kinds = [];

        var positions = verticesData.positions;
        if (positions) {
            kinds[BABYLON.VertexBuffer.PositionKind] = {
                data: positions.data,
                updatable: positions.updatable
            };
        }

        var normals = verticesData.normals;
        if (normals) {
            kinds[BABYLON.VertexBuffer.NormalKind] = {
                data: normals.data,
                updatable: normals.updatable
            };
        }

        var uvs = verticesData.uvs;
        if (uvs) {
            kinds[BABYLON.VertexBuffer.UVKind] = {
                data: uvs.data,
                updatable: uvs.updatable
            };
        }

        var uvs2 = verticesData.uvs2;
        if (uvs2) {
            kinds[BABYLON.VertexBuffer.UV2Kind] = {
                data: uvs2.data,
                updatable: uvs2.updatable
            };
        }

        var colors = verticesData.colors;
        if (colors) {
            kinds[BABYLON.VertexBuffer.ColorKind] = {
                data: colors.data,
                updatable: colors.updatable
            };
        }

        var matricesIndices = verticesData.matricesIndices;
        if (matricesIndices) {
            kinds[BABYLON.VertexBuffer.MatricesIndicesKind] = {
                data: matricesIndices.data,
                updatable: matricesIndices.updatable
            };
        }

        var matricesWeights = verticesData.matricesWeights;
        if (matricesWeights) {
            kinds[BABYLON.VertexBuffer.MatricesWeightsKind] = {
                data: matricesWeights.data,
                updatable: matricesWeights.updatable
            };
        }

        this._vertexBuffers = {};
        for (var kind in kinds) {
            var kindObject = kinds[kind];
            this._vertexBuffers[kind] = new BABYLON.VertexBuffer(mesh, kindObject.data, kind, kindObject.updatable);
        }
        
        // applyToMesh
        if (mesh) {
            this.applyToMesh(mesh);
        }
    };

    BABYLON.Geometry.prototype.isVertexBufferUpdatable = function (kind) {
        var vertexBuffer = this._vertexBuffers[kind];
        return vertexBuffer && vertexBuffer.isUpdatable();
    };

    BABYLON.Geometry.prototype.getVertexBufferData = function (kind) {
        var vertexBuffer = this._vertexBuffers[kind];
        return vertexBuffer && vertexBuffer.getData();
    };

    BABYLON.Geometry.prototype.getVertexBufferStrideSize = function (kind) {
        var vertexBuffer = this._vertexBuffers[kind];
        return vertexBuffer && vertexBuffer.getStrideSize();
    };

    BABYLON.Geometry.prototype.updateVertexBuffer = function (kind, data) {
        var vertexBuffer = this._vertexBuffers[kind];
        return vertexBuffer && vertexBuffer.update(data);
    };

    BABYLON.Geometry.prototype.disposeVertexBuffer = function (kind) {
        var vertexBuffer = this._vertexBuffers[kind];
        return vertexBuffer && vertexBuffer.dispose();
    };

    BABYLON.Geometry.prototype.dispose = function () {
        this._engine._releaseBuffer(this._indexBuffer);

        for (var kind in this._vertexBuffers) {
            this.disposeVertexBuffer(kind).dispose();
        }
    };

    BABYLON.Geometry.prototype.applyToMesh = function (mesh) {
        if (mesh._indexBuffer) {
            mesh.getScene().getEngine()._releaseBuffer(mesh._indexBuffer);
        }

        mesh._indexBuffer = this._indexBuffer;
        this._indexBuffer.references++;
        
        mesh._vertexBuffers = mesh._vertexBuffers || {};

        for (var kind in this._vertexBuffers) {
            if (mesh._vertexBuffers[kind]) {
                mesh._vertexBuffers[kind].dispose();
            }

            mesh._vertexBuffers[kind] = this._vertexBuffers[kind];
            this._vertexBuffers[kind]._buffer.references++;

            if (kind === BABYLON.VertexBuffer.PositionKind) {
                mesh._resetPointsArrayCache();

                var stride = this._vertexBuffers[kind].getStrideSize();
                var data = this._vertexBuffers[kind].getData();
                mesh._totalVertices = data.length / stride;

                var extend = BABYLON.Tools.ExtractMinAndMax(data, 0, mesh._totalVertices);
                mesh._boundingInfo = new BABYLON.BoundingInfo(extend.minimum, extend.maximum);

                mesh._createGlobalSubMesh();
            }
        }

        this._meshes.push(mesh);
    };
})();