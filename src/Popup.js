import React, { useState, useEffect } from 'react';
import './styles/Popup.css';

const Popup = ({ rectId, rectName, position, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(rectName || rectId);
  const [message, setMessage] = useState('');
  const { x, y } = position;

  useEffect(() => {
    setName(rectName || rectId);
  }, [rectId, rectName]);

  const handleSave = () => {
    onSave(rectId, name);
    setMessage('Название комнаты успешно изменено');
    setIsEditing(false);
  };

  const handlePopupClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="popup" style={{ top: y, left: x }} onClick={handlePopupClick}>
      <div className="popup-content">
        <span className="popup-close" onClick={onClose}>x</span>
        {message && <p className="success-message">{message}</p>}
        {isEditing ? (
          <>
            <p>Изменить название комнаты:</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button onClick={handleSave}>Сохранить</button>
          </>
        ) : (
          <>
            <p>{`Комната: ${rectName || rectId}`}</p>
            <button onClick={() => setIsEditing(true)}>Изменить название</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Popup;