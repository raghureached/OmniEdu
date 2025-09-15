// // SurveyForm.js
// import React from "react";
// import "./SurveyForm.css";
// const SurveyForm = ({
//   formData,
//   setFormData,
//   handleChange,
//   handleQuestionChange,
//   handleOptionChange,
//   addOption,
//   removeOption,
//   addQuestion,
//   removeQuestion,
//   handleSubmit,
//   editingSurvey,
//   onClose,
// }) => {
//   return (
//     <div className="modal-overlay">
//       <div className="modal">
//         {/* Header */}
//         <div className="modal-header">
//           <h3>{editingSurvey ? "Edit Survey" : "Add Survey"}</h3>
//           <button className="close-btn" onClick={onClose}>✖</button>
//         </div>

//         <form onSubmit={handleSubmit} className="modal-form">
//           {/* Title */}
//           <label>Title*</label>
//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleChange}
//             required
//           />

//           {/* Description */}
//           <label>Description</label>
//           <textarea
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//           />

//           {/* Survey Type */}
//           <label>Survey Type*</label>
//           <select
//             name="survey_type"
//             value={formData.survey_type}
//             onChange={handleChange}
//           >
//             <option value="Short Answer">Short Answer</option>
//             <option value="Rating">Rating</option>
//             <option value="Multiple Choice">Multiple Choice</option>
//           </select>

//           {/* Dates */}
//           <div className="date-fields">
//             <div>
//               <label>Start Date</label>
//               <input
//                 type="date"
//                 name="start_date"
//                 value={formData.start_date}
//                 onChange={handleChange}
//               />
//             </div>
//             <div>
//               <label>End Date</label>
//               <input
//                 type="date"
//                 name="end_date"
//                 value={formData.end_date}
//                 onChange={handleChange}
//               />
//             </div>
//           </div>

//           {/* Status */}
//           <div>
//             <label>Status</label>
//             <select
//               name="is_active"
//               value={formData.is_active}
//               onChange={handleChange}
//             >
//               <option value={true}>Active</option>
//               <option value={false}>Inactive</option>
//             </select>
//           </div>

//           {/* Questions */}
//           <h4>Questions</h4>
//           {formData.questions.map((q, index) => (
//             <div key={index} className="question-box">
//               <input
//                 type="text"
//                 placeholder="Enter question"
//                 value={q.question_text}
//                 onChange={(e) =>
//                   handleQuestionChange(index, "question_text", e.target.value)
//                 }
//                 required
//               />
//               <select
//                 value={q.question_type}
//                 onChange={(e) =>
//                   handleQuestionChange(index, "question_type", e.target.value)
//                 }
//               >
//                 <option value="text">Text</option>
//                 <option value="multiple_choice">Multiple Choice</option>
//                 <option value="rating">Rating</option>
//               </select>

//               <button
//                 type="button"
//                 className="remove-btn"
//                 onClick={() => removeQuestion(index)}
//               >
//                 ✖
//               </button>

//               {/* Options Section */}
//               {(q.question_type === "multiple_choice" ||
//                 q.question_type === "rating") && (
//                 <div className="options-box">
//                   {q.options.map((opt, optIndex) => (
//                     <div key={optIndex} className="option-row">
//                       <input
//                         type="text"
//                         placeholder={`Option ${optIndex + 1}`}
//                         value={opt}
//                         onChange={(e) =>
//                           handleOptionChange(index, optIndex, e.target.value)
//                         }
//                       />
//                       <button
//                         type="button"
//                         className="remove-option-btn"
//                         onClick={() => removeOption(index, optIndex)}
//                       >
//                         ✖
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     type="button"
//                     className="add-option-btn"
//                     onClick={() => addOption(index)}
//                   >
//                     + Add Option
//                   </button>
//                 </div>
//               )}
//             </div>
//           ))}

//           <button
//             type="button"
//             className="add-question-btn"
//             onClick={addQuestion}
//           >
//             + Add Question
//           </button>

//           {/* Actions */}
//           <div className="modal-actions">
//             <button type="button" className="cancel-btn" onClick={onClose}>
//               Cancel
//             </button>
//             <button type="submit" className="create-btn">
//               {editingSurvey ? "Update Survey" : "Create Survey"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default SurveyForm;

///this is working
//SurveyForm.js
import React, { useState } from "react";
import "./GlobalFormnew.css";
import DateRangePicker from "../OrganizationManagement/DateRangePicker";

const SurveyForm = ({
  formData,
  setFormData,
  handleChange,
  handleQuestionChange,
  handleOptionChange,
  addOption,
  removeOption,
  addQuestion,
  removeQuestion,
  handleSubmit,
  editingSurvey,
  onClose,
}) => {
  // State for showing the custom date pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h3>{editingSurvey ? "Edit Survey" : "Add Survey"}</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <label>Title*</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          {/* Description */}
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          {/* Survey Type */}
          <label>Survey Type*</label>
          <select
            name="survey_type"
            value={formData.survey_type}
            onChange={handleChange}
          >
            <option value="Short Answer">Short Answer</option>
            <option value="Rating">Rating</option>
            <option value="Multiple Choice">Multiple Choice</option>
          </select>

          {/* Dates */}
          <div className="date-fields">
            <div>
              <label>Start Date</label>
              <input
                type="text"
                readOnly
                value={
                  formData.start_date
                    ? new Date(formData.start_date).toLocaleDateString()
                    : ""
                }
                onClick={() => setShowStartDatePicker(true)}
                placeholder="Select start date"
              />
            </div>
            <div>
              <label>End Date</label>
              <input
                type="text"
                readOnly
                value={
                  formData.end_date
                    ? new Date(formData.end_date).toLocaleDateString()
                    : ""
                }
                onClick={() => setShowEndDatePicker(true)}
                placeholder="Select end date"
              />
            </div>
          </div>

          {/* Render custom calendar for Start Date */}
          {showStartDatePicker && (
            <DateRangePicker
              selectedDate={
                formData.start_date ? new Date(formData.start_date) : null
              }
              onDateChange={(date) =>
                setFormData({
                  ...formData,
                  start_date: date.toISOString(),
                })
              }
              onClose={() => setShowStartDatePicker(false)}
              isEndDate={false}
              title="Select Start Date"
            />
          )}

          {/* Render custom calendar for End Date */}
          {showEndDatePicker && (
            <DateRangePicker
              selectedDate={
                formData.end_date ? new Date(formData.end_date) : null
              }
              onDateChange={(date) =>
                setFormData({
                  ...formData,
                  end_date: date.toISOString(),
                })
              }
              onClose={() => setShowEndDatePicker(false)}
              isEndDate={true}
              startDate={
                formData.start_date ? new Date(formData.start_date) : null
              }
              title="Select End Date"
            />
          )}

          {/* Status */}
          <div>
            <label>Status</label>
            <select
              name="is_active"
              value={formData.is_active}
              onChange={handleChange}
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>

          {/* Questions */}
          <h4>Questions</h4>
          {formData.questions.map((q, index) => (
            <div key={index} className="question-box">
              <input
                type="text"
                placeholder="Enter question"
                value={q.question_text}
                onChange={(e) =>
                  handleQuestionChange(index, "question_text", e.target.value)
                }
                required
              />
              <select
                value={q.question_type}
                onChange={(e) =>
                  handleQuestionChange(index, "question_type", e.target.value)
                }
              >
                <option value="text">Text</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="rating">Rating</option>
              </select>

              <button
                type="button"
                className="remove-btn"
                onClick={() => removeQuestion(index)}
              >
                ✖
              </button>

              {/* Options Section */}
              {(q.question_type === "multiple_choice" ||
                q.question_type === "rating") && (
                <div className="options-box">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="option-row">
                      <input
                        type="text"
                        placeholder={`Option ${optIndex + 1}`}
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(index, optIndex, e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="remove-option-btn"
                        onClick={() => removeOption(index, optIndex)}
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-option-btn"
                    onClick={() => addOption(index)}
                  >
                    + Add Option
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            className="add-question-btn"
            onClick={addQuestion}
          >
            + Add Question
          </button>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="create-btn">
              {editingSurvey ? "Update Survey" : "Create Survey"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyForm;

