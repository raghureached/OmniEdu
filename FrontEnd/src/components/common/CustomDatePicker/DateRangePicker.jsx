import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./DateRangePicker.css";

const AddOrgDateRangePickerSingle = ({
  selectedDate,
  onDateChange,
  onClose,
  isEndDate,
  startDate,
  title,
}) => {
  const [date, setDate] = useState(selectedDate || null);
  const [error, setError] = useState("");
  useEffect(() => {
    setDate(selectedDate);
  }, [selectedDate]);

  const onChange = (newDate) => {
    setError("");

    // If selecting end date, ensure it's not before start date
    if (isEndDate && startDate && newDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    setDate(newDate);
  };

  const handleConfirm = () => {
    if (!date) {
      setError("Please select a date.");
      return;
    }
    onDateChange(date);
    onClose();
  };

  return (
    <div className="calendar-modal-overlay">
      <div className="calendar-modal-content">
        <h3>{title}</h3>
        <Calendar
          onChange={onChange}
          value={date}
          tileClassName={({ date: tileDate }) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (isEndDate && startDate && tileDate < startDate) {
              return "disabled-tile";
            }
            if (!isEndDate && tileDate < today) {
              return "disabled-tile";
            }          
            if (date && tileDate.toDateString() === date.toDateString()) {
              return "selected-tile";
            }
            return "";
          }}          
          minDate={isEndDate ? startDate : new Date()}
        />
        {error && <div className="calendar-error">{error}</div>}
        <div className="calendar-modal-actions">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleConfirm} className="confirm-btn">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOrgDateRangePickerSingle;
