sap.ui.define([
	"sap/ui/core/Control"
], function(
	Control
) {
	"use strict";

	return Control.extend("com.smod.cardgame.cardgame.custom.Timer", {

        metadata: {
            properties: {
              title: { bindable: "true", type: "string", defaultValue: "N/A" },
              hour: { bindable: "true", type: "int", defaultValue: 0 },
              minute: { bindable: "true", type: "int", defaultValue: 0 },
              second: { bindable: "true", type: "int", defaultValue: 0 },
              textValue: { bindable: "true", type: "string", defaultValue: "N/A" },
              started: {  bindable: true, type: "boolean", defaultValue: false },
            },
            aggregations: {
              _playButton: { type: "sap.m.Button", multiple: false },
              _stopButton: { type: "sap.m.Button", multiple: false, visible: false },
            },
            events: {
              getTimeValues: {
                parameters: {
                  hour: { type: "int", },
                  minute: { type: "int", },
                  second: { type: "int", },
                },
              },
              start: {

              }
            },
          },
          init: function () {
            const oBusEvent = sap.ui.getCore().getEventBus();
            oBusEvent.subscribe("Timer", "Start", this.toggleTimer, this);
            oBusEvent.subscribe("Timer", "Restart", this.clearTime, this);
            oBusEvent.subscribe("Timer", "Finish", this.stopTime, this);
            
            var oPB = new sap.m.Button({
              icon: "sap-icon://media-play",
              type: "Accept",
              tooltip: "Başlat/Durdur",
              press: this.toggleTimer.bind(this),
            });
          
            const sLibraryPath = jQuery.sap.getModulePath("com.smod.cardgame.cardgame");
            jQuery.sap.includeStyleSheet(sLibraryPath + "/css/style.css");
      
            this.setAggregation("_playButton", oPB);
    
         
        
          },
          toggleTimer: function () {
            const bGameStarted = this.getModel("game").getProperty("/gameStarted");
            if(!bGameStarted) {
              return;
            }
            var bStarted = this.getProperty("started");
            var oPB = this.getAggregation("_playButton");

            oPB.setIcon(bStarted ? "sap-icon://media-pause" : "sap-icon://media-play")
            oPB.setType(bStarted ? "Reject" : "Accept");
            if (bStarted) {
              this.startTimer();
              this.getModel("game").setProperty("/gameContinue",false);
            } else {
              this.pauseTime();
              this.getModel("game").setProperty("/gameContinue",true);
            }
          },
          startTimer: function () {
            var h = this.getHour();
            var m = this.getMinute();
            var s = this.getSecond();
            this._timerInterval = setInterval(
              function () {
                s = s + 1;
                if (s === 60) {
                  m = m + 1;
                  s = 0;
                }
                if (m === 60) {
                  h = h + 1;
                  m = 0;
                }
                this.setHour(h);
                this.setMinute(m);
                this.setSecond(s);
      
              }.bind(this),
              1000
            );
      
          },
          pauseTime: function () {
            clearInterval(this._timerInterval);
          },
          clearTime: function() {
            clearInterval(this._timerInterval);
            this.setHour(0);
            this.setMinute(0);
            this.setSecond(0);
          },
          stopTime: function () {
            var h = this.getHour();
            var m = this.getMinute();
            var s = this.getSecond();
           
            this.fireGetTimeValues({ hour: h, minute: m, second: s });
      
           
            var oPB = this.getAggregation("_playButton");
            oPB.setIcon("sap-icon://media-play")
            oPB.setType("Accept");
            clearInterval(this._timerInterval);
          },
          renderer: function (oRM, oControl) {
            var oPB = oControl.getAggregation("_playButton");

            oRM.openStart("div");// <div main
            oRM.writeControlData(oControl);
            oRM.class("smod-timer");
            oRM.openEnd();// >
      
           
      
            oRM.openStart("div"); // <div  content
            oRM.class("smod-timer-content");
            oRM.openEnd();//  >
      
            oRM.openStart("div"); // <div  time
            oRM.class("smod-timer-content-timer");
            oRM.openEnd();//  >
            var sTimer =
              oControl.pad2Digits(oControl.getHour()) +
              ":" +
              oControl.pad2Digits(oControl.getMinute()) +
              ":" +
              oControl.pad2Digits(oControl.getSecond());
      
            oRM.text(sTimer);
            oRM.close("div"); //</div> time end
      
            oRM.openStart("div"); // <div  button content start
            oRM.class("smod-timer-content-buttons-content");
            oRM.openEnd();//  >
      
            oRM.openStart("div"); // <div  button play start
            oRM.class("smod-timer-content-button-play");
            oRM.openEnd();//  >
            oRM.renderControl(oPB);
            oRM.close("div"); //</div> button play end
      
            oRM.close("div"); //</div> button-content-buttons end
      
            oRM.close("div"); //</div> content end
      
      
      
            oRM.close("div") //</div> main end
      
          },
          pad2Digits: function (n) {
            return n.toString().padStart(2, "0");
          },
	});
});