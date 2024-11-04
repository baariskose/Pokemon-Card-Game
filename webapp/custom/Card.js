sap.ui.define([
	"sap/ui/core/Control",
], function(
	Control
) {
	"use strict";

	return Control.extend("com.smod.cardgame.cardgame.custom.Card", {
        metadata: {
            properties: {
                cardId: { type: "string",  bindable: true },
                name: { type: "string" ,  bindable: true},
                imageUrl: { type: "string" ,  bindable: true},
                flipped: { type: "boolean", defaultValue: false,  bindable: true },
                matched: { type: "boolean", defaultValue: false,  bindable: true },
                clickable : { type: "boolean", defaultValue: true,  bindable: true }
            },
            events: {
                press: {}
            }
        },
        init: function() {
            const sLibraryPath = jQuery.sap.getModulePath("com.smod.cardgame.cardgame");
            jQuery.sap.includeStyleSheet(sLibraryPath + "/css/style.css");
        },

        onclick: function(oEvent) {
           
            this.firePress();
        },
        renderer: function(oRm, oControl) {
            oRm.openStart("div", oControl);
            oRm.class("pokemonCard");

            if (oControl.getFlipped() || oControl.getMatched()) {
                oRm.class("flipped");
            }
           
            oRm.openEnd();

            if (oControl.getFlipped() || oControl.getMatched()) {
                oRm.openStart("img");
                oRm.attr("src", oControl.getImageUrl());
                oRm.attr("alt", oControl.getName());
                oRm.class("pokemonImage");
                oRm.class("sapUiSmallMargin");
                oRm.openEnd();
                oRm.close("img");
            } else {
                oRm.openStart("span");
                oRm.class("pokemonBack");
                oRm.class("sapUiSmallMargin");
                oRm.openEnd();
                oRm.text("؟");
                oRm.close("span");
            }

            oRm.close("div");
        },
        
	});
});