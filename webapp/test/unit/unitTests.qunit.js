/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comsmodcardgame/card-game/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
