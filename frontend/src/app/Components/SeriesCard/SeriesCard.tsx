"use client";

interface CardProps {
  type: string;
  series: string;
  onCardClick: () => void;
}

const SeriesCard: React.FC<CardProps> = ({ type, series, onCardClick }) => {
  return (
    <div className="card" style={{ cursor: "pointer" }} onClick={onCardClick}>
      <div className="card-image-container">
        <img src="/Icons/pokeball.svg" alt="Card Image" className="image-icon" />
      </div>
      <p className="card-title">{series}</p>
      <p>Lorem ipsum</p>
    </div>
  );
};

export default SeriesCard;
