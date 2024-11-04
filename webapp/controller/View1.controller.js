sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../utils/SweetAlert"

],
    function (Controller, MessageToast, JSONModel, Fragment) {
        "use strict";

        return Controller.extend("com.smod.cardgame.cardgame.controller.View1", {
            onInit: function () {

                const username = localStorage.getItem("username");
                if (username) {
                    this.byId("usernameInput").setValue(username);
                }

             
                const gameModel = new JSONModel({
                    cards: [],  // Kart verileri
                    selectedCards: [],  // Seçilen kartlar
                    difficulty: "easy",
                    gameStarted: false,
                    gameContinue: false,
                    gameHistory: []
                });

                gameModel.setDefaultBindingMode("TwoWay");
                this.getView().setModel(gameModel, "game");
                gameModel.bindProperty("/gameContinue").attachChange(this.onGameContinueChange.bind(this));
            
            },
            onStartGame: function () {
                const oBusEvent = sap.ui.getCore().getEventBus();
                var oGameModel = this.getView().getModel("game");
                oGameModel.setProperty("selectedCards", []);
                const username = this.byId("usernameInput").getValue();
                if (username) {
                    localStorage.setItem("username", username);
                } else {
                    MessageToast.show("Please enter an username");
                    return;
                }
                let timerInterval;
                Swal.fire({
                    title: "Game Starts",
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        const timer = Swal.getPopup().querySelector("b");
                        timerInterval = setInterval(() => {
                            timer.textContent = `${Swal.getTimerLeft()}`;
                        }, 1000);
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                    }
                }).then((result) => {
                    
                    if (result.dismiss === Swal.DismissReason.timer) {
                        console.log("I was closed by the timer");
                        const difficulty = this.byId("difficultySelect").getSelectedKey();
                        this.getView().getModel("game").setProperty("/difficulty", difficulty);
        
                        // Oyuna başla ve kartları dağıt
                        const pokemonCards = this._getRandomPokemonCards(difficulty);
                        this.getView().getModel("game").setProperty("/cards", pokemonCards);
                        this.getView().getModel("game").setProperty("/gameStarted", true);
                        this.getView().getModel("game").setProperty("/gameContinue", true);
                        oBusEvent.publish("Timer", "Restart");
                        oBusEvent.publish("Timer", "Start");
                    }
                });
            },

            _getRandomPokemonCards: function (difficulty) {
                const pokemonList = [
                    { cardId: "", name: "Bulbasaur", imageUrl: "https://img.pokemondb.net/sprites/home/normal/2x/bulbasaur.jpg" },
                    { cardId: "", name: "Ivysaur", imageUrl: "https://img.pokemondb.net/sprites/home/normal/2x/ivysaur.jpg" },
                    { cardId: "", name: "Rattata", imageUrl: "https://img.pokemondb.net/sprites/home/normal/2x/rattata.jpg" },
                    { cardId: "", name: "Pidgeot", imageUrl: "https://img.pokemondb.net/sprites/home/normal/2x/pidgeot.jpg" },
                    { cardId: "", name: "Clefable", imageUrl: "https://img.pokemondb.net/sprites/home/normal/2x/clefable.jpg" },
                    { cardId: "", name: "Rapidash", imageUrl: "https://img.pokemondb.net/sprites/home/normal/2x/rapidash.jpg" },
                    { cardId: "", name: "Golem", imageUrl: "https://img.pokemondb.net/sprites/home/normal/2x/golem.jpg" },
                    { cardId: "", name: "Cloyster", imageUrl: "https://img.pokemondb.net/sprites/home/normal/2x/cloyster.jpg" },
                    { cardId: "", name: "Staryu", imageUrl: "https://img.pokemondb.net/sprites/home/normal/2x/staryu.jpg" },
                    { cardId: "", name: "Raichu", imageUrl: "https://img.pokemondb.net/sprites/home/normal/2x/raichu.jpg" },
                ];

                let numOfCards;
                if (difficulty === "easy") numOfCards = 8;
                else if (difficulty === "medium") numOfCards = 12;
                else numOfCards = 16;

                const selectedCards = [];
                var iCounter = 0;
                while (selectedCards.length < numOfCards) {
                    const randomIndex = Math.floor(Math.random() * pokemonList.length);
                    var card = { ...pokemonList[randomIndex], flipped: false, matched: false, clickable: true };
                    if (!selectedCards.some((item) => { return item.name === card.name })) {
                        iCounter = iCounter + 1
                        card.cardId = iCounter;
                        selectedCards.push(card); 

                        iCounter = iCounter + 1;
                        var card2 = Object.assign({}, card); 
                        card2.cardId = iCounter;
                        selectedCards.push(card2);
                    }
                }

                return selectedCards.sort(() => Math.random() - 0.5); 
            },
            onCardPress: function (oEvent) {
                const oBusEvent = sap.ui.getCore().getEventBus();
                const gameModel = this.getView().getModel("game");
                const selectedCards = gameModel.getProperty("/selectedCards");
                var cards = gameModel.getProperty("/cards");
                const cardPath = oEvent.getSource().getBindingContext("game").getPath();
                const card = gameModel.getProperty(cardPath);

                
                if (card.matched) return;

                if (card.clickable) return;

             
                gameModel.setProperty(`${cardPath}/flipped`, !card.flipped);
                selectedCards.push(card);

                if (selectedCards.length === 2) {
                    if (selectedCards[0].name === selectedCards[1].name) {
                        gameModel.setProperty(`/cards/${cards.findIndex(card => card.cardId === selectedCards[0].cardId)}/matched`, true);
                        gameModel.setProperty(`/cards/${cards.findIndex(card => card.cardId === selectedCards[1].cardId)}/matched`, true);
                    } else {
                        setTimeout(() => {
                            gameModel.setProperty(`/cards/${cards.findIndex(card => card.cardId === selectedCards[0].cardId)}/flipped`, false);
                            gameModel.setProperty(`/cards/${cards.findIndex(card => card.cardId === selectedCards[1].cardId)}/flipped`, false);
                        }, 600);
                    }
                    gameModel.setProperty("/selectedCards", []);// Seçilen kartları sıfırla
                }
                if (this._checkEndGame()) { // oyun bitiş kontrolü
                    setTimeout(() => {
                        console.log("bitti");
                        gameModel.setProperty("/gameStarted", false);
                        gameModel.setProperty("/gameContinue", false);
                        oBusEvent.publish("Timer", "Finish");
                    }, 1000);
                }
            },
            onGetTimeValues(oEvent) { // oyun bitince süre verisini al
                var oGameModel = this.getView().getModel("game");
                var sDifficulty = oGameModel.getProperty("/difficulty");
                var sUserName = localStorage.getItem("username")
                var iHour = oEvent.getParameters().hour;
                var iMinute = oEvent.getParameters().minute;
                var iSecond = oEvent.getParameters().second;
                var sTime = iHour + ' H ' + iMinute + ' Mn ' + iSecond + ' Sc ';
                this.onEndGame(sUserName, sDifficulty, sTime);
            },
            onGameContinueChange: function () { // oyun durduğunda tüm cardların clickable değiştir
                const gameModel = this.getView().getModel("game");
                const gameContinue = gameModel.getProperty("/gameContinue");
                const cards = gameModel.getProperty("/cards");

                cards.forEach((card, index) => {
                    gameModel.setProperty(`/cards/${index}/clickable`, gameContinue);
                });
            },
            onEndGame: function (username, difficulty, time) { // oyunu history ata
                const allGames = JSON.parse(localStorage.getItem("gameHistory")) || [];

                allGames.push({
                    username: username,
                    difficulty: difficulty,
                    time: time,
                    date: new Date().toLocaleString(),
                });


                localStorage.setItem("gameHistory", JSON.stringify(allGames));
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "!!!! WIN !!!",
                    timer: 2000
                });

            },
            onShowHistory: async function () { // history göster
                const allGames = JSON.parse(localStorage.getItem("gameHistory")) || [];
                const oGameModel = this.getView().getModel("game");
                oGameModel.setProperty("/gameHistory", allGames);
                if (allGames.length === 0) {
                    sap.m.MessageToast.show("Kayıtlı oyun geçmişi yok.");
                    return;
                }
                try {
                    if (!this._oHistoryDialog) {
                        this._oHistoryDialog = await Fragment.load({
                            id: this.getView().getId(),
                            name: "com.smod.cardgame.cardgame.fragments.GameHistory",
                            controller: this
                        });
                        this.getView().addDependent(this._oHistoryDialog);
                    }

                    this._oHistoryDialog.open();
                } catch (e) {
                    console.error("Error in opening Add New Todo dialog:", e);
                }
            },
            onCloseHistory: function () {
                this._oHistoryDialog.close();
            },
            _checkEndGame: function () { // oyun bitti mi kontrol et
                var oGameModel = this.getView().getModel("game");
                var cards = oGameModel.getProperty("/cards");
                var bCheck = true;
                cards.forEach(card => {
                    if (!card.matched) {
                        bCheck = false;
                    }
                });

                return bCheck;

            }

        });
    });
