import React, { useState } from 'react';
import './StarRating.css'; // เราจะสร้างไฟล์ CSS นี้ในขั้นตอนต่อไป

const StarRating = ({ rating, onRating }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating">
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className={`star ${ratingValue <= (hover || rating) ? 'on' : ''}`}
            onClick={() => onRating(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          >
            &#9733; {/* นี่คือตัวอักษรรูปดาว */}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;