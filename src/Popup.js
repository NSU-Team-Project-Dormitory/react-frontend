import React, { useState } from 'react';

const Popup = ({ rectId, rectName, position, onClose, onSave, roomData }) => {
  const [name, setName] = useState(rectName);

  const handleSaveClick = () => {
    onSave(rectId, name);
    onClose();
  };

  return (
    <div
      className="popup"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: 'white',
        border: '1px solid black',
        padding: '10px',
        zIndex: 1000,
      }}
    >
      <button onClick={onClose}>Close</button>
      <div>
        <label>
          Room Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button onClick={handleSaveClick}>Save</button>
      </div>
      {roomData && (
        <div>
          <h3>Room Details</h3>
          <pre>{JSON.stringify(roomData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Popup;
