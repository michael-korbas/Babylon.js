var BABYLON;
(function (BABYLON) {
    var GeometryTrigger = (function () {
        function GeometryTrigger() {
        }
        GeometryTrigger.GetTriggerForLabel = function (label) {
            for (var index = 0; index < this._registeredTriggers.length; index++) {
                var trigger = this._registeredTriggers[index];

                if (trigger.label.indexOf(label) !== -1) {
                    var clone = {};
                    for (var i in trigger) {
                        if (trigger.hasOwnProperty(i))
                            clone[i] = trigger[i];
                    }

                    return clone;
                }
            }

            throw new Error("No trigger found for the label: " + label);
        };

        GeometryTrigger.RegisterTrigger = function (trigger) {
            trigger.label = trigger.label.toLowerCase();
            this._registeredTriggers.push(trigger);
        };
        GeometryTrigger._registeredTriggers = [];
        return GeometryTrigger;
    })();
    BABYLON.GeometryTrigger = GeometryTrigger;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=babylon.geometryTrigger.js.map
