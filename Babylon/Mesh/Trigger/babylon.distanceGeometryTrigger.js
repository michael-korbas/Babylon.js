"use strict";

var BABYLON = BABYLON || {};

(function () {
    BABYLON.GeometryTrigger.distance = "distance";

    BABYLON.GeometryTrigger.RegisterTrigger({
        label: BABYLON.GeometryTrigger.distance,
        run: function (scene, mesh) {
            if(!this.ranges) {
                return;
            }

            var activeCamera = scene.activeCamera;
            var boundingBox = mesh.getBoundingInfo().boundingBox;
            var geometryManager = mesh._geometryManager;

            var distance = BABYLON.Vector3.Distance(activeCamera.position, boundingBox.center);

            for (var i = 0; i < this.ranges.length; i++) {
                var range = this.ranges[i];
                
                if (distance > range.start && distance < range.end) {
                    geometryManager.setActiveLevel(range.level);
                    break;
                }
            }
        },
        addRange: function (start, end, level) {
            if (!this.ranges) {
                this.ranges = [];
            }

            this.ranges.push({ start: start, end: end, level: level });
        }
    });
})();