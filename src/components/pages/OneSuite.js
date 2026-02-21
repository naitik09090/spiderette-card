import React, { useEffect, useState } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import * as _ from "lodash";
import CardHolder from "../CardHolder";
import Card from "../Card";
import WinAnimation from "../WinAnimation";

import "./OneSuite.css";

// --- Card Info ---
const cardInfo = {
  rank: ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
  suit: ["heart", "diamond", "spade", "club"],
  symbol: { heart: "♥", club: "♣", spade: "♠", diamond: "♦" },
};

// --- Logic Functions ---
const getRank = (rank) => {
  if (rank === "K" || rank === "Q" || rank === "J" || rank === "A") {
    switch (rank) {
      case "K": return 13;
      case "Q": return 12;
      case "J": return 11;
      case "A": return 1;
      default: return 0;
    }
  } else {
    return parseInt(rank);
  }
};

const checkMovable = (card, deck) => {
  var tempDeck = [...deck];
  var movingCards = tempDeck.slice(deck.indexOf(card));
  var ranks = movingCards.map((curCard) => getRank(curCard.rank));
  var curRank = getRank(card.rank);
  for (let i = 1; i < ranks.length; i++) {
    if (curRank - ranks[i] !== 1) return false;
    curRank = ranks[i];
  }
  return true;
};

const checkMove = (target, deck, game) => {
  if (
    target.suit === game.selectedCard.suit &&
    getRank(target.rank) - getRank(game.selectedCard.rank) === 1
  ) {
    if (deck.indexOf(target) === deck.length - 1) {
      return true;
    }
  }
  return false;
};

const removeSelection = (game, setgame) => {
  if (game.selectedCard !== "" || game.highlightedCard !== "") {
    var decks = [...game.decks];
    for (let i = 0; i < decks.length; i++) {
      for (let j = 0; j < decks[i].length; j++) {
        decks[i][j].isSelected = false;
        decks[i][j].isHighlighted = false;
      }
    }
    setgame((prevState) => ({
      ...prevState,
      selected: [],
      decks: decks,
      selectedCard: "",
      selectedDeck: "",
      highlightedCard: "",
      highlightedDeck: "",
    }));
  }
};


const checkDeck = (deck) => {
  var ranks = deck.map((card) => getRank(card.rank));
  const expectedArray = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  if (_.isEqual(expectedArray, ranks.slice(-13))) {
    return ranks.length - 13;
  }
  return false;
};


const populateOneSuitCards = () => {
  let cards = [];
  cardInfo["rank"].forEach((rank) => {
    for (let i = 1; i <= 8; i++) {
      cards.push({
        rank: rank,
        suit: "spade",
        isDown: true,
        deck: i,
        isSelected: false,
        isHighlighted: false,
      });
    }
  });
  let shuffledCards = _.shuffle(cards);
  let decks = _.chunk(shuffledCards.slice(0, 50), 5);
  decks[10] = shuffledCards.slice(50);
  for (let i = 0; i <= 9; i++) {
    decks[i][decks[i].length - 1].isDown = false;
  }
  return { decks, cards: shuffledCards };
};

// --- Component ---
function OneSuite() {

  const [game, setgame] = useState({
    cards: [],
    decks: [],
    selectedCard: "",
    selectedDeck: "",
    selected: [],
    hands: 0,
    x: -1,
    y: -1,
    highlightedDeck: "",
    highlightedCard: "",
  });
  const [isWon, setIsWon] = useState(false);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  // --- Move-related Logic (Moved inside for history access) ---
  const saveGameState = () => {
    const stateToSave = {
      decks: JSON.parse(JSON.stringify(game.decks)),
      hands: game.hands
    };
    setHistory(prev => [...prev, stateToSave]);
    setFuture([]); // New action clears future
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const current = {
      decks: JSON.parse(JSON.stringify(game.decks)),
      hands: game.hands
    };

    setFuture(prev => [...prev, current]);
    setHistory(prev => prev.slice(0, -1));

    setgame(prevState => ({
      ...prevState,
      decks: previous.decks,
      hands: previous.hands,
      selectedCard: "",
      selectedDeck: "",
      selected: []
    }));
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[future.length - 1];
    const current = {
      decks: JSON.parse(JSON.stringify(game.decks)),
      hands: game.hands
    };

    setHistory(prev => [...prev, current]);
    setFuture(prev => prev.slice(0, -1));

    setgame(prevState => ({
      ...prevState,
      decks: next.decks,
      hands: next.hands,
      selectedCard: "",
      selectedDeck: "",
      selected: []
    }));
  };

  const moveCardsAction = function (toDeck, fromDeck, fromCard) {
    saveGameState(); // Save BEFORE move

    var tempDeck = [...game.decks];
    var to = tempDeck.indexOf(toDeck);
    var from = tempDeck.indexOf(fromDeck);

    if (to === -1 || from === -1) return;
    var cardIdx = tempDeck[from].indexOf(fromCard);
    if (cardIdx === -1) return;

    var movedCards = tempDeck[from].splice(cardIdx);
    movedCards.forEach((card) => {
      tempDeck[to].push(card);
    });
    try {
      if (tempDeck[from][tempDeck[from].length - 1].isDown === true) {
        tempDeck[from][tempDeck[from].length - 1].isDown = false;
      }
    } catch (err) { }
    setgame((prevState) => ({
      ...prevState,
      decks: tempDeck,
    }));
    return tempDeck;
  };

  const isHandCompleteAction = (deck, currentDecks) => {
    var len = checkDeck(deck);
    if (len !== false) {
      var tempDecks = [...currentDecks];
      var curDeckIdx = tempDecks.indexOf(deck);
      tempDecks[curDeckIdx].splice(len);
      var curHands = game.hands;
      if (tempDecks[curDeckIdx].length !== 0) {
        tempDecks[curDeckIdx][tempDecks[curDeckIdx].length - 1].isDown = false;
      }
      setgame((prevState) => ({
        ...prevState,
        decks: tempDecks,
        hands: curHands + 1,
      }));
    }
  };

  const distributeRemCardsAction = () => {
    if (game.decks[10] && game.decks[10].length !== 0) {
      saveGameState();
      var tempDecks = [...game.decks];
      tempDecks.forEach((tempDeck, idx) => {
        if (idx < 10 && tempDecks[10].length > 0) {
          var tempCard = tempDecks[10].pop();
          tempCard.isDown = false;
          tempDeck.push(tempCard);
        }
      });
      setgame((prevState) => ({ ...prevState, decks: tempDecks }));
      tempDecks.forEach((tempDeck) => isHandCompleteAction(tempDeck, tempDecks));
    }
  };

  const selectCardAction = (card, deck, holder) => {
    if (holder && game.selectedCard !== "") {
      if (game.selectedCard.rank === "K") {
        const newDecks = moveCardsAction(deck, game.selectedDeck, game.selectedCard);
        isHandCompleteAction(deck, newDecks);
        removeSelection(game, setgame);
      }
    }
    if (game.selectedCard === "") {
      if (holder) return;
      if (card.isDown) return;
      if (checkMovable(card, deck)) {
        var tempDeck = [...deck];
        var selected = tempDeck.slice(deck.indexOf(card));
        selected.forEach((c) => (c.isSelected = true));
        setgame((prevState) => ({
          ...prevState,
          selected: selected,
          selectedCard: card,
          selectedDeck: deck,
        }));
      }
    } else {
      if (checkMove(card, deck, game)) {
        const newDecks = moveCardsAction(deck, game.selectedDeck, game.selectedCard);
        isHandCompleteAction(deck, newDecks);
        removeSelection(game, setgame);
      } else {
        removeSelection(game, setgame);
      }
    }
  };

  const dropAction = (event) => {
    if (game.highlightedCard === "" && game.highlightedDeck !== "") {
      if (checkMovable(game.selectedCard, game.selectedDeck)) {
        game.selected.forEach((card) => {
          var el = document.getElementById(card.rank + " " + card.suit + " " + card.deck);
          if (el) el.children[0].style.cssText = "";
        });
        const newDecks = moveCardsAction(game.highlightedDeck, game.selectedDeck, game.selectedCard);
        isHandCompleteAction(game.highlightedDeck, newDecks);
        removeSelection(game, setgame);
      } else {
        removeSelection(game, setgame);
      }
    }
    if (checkMove(game.highlightedCard, game.highlightedDeck, game)) {
      if (checkMovable(game.selectedCard, game.selectedDeck)) {
        game.selected.forEach((card) => {
          var el = document.getElementById(card.rank + " " + card.suit + " " + card.deck);
          if (el) el.children[0].style.cssText = "";
        });
        const newDecks = moveCardsAction(game.highlightedDeck, game.selectedDeck, game.selectedCard);
        isHandCompleteAction(game.highlightedDeck, newDecks);
        removeSelection(game, setgame);
      } else {
        game.selected.forEach((card) => {
          var el = document.getElementById(card.rank + " " + card.suit + " " + card.deck);
          if (el) el.children[0].style.cssText = "";
        });
        removeSelection(game, setgame);
      }
    } else {
      game.selected.forEach((card) => {
        var el = document.getElementById(card.rank + " " + card.suit + " " + card.deck);
        if (el) el.children[0].style.cssText = "";
      });
      removeSelection(game, setgame);
    }
  };

  useEffect(() => {
    if (game.hands === 8) {
      setIsWon(true);
    }
  }, [game.hands]);

  const restartGame = () => {
    const val = populateOneSuitCards();

    setgame({
      cards: val.cards,
      decks: val.decks,
      selectedCard: "",
      selectedDeck: "",
      selected: [],
      hands: 0,
      x: -1,
      y: -1,
      highlightedDeck: "",
      highlightedCard: "",
    });
    setHistory([]);
    setFuture([]);
    setIsWon(false);
  };

  useEffect(() => {
    const val = populateOneSuitCards();

    setgame((prevState) => ({
      ...prevState,
      cards: val.cards,
      decks: val.decks,
    }));
  }, []);

  const dragStartAction = (event, card, deck) => {
    const x = event.pageX;
    const y = event.pageY;
    event.dataTransfer.setData("text", event.target.id);
    event.dataTransfer.setDragImage(new Image("0", "0"), -10, -10);
    setgame((prevState) => ({ ...prevState, x, y }));
    if (game.selectedCard === card) return;
    removeSelection(game, setgame);
    selectCardAction(card, deck, null);
  };

  const dragAction = (event) => {
    game.selected.forEach((card) => {
      var wrapper = document.getElementById(
        card.rank + " " + card.suit + " " + card.deck
      );
      if (!wrapper) return;
      var child = wrapper.children[0];
      var movex = event.pageX - game.x;
      var movey = event.pageY - game.y;

      // Don't hide or reset if pageX is 0 (often happens at end of drag)
      if (event.pageX === 0) return;

      var css = "z-index:9999; pointer-events: none; transform: scale(1.05, 1.05) translate(" + movex + "px, " + movey + "px);";
      child.style.cssText = css;
    });
  };

  const dragEnterAction = (event, card, deck) => {
    var tempDecks = [...game.decks];
    if (card === "" && game.selectedCard !== "") {
      tempDecks.forEach((d) => d.forEach((c) => (c.isHighlighted = false)));
    } else if (card !== "" && card !== game.selectedCard) {
      if (game.selected.indexOf(card) !== -1) return;
      var deckIdx = tempDecks.indexOf(deck);
      var cardIdx = tempDecks[deckIdx].indexOf(card);
      if (cardIdx !== tempDecks[deckIdx].length - 1) return;
      tempDecks.forEach((d) => d.forEach((c) => (c.isHighlighted = false)));
      tempDecks[deckIdx][cardIdx].isHighlighted = true;
    }
    setgame((prevState) => ({
      ...prevState,
      highlightedCard: card,
      highlightedDeck: deck,
      decks: tempDecks,
    }));
  };

  return (
    <div className="onesuite">
      <div className="game-controls">
        <button
          className="control-btn undo-btn"
          onClick={undo}
          disabled={history.length === 0}
          title="Undo Move"
        >
          <span className="icon">↩</span> UNDO
        </button>
        <button
          className="control-btn redo-btn"
          onClick={redo}
          disabled={future.length === 0}
          title="Redo Move"
        >
          REDO <span className="icon">↪</span>
        </button>
      </div>

      {isWon && <WinAnimation onRestart={restartGame} />}
      {game.decks.length > 0 &&
        game.decks.slice(0, 10).map((deck, index) => (
          <React.Fragment key={index}>
            {deck.length === 0 ? (
              <div
                id="holder"
                onClick={() => selectCardAction("", deck, true)}
                onDragEnter={(e) => dragEnterAction(e, "", deck)}
              >
                <CardHolder deck={deck} />
              </div>
            ) : (
              <div
                style={{
                  zIndex: game.selectedDeck === deck ? 1000 : 1,
                  position: "relative"
                }}
              >
                <TransitionGroup component={null}>
                  {deck.map((card, cardIdx) => (
                    <CSSTransition
                      key={card.rank + " " + card.suit + " " + card.deck}
                      timeout={{ enter: 500, exit: 300 }}
                      classNames="card"
                    >
                      <div
                        id={card.rank + " " + card.suit + " " + card.deck}
                        className={"card__wrapper" + (cardIdx === deck.length - 1 ? "" : " card__stack")}
                        draggable={true}
                        onDragStart={(e) => dragStartAction(e, card, deck)}
                        onDrag={(e) => dragAction(e)}
                        onDragEnter={(e) => !card.isDown && dragEnterAction(e, card, deck)}
                        onDragEnd={(e) => dropAction(e)}
                        onClick={() => selectCardAction(card, deck, null)}
                      >
                        <Card
                          card={card}
                          isSelected={card.isSelected}
                          isDown={card.isDown}
                          isHighlighted={card.isHighlighted}
                        />
                      </div>
                    </CSSTransition>
                  ))}
                </TransitionGroup>
              </div>
            )}
          </React.Fragment>
        ))}
      {game.decks[10] && game.decks[10].length > 0 && (
        <div
          onClick={distributeRemCardsAction}
          className="card card__down card__remcards"
        ></div>
      )}
    </div>
  );
}

export default OneSuite;
