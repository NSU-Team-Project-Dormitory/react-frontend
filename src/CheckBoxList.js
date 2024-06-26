import React from 'react';

function CheckboxList({ onChange }) {
  return (
    <div>
      <label>
        <input type="checkbox" name="smallRoom" onChange={onChange} />
        Одноместная комната
      </label>
      <br />
      <label>
        <input type="checkbox" name="largeRoom" onChange={onChange} />
        Трехместная комната
      </label>
    </div>
  );
}

export default CheckboxList;