import React, { useState, useEffect } from "react";
import "./Card.css";

const cardInfo = {
  rank: ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
  suit: ["heart", "diamond", "spade", "club"],
  symbol: { heart: "♥", club: "♣", spade: "♠", diamond: "♦" },
};

function Card({ card, isSelected, isDown, isHighlighted }) {
  const [down, setdown] = useState("");
  const [select, setselect] = useState("");
  const [highlight, sethighlight] = useState("");
  useEffect(() => {
    if (isDown) {
      setdown(" card__down");
    } else {
      setdown(" " + card.suit);
    }
    if (isSelected) {
      setselect(" card__selected");
    } else {
      setselect("");
    }
    if (isHighlighted) {
      sethighlight(" card__highlighted");
    } else {
      sethighlight("");
    }
  }, [isDown, isSelected, isHighlighted, card.suit]);
  return (
    <div className={"card" + down + select + highlight}>
      {/* Top Left Corner */}
      <div className="card__corner top-left">
        <span className="card__rank">{card.rank}</span>
        <span className="card__symbol">{cardInfo["symbol"][card.suit]}</span>
      </div>

      {/* Dynamic Center Symbol */}
      <div className="card__center-suit">
        {cardInfo["symbol"][card.suit]}
      </div>

      {/* Bottom Right Corner */}
      <div className="card__corner bottom-right">
        <span className="card__rank">{card.rank}</span>
        <span className="card__symbol">{cardInfo["symbol"][card.suit]}</span>
      </div>
    </div>
  );
}

export default Card;
