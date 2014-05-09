"use strict";

var BABYLON = BABYLON || {};

// mesh.getVertexStrideSize?
// when we set vertices for a data, do we want to do it for all others "clones"?
// how to be sure that engine is the same than the one of mesh? (constructor, CreateBox)
// submeshes are not shared and are reset when setting positions

(function () {
    BABYLON.Geometry = function (id, engine, vertexData, updatable, level) {
        this.id = id;
        this.level = level || 0;
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

        // must be done before setting vertexBuffers because of mesh._createGlobalSubMesh()
        mesh._geometry = this;

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
    };

    BABYLON.Geometry.prototype.removeMeshReference = function (mesh) {
        var index = this._meshes.indexOf(mesh);
        this._meshes.splice(index, 1);
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

    /////// Primitives //////////////////////////////////////////////

    BABYLON.Geometry.Primitives = {};

    /// Abstract class

    BABYLON.Geometry.Primitives._Primitive = function (id, engine, vertexData, canBeRegenerated, mesh) {
        this._beingRegenerated = true;
        this._canBeRegenerated = canBeRegenerated;
        BABYLON.Geometry.call(this, id, engine, vertexData, false, mesh); // updatable = false to be sure not to update vertices
        this._beingRegenerated = false;
    };

    BABYLON.Geometry.Primitives._Primitive.prototype = Object.create(BABYLON.Geometry.prototype);

    BABYLON.Geometry.Primitives._Primitive.prototype.regenerate = function () {
        if (!this._canBeRegenerated) {
            return;
        }
        this._beingRegenerated = true;
        this.setAllVerticesData(this._regenerateVertexData(), false);
        this._beingRegenerated = false;
    };

    BABYLON.Geometry.Primitives._Primitive.prototype.asNewGeometry = function (id) {
        return BABYLON.Geometry.prototype.copy.call(this, id);
    };

    // overrides
    BABYLON.Geometry.Primitives._Primitive.prototype.setAllVerticesData = function (vertexData, updatable) {
        if (!this._beingRegenerated) {
            return;
        }
        BABYLON.Geometry.prototype.setAllVerticesData.call(this, vertexData, false);
    };

    BABYLON.Geometry.Primitives._Primitive.prototype.setVerticesData = function (data, kind, updatable) {
        if (!this._beingRegenerated) {
            return;
        }
        BABYLON.Geometry.prototype.setVerticesData.call(this, data, kind, false);
    };

    // to override
    BABYLON.Geometry.Primitives._Primitive.prototype._regenerateVertexData = function () {
        throw new Error("Abstract method");
    };

    BABYLON.Geometry.Primitives._Primitive.prototype.copy = function (id) {
        throw new Error("Must be overriden in sub-classes.");
    };

    //// Box

    BABYLON.Geometry.Primitives.Box = function (id, engine, canBeRegenerated, size, mesh) {
        this.size = size;

        BABYLON.Geometry.Primitives._Primitive.call(this, id, engine, this._regenerateVertexData(), canBeRegenerated, mesh);
    };

    BABYLON.Geometry.Primitives.Box.prototype = Object.create(BABYLON.Geometry.Primitives._Primitive.prototype);

    BABYLON.Geometry.Primitives.Box.prototype._regenerateVertexData = function () {
        return BABYLON.VertexData.CreateBox(this.size); 
    };

    BABYLON.Geometry.Primitives.Box.prototype.copy = function (id) {
        return new BABYLON.Geometry.Primitives.Box(id, this._engine, this._canBeRegenerated, this.size, null);
    };

    //// Sphere

    BABYLON.Geometry.Primitives.Sphere = function (id, engine, canBeRegenerated, segments, diameter, mesh) {
        this.segments = segments;
        this.diameter = diameter;

        BABYLON.Geometry.Primitives._Primitive.call(this, id, engine, this._regenerateVertexData(), canBeRegenerated, mesh);
    };

    BABYLON.Geometry.Primitives.Sphere.prototype = Object.create(BABYLON.Geometry.Primitives._Primitive.prototype);

    BABYLON.Geometry.Primitives.Sphere.prototype._regenerateVertexData = function () {
        return BABYLON.VertexData.CreateSphere(this.segments, this.diameter);
    };

    BABYLON.Geometry.Primitives.Sphere.prototype.copy = function (id) {
        return new BABYLON.Geometry.Primitives.Sphere(id, this._engine, this._canBeRegenerated, this.segments, this.diameter, null);
    };

    //// Cylinder

    BABYLON.Geometry.Primitives.Cylinder = function (id, engine, canBeRegenerated, height, diameterTop, diameterBottom, tessellation, mesh) {
        this.height = height;
        this.diameterTop = diameterTop;
        this.diameterBottom = diameterBottom;
        this.tessellation = tessellation;

        BABYLON.Geometry.Primitives._Primitive.call(this, id, engine, this._regenerateVertexData(), canBeRegenerated, mesh);
    };

    BABYLON.Geometry.Primitives.Cylinder.prototype = Object.create(BABYLON.Geometry.Primitives._Primitive.prototype);

    BABYLON.Geometry.Primitives.Cylinder.prototype._regenerateVertexData = function () {
        return BABYLON.VertexData.CreateCylinder(this.height, this.diameterTop, this.diameterBottom, this.tessellation);
    };

    BABYLON.Geometry.Primitives.Cylinder.prototype.copy = function (id) {
        return new BABYLON.Geometry.Primitives.Cylinder(id, this._engine, this._canBeRegenerated, this.height, this.diameterTop, this.diameterBottom, this.tessellation, null);
    };

    //// Torus

    BABYLON.Geometry.Primitives.Torus = function (id, engine, canBeRegenerated, diameter, thickness, tessellation, mesh) {
        this.diameter = diameter;
        this.thickness = thickness;
        this.tessellation = tessellation;

        BABYLON.Geometry.Primitives._Primitive.call(this, id, engine, this._regenerateVertexData(), canBeRegenerated, mesh);
    };

    BABYLON.Geometry.Primitives.Torus.prototype = Object.create(BABYLON.Geometry.Primitives._Primitive.prototype);

    BABYLON.Geometry.Primitives.Torus.prototype._regenerateVertexData = function () {
        return BABYLON.VertexData.CreateTorus(this.diameter, this.thickness, this.tessellation);
    };

    BABYLON.Geometry.Primitives.Torus.prototype.copy = function (id) {
        return new BABYLON.Geometry.Primitives.Torus(id, this._engine, this._canBeRegenerated, this.diameter, this.thickness, this.tessellation, null);
    };

    //// Ground

    BABYLON.Geometry.Primitives.Ground = function (id, engine, canBeRegenerated, width, height, subdivisions, mesh) {
        this.width = width;
        this.height = height;
        this.subdivisions = subdivisions;

        BABYLON.Geometry.Primitives._Primitive.call(this, id, engine, this._regenerateVertexData(), canBeRegenerated, mesh);
    };

    BABYLON.Geometry.Primitives.Ground.prototype = Object.create(BABYLON.Geometry.Primitives._Primitive.prototype);

    BABYLON.Geometry.Primitives.Ground.prototype._regenerateVertexData = function () {
        return BABYLON.VertexData.CreateGround(this.width, this.height, this.subdivisions);
    };

    BABYLON.Geometry.Primitives.Ground.prototype.copy = function (id) {
        return new BABYLON.Geometry.Primitives.Ground(id, this._engine, this._canBeRegenerated, this.width, this.height, this.subdivisions, null);
    };

    //// Plane

    BABYLON.Geometry.Primitives.Plane = function (id, engine, canBeRegenerated, size, mesh) {
        this.size = size;

        BABYLON.Geometry.Primitives._Primitive.call(this, id, engine, this._regenerateVertexData(), canBeRegenerated, mesh);
    };

    BABYLON.Geometry.Primitives.Plane.prototype = Object.create(BABYLON.Geometry.Primitives._Primitive.prototype);

    BABYLON.Geometry.Primitives.Plane.prototype._regenerateVertexData = function () {
        return BABYLON.VertexData.CreatePlane(this.size);
    };

    BABYLON.Geometry.Primitives.Plane.prototype.copy = function (id) {
        return new BABYLON.Geometry.Primitives.Plane(id, this._engine, this._canBeRegenerated, this.size, null);
    };

    //// TorusKnot

    BABYLON.Geometry.Primitives.TorusKnot = function (id, engine, canBeRegenerated, radius, tube, radialSegments, tubularSegments, p, q, mesh) {
        this.radius = radius;
        this.tube = tube;
        this.radialSegments = radialSegments;
        this.tubularSegments = tubularSegments;
        this.p = p;
        this.q = q;

        BABYLON.Geometry.Primitives._Primitive.call(this, id, engine, this._regenerateVertexData(), canBeRegenerated, mesh);
    };

    BABYLON.Geometry.Primitives.TorusKnot.prototype = Object.create(BABYLON.Geometry.Primitives._Primitive.prototype);

    BABYLON.Geometry.Primitives.TorusKnot.prototype._regenerateVertexData = function () {
        return BABYLON.VertexData.CreateTorusKnot(this.radius, this.tube, this.radialSegments, this.tubularSegments, this.p, this.q);
    };

    BABYLON.Geometry.Primitives.TorusKnot.prototype.copy = function (id) {
        return new BABYLON.Geometry.Primitives.TorusKnot(id, this._engine, this._canBeRegenerated, this.radius, this.tube, this.radialSegments, this.tubularSegments, this.p, this.q, null);
    };
})();