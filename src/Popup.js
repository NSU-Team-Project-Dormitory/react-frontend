import React from 'react';
import './styles/Popup.css';

const Popup = ({ rectId, position, onClose }) => {
  const { x, y } = position;

  return (
    <div className="popup" style={{ top: y, left: x }}>
      <div className="popup-content">
        <span className="popup-close" onClick={onClose}>&times;</span>
        <p>Комната: {rectId}</p>
      </div>
    </div>
  );
};

export default Popup;
