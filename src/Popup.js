import React, { useState, useEffect } from 'react';
import './styles/Popup.css';

const Popup = ({ rectId, position, residents, rectName, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(rectName || rectId);
  const [message, setMessage] = useState('');
  const { x, y } = position;

  const [newResident, setNewResident] = useState({ firstName: '', lastName: '', patronymic: '', roomNumber: ''});

  const apiUrl = process.env.REACT_APP_API_URL;
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewResident({ ...newResident, [name]: value });
  };


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


  const addResident = async () => {
    const url = `${apiUrl}/Residents/CreateResident`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newResident),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // const addedResident = await response.json();
      onSave(rectId, newResident);
      setNewResident({ firstName: '', lastName: '', patronymic: '', roomNumber: ''});
      alert('Failed to add resident');
    } catch (error) {
      console.error('Error adding resident:', error);
      alert('Resident added successfully');
    }
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
              <h3>Жители:</h3>
              {residents && residents.length > 0 ? (
                  <ul>
                    {residents.map((resident, index) => (
                        <li key={index}>
                          {resident.firstName} {resident.lastName} {resident.patronymic}
                        </li>
                    ))}
                  </ul>
              ) : (
                  <p>Нет жителей</p>
              )}
              <input
                  type="text"
                  name="firstName"
                  placeholder="Имя"
                  value={newResident.firstName}
                  onChange={handleInputChange}
              />
              <input
                  type="text"
                  name="lastName"
                  placeholder="Фамилия"
                  value={newResident.lastName}
                  onChange={handleInputChange}
              />
              <input
                  type="text"
                  name="patronymic"
                  placeholder="Отчество"
                  value={newResident.patronymic}
                  onChange={handleInputChange}
              />
              <input
                  type="text"
                  name="roomNumber"
                  placeholder="Комната"
                  value={newResident.roomNumber}
                  onChange={handleInputChange}
              />
              <button onClick={addResident}>Добавить жильца</button>
              <button onClick={() => setIsEditing(true)}>Изменить название</button>
            </>

        )}
      </div>
    </div>
  );
};

export default Popup;
