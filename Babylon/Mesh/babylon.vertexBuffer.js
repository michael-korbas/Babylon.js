"use strict";

var BABYLON = BABYLON || {};

(function () {
    BABYLON.VertexBuffer = function (engine, data, kind, updatable, postponeInternalCreation) {
        if (engine instanceof BABYLON.Mesh) { // old versions of BABYLON.VertexBuffer accepted 'mesh' instead of 'engine'
            this._engine = mesh.getScene().getEngine();
        }
        else {
            this._engine = engine;
        }
        
        this._updatable = updatable;
        
        this._data = data;

        if (!postponeInternalCreation) { // by default
            this.create();
        }

        this._kind = kind;

        switch (kind) {
            case BABYLON.VertexBuffer.PositionKind:
                this._strideSize = 3;
                break;
            case BABYLON.VertexBuffer.NormalKind:
                this._strideSize = 3;
                break;
            case BABYLON.VertexBuffer.UVKind:
                this._strideSize = 2;
                break;
            case BABYLON.VertexBuffer.UV2Kind:
                this._strideSize = 2;
                break;
            case BABYLON.VertexBuffer.ColorKind:
                this._strideSize = 3;
                break;
            case BABYLON.VertexBuffer.MatricesIndicesKind:
                this._strideSize = 4;
                break;
            case BABYLON.VertexBuffer.MatricesWeightsKind:
                this._strideSize = 4;
                break;
        }
    };

    // Properties
    BABYLON.VertexBuffer.prototype.isUpdatable = function () {
        return this._updatable;
    };

    BABYLON.VertexBuffer.prototype.getData = function() {
        return this._data;
    };
    
    BABYLON.VertexBuffer.prototype.getStrideSize = function () {
        return this._strideSize;
    };
    
    // Methods
    BABYLON.VertexBuffer.prototype.create = function (data) {
        if (!data && this._buffer) {
            return; // nothing to do
        }

        data = data || this._data;

        if (!this._buffer) { // create buffer
            if (this._updatable) {
                this._buffer = this._engine.createDynamicVertexBuffer(data.length * 4);
            } else {
                this._buffer = this._engine.createVertexBuffer(data);
            }
        }

        if (this._updatable) { // update buffer
            this._engine.updateDynamicVertexBuffer(this._buffer, data);
            this._data = data;
        }
    };

    BABYLON.VertexBuffer.prototype.update = function (data) {
        this.create(data);
    };

    BABYLON.VertexBuffer.prototype.dispose = function() {
        if (!this._buffer) {
            return;
        }
        if (this._engine._releaseBuffer(this._buffer)) {
            this._buffer = null;
        }
    }; 
        
    // Enums
    BABYLON.VertexBuffer.PositionKind           = "position";
    BABYLON.VertexBuffer.NormalKind             = "normal";
    BABYLON.VertexBuffer.UVKind                 = "uv";
    BABYLON.VertexBuffer.UV2Kind                = "uv2";
    BABYLON.VertexBuffer.ColorKind              = "color";
    BABYLON.VertexBuffer.MatricesIndicesKind    = "matricesIndices";
    BABYLON.VertexBuffer.MatricesWeightsKind    = "matricesWeights";
})();