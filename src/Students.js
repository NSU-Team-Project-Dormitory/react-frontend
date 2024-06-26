import React, { useState } from 'react';

// Данные комнат со студентами
const initialRoomsData = {
  room01: { name: "100(1)", info: "Клюшнева Елизавета Георгиевна", left: '2.1%', top: '48.5%' },
  room02: { name: "100(2)", info: "Куликова Анастасия Андреевна", left: '8.8%', top: '48.5%' },
  room2: { name: "102", info: "Житник Елизавета Владимировна", left: '2.1%', top: '29%' },
  room4: { name: "104", info: "Трунева Юлия Вячеславовна", left: '12.1%', top: '29%' },
  room6: { name: "106", info: "Трунева Алина Дмитриевна", left: '19.1%', top: '29%' },
  room8: { name: "108", info: "Юхнина Мария Андреевна", left: '25.9%', top: '29%' },
  room10: { name: "110", info: "Белокрылов Ярослав Дмитриевич", left: '32.7%', top: '29%' },
};

function Students() {
  const [roomsData, setRoomsData] = useState(initialRoomsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', info: '', left: '', top: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Обработчик поиска
  const handleSearch = () => {
    const searchResults = Object.entries(roomsData).filter(([key, room]) =>
      room.info.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(searchResults);
  };

  // Обработчик изменения поля поиска
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Открытие формы добавления нового студента
  const handleAddNew = () => {
    setIsAdding(true);
  };

  // Обработчик изменения полей формы добавления нового студента
  const handleNewStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prevState => ({ ...prevState, [name]: value }));
  };

  // Обработчик добавления нового студента
  const handleAddNewStudent = () => {
    const newKey = `room${Object.keys(roomsData).length + 1}`;
    setRoomsData(prevState => ({ ...prevState, [newKey]: newStudent }));
    setNewStudent({ name: '', info: '', left: '', top: '' });
    setIsAdding(false);
  };

  // Обработчик открытия модального окна
  const handleShowAllStudents = () => {
    setResults(Object.entries(roomsData));
    setIsModalOpen(true);
  };

  // Обработчик закрытия модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-gray-300 min-h-screen flex items-center justify-center flex-col">
      <h1 className="text-2xl mb-4">Поиск комнат по студентам</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder="Введите имя студента"
        className="p-2 rounded-lg mb-4"
      />
      <button onClick={handleSearch} className="bg-teal-400 text-white p-2 rounded-lg mb-4">Найти</button>
      {results.length > 0 ? (
        results.map(([key, room]) => (
          <div key={key} className="bg-white p-4 mb-3 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl mb-2">Комната: {room.name}</h2>
            <p><strong>Информация:</strong> {room.info}</p>
          </div>
        ))
      ) : (
        <p>Ничего не найдено</p>
      )}

      <button onClick={handleAddNew} className="bg-teal-400 text-white p-2 rounded-lg mb-4">Добавить нового студента</button>
      <button onClick={handleShowAllStudents} className="bg-teal-400 text-white p-2 rounded-lg mb-4">Показать всех студентов</button>

      {isAdding && (
        <div className="bg-white p-4 rounded shadow-md">
          <h2>Добавление нового студента</h2>
          <div className="mb-2">
            <label className="block">Номер комнаты</label>
            <input
              type="text"
              name="name"
              value={newStudent.name}
              onChange={handleNewStudentChange}
              className="border px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block">ФИО студента</label>
            <input
              type="text"
              name="info"
              value={newStudent.info}
              onChange={handleNewStudentChange}
              className="border px-2 py-1 w-full"
            />
          </div>
          <button onClick={handleAddNewStudent} className="bg-teal-400 text-white p-2 rounded-lg mb-4">Добавить</button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-3/4">
            <h2 className="text-2xl mb-4">Список всех студентов</h2>
            {Object.entries(roomsData).map(([key, room]) => (
              <div key={key} className="mb-4">
                <h3 className="text-xl">{room.name}</h3>
                <p>{room.info}</p>
              </div>
            ))}
            <button onClick={handleCloseModal} className="bg-teal-400 text-white p-2 rounded-lg mt-4">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;