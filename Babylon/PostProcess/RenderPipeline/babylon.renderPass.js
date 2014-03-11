"use strict";

var BABYLON = BABYLON || {};

(function () {
	BABYLON.RenderPass = function RenderPass(scene, name, size, renderList, beforeRender, afterRender) {
		this._name = name;
		this._enabled = true;

		this._renderList = renderList;

		this._renderTexture = new BABYLON.RenderTargetTexture(name, size, scene);
		this.setRenderList(renderList);

		this._renderTexture.onBeforeRender = beforeRender;
		this._renderTexture.onAfterRender = afterRender;

		scene.customRenderTargets.push(this._renderTexture);
	};

	BABYLON.RenderPass.prototype.setRenderList = function (renderList) {
		this._renderTexture.renderList = renderList;
	};

	BABYLON.RenderPass.prototype.getRenderTexture = function () {
		return this._renderTexture;
	};

	BABYLON.RenderPass.prototype._update = function () {
		this.setRenderList(this._renderList);
	};
})();