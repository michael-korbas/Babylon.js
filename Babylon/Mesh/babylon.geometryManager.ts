module BABYLON {
    export class GeometryManager {
        public _mesh: Mesh;

        public _triggers = [];

        public _geometries: Geometry[] = [];
        public _activeGeometryLevelIndex: number = -1;

        public _activeLevel: number = -1;

        constructor(mesh: Mesh) {
            this._mesh = mesh;

            if (mesh._geometry != null) {
                var geometry = mesh._geometry;

                this._geometries.push(geometry);

                this.setActiveLevel(geometry.level);
            }
        }

        public addTrigger(trigger): void {
            this._triggers.push(trigger);
        }

        public addGeometryLevel(id, vertexData, updatable, level): void {
            var engine = this._mesh.getScene().getEngine();

            this._geometries.push(new Geometry(id, engine, vertexData, updatable, level));

            if (this._activeGeometryLevelIndex !== -1) {
                return;
            }

            this._activeGeometryLevelIndex = 0;
            this._activeLevel = level;
        }

        public getGeometry(level): Geometry {
            if (level === null) {
                return this._geometries[this._activeGeometryLevelIndex];
            }

            var gl = this._getGeometry(level);

            if (!gl) {
                return null;
            }

            return gl.element;
        }

        public setGeometry(geometry: Geometry, level: number) {
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
        }

        public setActiveLevel(level): void {
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
        }

        private _getGeometry(level) {
            var geometryLevel = Tools.Grep(
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
        }
    }
}