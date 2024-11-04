sap.ui.define([
	"sap/ui/core/Control",
    "com/smod/cardgame/cardgame/custom/Card"
], function(
	Control,
	Card
) {
	"use strict";

	return Control.extend("com.smod.cardgame.cardgame.custom.Board", {

        metadata: {
            properties: {
                difficulty: { type: "string", defaultValue: "easy", bindable: true },
            },
            aggregations: {
                cards: { type: "com.smod.cardgame.cardgame.custom.Card", multiple: true, singularName: "card"}
            }

        },

        init: function() {
            
            const sLibraryPath = jQuery.sap.getModulePath("com.smod.cardgame.cardgame");
            jQuery.sap.includeStyleSheet(sLibraryPath + "/css/style.css");
            this._generateBoard();
            
        },

        _generateBoard: function() {
            const difficultySettings = {
                easy: "grid-easy",
                medium: "grid-medium",
                hard: "grid-hard"
            };

            const settings = difficultySettings[this.getDifficulty()];
            this.removeStyleClass("grid-easy");
            this.removeStyleClass("grid-medium");
            this.removeStyleClass("grid-hard");
            this.addStyleClass(settings);
   

            // Mevcut kartları temizle
            this.removeAllCards();

            this.addStyleClass(`difficulty-${this.getDifficulty()}`);
        },
     
       
        
        renderer: function(oRm, oControl) {
            
            debugger;
            oRm.openStart("div", oControl); // <div
            oRm.class("pokemonBoard");
            oRm.class("cardBoard");
            oRm.openEnd();  // >
            
            oControl.getCards().forEach(function(card) {
                oRm.renderControl(card);
            });

            oRm.close("div"); // zdiv>
        }
        
	});
});