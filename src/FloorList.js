import React from 'react';

const FloorList = ({ floors, onSelectFloor }) => {
  return (
    <div className="floor-list">
      <h2>Этажи</h2>
      <ul>
        {floors.map((floor, index) => (
          <li key={index} onClick={() => onSelectFloor(floor)}>
            {floor}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FloorList;
