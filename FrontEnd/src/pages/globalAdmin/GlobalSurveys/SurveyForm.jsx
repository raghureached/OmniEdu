
///this is working
//SurveyForm.js
import React, { useState } from "react";
import "./SurveyForm.css";
import DateRangePicker from "../../../components/common/CustomDatePicker/DateRangePicker";
import SurveyPreview from "./SurveyPreviewNew";
import { useNavigate } from "react-router-dom";
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
  const [previewOpen, setPreviewOpen] = useState(false);

  const navigate = useNavigate();
  const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
const duplicateQuestion = (index) => {
  const questionToCopy = formData.questions[index];
  const newQuestions = [
    ...formData.questions.slice(0, index + 1),
    {...questionToCopy}, // shallow copy is enough for primitives
    ...formData.questions.slice(index + 1)
  ];
  setFormData({...formData, questions: newQuestions});
};
 
 // ✅ Validation function (runs automatically on each render)
  // const isLastQuestionFilled = () => {
  //   if (formData.questions.length === 0) return true; // allow first question

  //   const lastQuestion = formData.questions[formData.questions.length - 1];

  //   if (lastQuestion.question_type === "info") {
  //     return lastQuestion.info_text?.trim().length > 0;
  //   }

  //   const isTextFilled = lastQuestion.question_text?.trim().length > 0;

  //   const areOptionsValid =
  //     lastQuestion.question_type !== "multiple_choice" ||
  //     lastQuestion.options.some((opt) => opt.trim().length > 0);

  //   return isTextFilled && areOptionsValid;
  // };
  // ✅ Checks if a given question is complete
const isQuestionComplete = (question) => {
  if (!question) return false;

  if (question.question_type === "info") {
    // info_text is used, fallback to question_text
    return (question.info_text?.trim() || question.question_text?.trim())?.length > 0;
  } else {
    const hasText = question.question_text?.trim().length > 0;
    const hasOptions =
      question.question_type !== "multiple_choice" ||
      (question.options && question.options.some(opt => opt.trim().length > 0));
    return hasText && hasOptions;
  }
};

const addQuestionAtIndex = (index) => {
  const newQuestion = {
    question_text: "",
    question_type: "multiple_choice",
    options: [],
  };
  const updatedQuestions = [
    ...formData.questions.slice(0, index + 1),
    newQuestion,
    ...formData.questions.slice(index + 1),
  ];
  setFormData({ ...formData, questions: updatedQuestions });
};

const addInfoBoxAtIndex = (index) => {
  const newInfoBox = {
    question_text: "", // optional, use for textarea
    info_text: "",
    question_type: "info",
    options: [],
  };
  const updatedQuestions = [
    ...formData.questions.slice(0, index + 1),
    newInfoBox,
    ...formData.questions.slice(index + 1),
  ];
  setFormData({ ...formData, questions: updatedQuestions });
};
const addTextQuestionAtIndex = (index) => {
  const newQuestion = {
    question_text: "",
    question_type: "text",
    options: [], // text questions don't have options
  };
  const updatedQuestions = [
    ...formData.questions.slice(0, index + 1),
    newQuestion,
    ...formData.questions.slice(index + 1),
  ];
  setFormData({ ...formData, questions: updatedQuestions });
};




  const handlePreview = (e) => {
  e.preventDefault(); // prevent form submission
  // ✅ Validation: Title must not be empty
  if (!formData.title.trim()) {
    alert("Please enter a survey title before previewing.");
    return;
  }

  // ✅ Validation: Must have at least one valid question
  const hasValidQuestion = formData.questions.some(
    (q) => q.question_type !== "info" && q.question_text.trim() !== ""
  );

  if (!hasValidQuestion) {
    alert("Please add at least one question before previewing.");
    return;
  }
  setPreviewOpen(true); // open the preview overlay
};

// const addInfoBox = () => {
//   setFormData({
//     ...formData,
//     questions: [
//       ...formData.questions,
//       { question_text: "", question_type: "info", options: [] },
//     ],
//   });
// };
const addInfoBox = () => {
  setFormData({
    ...formData,
    questions: [
      ...formData.questions,
      {
         question_text: "", 
        info_text: "", // ✅ use info_text, not question_text
       // leave empty to avoid validation issues
        question_type: "info", // identify this as info box
        options: [],
      },
    ],
  });
};



  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h3>{editingSurvey ? "Edit Survey" : "Add Survey"}</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        {/* Body */}
        {previewOpen && (
  <div className="preview-overlay">
    <div className="preview-content">
      <SurveyPreview
        formData={formData}
        onClosePreview={() => setPreviewOpen(false)}
      />
    </div>
  </div>
)}


        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <label>Title*</label>
          <input
            type="text"
            name="title"
            value={capitalizeFirst(formData.title)}
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
          {/* <label>Survey Type*</label>
          <select
            name="survey_type"
            value={formData.survey_type}
            onChange={handleChange}
          >
            <option value="Short Answer">Short Answer</option>
            <option value="Rating">Rating</option>
            <option value="Multiple Choice">Multiple Choice</option>
          </select> */}

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
         
{(() => {
  let questionNumber = 0; // ✅ independent counter for questions
  let infoCount = 0;
// === Case 1: No questions yet AND we are in create mode ===
  if (formData.questions.length === 0 ) {
    return (
      <div className="add-button-view-increate" style={{ display: "flex", gap: "10px" }}>
        <button
          type="button"
          className="add-question-btn"
          onClick={() => addQuestionAtIndex(-1)} // add at start
        >
          + Add Question
        </button>
        <button
          type="button"
          className="add-question-btn"
          onClick={() => addInfoBoxAtIndex(-1)} // add at start
        >
          + Add Info Box
        </button>
         <button type="button" className="add-question-btn" onClick={() => addTextQuestionAtIndex(-1)}>
      + Add Text 
    </button>
      </div>
    );
  }
   <h4>Questions</h4>  
  return formData.questions.map((q, index) => {
    const renderButtons = (
       <div className="add-button-view" style={{display:"flex", gap:"10px"}}>
          <button
            type="button"
            className="add-question-btn"
            onClick={() => addQuestionAtIndex(index)}
            disabled={!isQuestionComplete(q)}
 // ✅ updates instantly
          >
            + Add Question
          </button>
 <button type="button" className="add-question-btn"  onClick={() => addInfoBoxAtIndex(index)}  disabled={!isQuestionComplete(q)}
 // optional: block until last question is filled
  >
    + Add Info Box
  </button>
  
  </div>
    );
    if (q.question_type === "info") {
      infoCount++;
      return (
        <div key={index} className="question-box info-box">
          <div className="question-header">
            <span className="question-label">Info Box {infoCount}</span>
            <button
              type="button"
              className="remove-btn"
              onClick={() => removeQuestion(index)}
            >
              ✖
            </button>
          </div>
          <div className="question-text-info">
           <input
            type="text"
            placeholder="Enter Info box heading"
            value={q.question_text}
            onChange={(e) =>
              handleQuestionChange(index, "question_text", e.target.value)
            }
            
           
          />
        
    </div>
    <div className="question-text-info">
          <textarea
            placeholder="Enter info text / section heading"
            value={q.info_text || ""}
            onChange={(e) =>
              handleQuestionChange(index, "info_text", e.target.value)
            }onInput={(e) => {
    e.target.style.height = "auto"; // reset height
    e.target.style.height = e.target.scrollHeight + "px"; // set height to content
  }}
            style={{
              backgroundColor: "#f9f9f9",
              fontStyle: "normal",
              padding: "4px",
            }}
          /> 
        
    </div>
          {renderButtons}
        </div>
      );
    } else if (q.question_type === "text") {

  return (
    <div key={index} className="question-box">
      <div className="question-header">
        <span className="question-label">Text</span>
        <button
          type="button"
          className="remove-btn"
          onClick={() => removeQuestion(index)}
        >
          ✖
        </button>
      </div>
      <textarea
        placeholder="Enter text question here..."
        value={q.question_text}
        onChange={(e) =>
          handleQuestionChange(index, "question_text", e.target.value)
        }
        onInput={(e) => {
    e.target.style.height = "auto"; // reset height
    e.target.style.height = e.target.scrollHeight + "px"; // set height to content
  }}
        style={{ width: "100%", minHeight: "60px", padding: "6px" }}
        required
      />
      {/* Buttons under this question */}
      {renderButtons}
    </div>
  );
}else {
      questionNumber++; // ✅ increment only for actual questions
      return (
        <div key={index} className="question-box">
          <div className="question-header">
            <span className="question-label">Question {questionNumber}</span>
            <button
        type="button"
        className="add-duplicate"
        onClick={() => duplicateQuestion(index)}
      >
       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.333 1.33398H6.66634C5.93101 1.33398 5.33301 1.93198 5.33301 2.66732V5.33398H2.66634C1.93101 5.33398 1.33301 5.93198 1.33301 6.66732V13.334C1.33301 14.0693 1.93101 14.6673 2.66634 14.6673H9.33301C10.0683 14.6673 10.6663 14.0693 10.6663 13.334V10.6673H13.333C14.0683 10.6673 14.6663 10.0693 14.6663 9.33398V2.66732C14.6663 1.93198 14.0683 1.33398 13.333 1.33398ZM2.66634 13.334V6.66732H9.33301L9.33434 13.334H2.66634ZM13.333 9.33398H10.6663V6.66732C10.6663 5.93198 10.0683 5.33398 9.33301 5.33398H6.66634V2.66732H13.333V9.33398Z" fill="#262626"></path></svg> Duplicate
      </button>
            <button
              type="button"
              className="remove-btn"
              onClick={() => removeQuestion(index)}
            >
              ✖
            </button>
          </div>
          <input
            type="text"
            placeholder="Enter question"
            value={q.question_text}
            onChange={(e) =>
              handleQuestionChange(index, "question_text", e.target.value)
            }
            required
          />
          {/* <select
            value={q.question_type}
            onChange={(e) =>
              handleQuestionChange(index, "question_type", e.target.value)
            }
          >
            <option value="multiple_choice">Multiple Choice</option>
          </select> */}
          {q.question_type === "multiple_choice" && (
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
            {renderButtons}
        </div>
        
      );
      
    }
    
  }
);

})

()}

<button type="button" className="add-question-btn" onClick={() => addTextQuestionAtIndex(formData.questions.length - 1)}>
      + Add Text 
    </button>

      




  
          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
                {/* <button type="button"
                className="preview-btn"
                onClick={handlePreview}><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15 " viewBox="0 0 14 14" fill="none"><path d="M1.75 7.58337C3.85 2.91671 10.15 2.91671 12.25 7.58337" stroke="#595959" stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7 9.91663C6.03348 9.91663 5.25 9.13315 5.25 8.16663C5.25 7.2001 6.03348 6.41663 7 6.41663C7.96653 6.41663 8.75 7.2001 8.75 8.16663C8.75 9.13315 7.96653 9.91663 7 9.91663Z" stroke="#595959" stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round"></path></svg>  
                Preview</button> */}
                <button
  type="button"
  className="preview-btn"
  onClick={handlePreview}
  disabled={
    !formData.title.trim() ||
    !formData.questions.some(
      (q) => q.question_type !== "info" && q.question_text.trim() !== ""
    )
  }
  style={{
    opacity:
      formData.title.trim() &&
      formData.questions.some(
        (q) => q.question_type !== "info" && q.question_text.trim() !== ""
      )
        ? 1
        : 0.5,
    cursor:
      formData.title.trim() &&
      formData.questions.some(
        (q) => q.question_type !== "info" && q.question_text.trim() !== ""
      )
        ? "pointer"
        : "not-allowed",
  }}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 14 14" fill="none">
    <path d="M1.75 7.58337C3.85 2.91671 10.15 2.91671 12.25 7.58337" stroke="#595959" strokeWidth="0.875" strokeLinecap="round" strokeLinejoin="round"></path>
    <path d="M7 9.91663C6.03348 9.91663 5.25 9.13315 5.25 8.16663C5.25 7.2001 6.03348 6.41663 7 6.41663C7.96653 6.41663 8.75 7.2001 8.75 8.16663C8.75 9.13315 7.96653 9.91663 7 9.91663Z" stroke="#595959" strokeWidth="0.875" strokeLinecap="round" strokeLinejoin="round"></path>
  </svg>  
  Preview
</button>

            <button type="submit" className="create-btn">
              {editingSurvey ? "Update Survey" : "Create Survey"}
            </button>
            <button className="create-btn-publish">{editingSurvey ? "Update and Publish" : "Create and Publish"}</button>
        
          </div>
        </form>
      </div>
            
    </div>
   
      
  );
};

export default SurveyForm;



///important
//            {formData.questions.map((q, index) => (
//   <div key={index} className="question-box">
//     {/* Question header with remove button */}
    
//     <div className="question-header">
//       <span className="question-label">Question {index + 1}</span>
//       <button
//         type="button"
//         className="add-duplicate"
//         onClick={() => duplicateQuestion(index)}
//       >
//        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.333 1.33398H6.66634C5.93101 1.33398 5.33301 1.93198 5.33301 2.66732V5.33398H2.66634C1.93101 5.33398 1.33301 5.93198 1.33301 6.66732V13.334C1.33301 14.0693 1.93101 14.6673 2.66634 14.6673H9.33301C10.0683 14.6673 10.6663 14.0693 10.6663 13.334V10.6673H13.333C14.0683 10.6673 14.6663 10.0693 14.6663 9.33398V2.66732C14.6663 1.93198 14.0683 1.33398 13.333 1.33398ZM2.66634 13.334V6.66732H9.33301L9.33434 13.334H2.66634ZM13.333 9.33398H10.6663V6.66732C10.6663 5.93198 10.0683 5.33398 9.33301 5.33398H6.66634V2.66732H13.333V9.33398Z" fill="#262626"></path></svg> Duplicate
//       </button>
//       <button
//         type="button"
//         className="remove-btn"
//         onClick={() => removeQuestion(index)}
//       >
//         ✖
//       </button>
//     </div>

//     {/* Question text */}
//     <input
//       type="text"
//       placeholder="Enter question"
//       value={q.question_text}
//       onChange={(e) =>
//         handleQuestionChange(index, "question_text", e.target.value)
//       }
//       required
//     />

//     {/* Question type */}
//     <select
//       value={q.question_type}
//       onChange={(e) =>
//         handleQuestionChange(index, "question_type", e.target.value)
//       }
//     >
//       {/* <option value="text">Text</option> */}
//       <option value="multiple_choice">Multiple Choice</option>
//       {/* <option value="rating">Rating</option> */}
//     </select>

//     {/* Options Section */}
//     {(q.question_type === "multiple_choice" ) && (
//       <div className="options-box">
//         {q.options.map((opt, optIndex) => (
//           <div key={optIndex} className="option-row">
//             <input
//               type="text"
//               placeholder={`Option ${optIndex + 1}`}
//               value={opt}
//               onChange={(e) =>
//                 handleOptionChange(index, optIndex, e.target.value)
//               }
//             />
//             <button
//               type="button"
//               className="remove-option-btn"
//               onClick={() => removeOption(index, optIndex)}
//             >
//               ✖
//             </button>
//           </div>
//         ))}
//         <button
//           type="button"
//           className="add-option-btn"
//           onClick={() => addOption(index)}
//         >
//           + Add Option
//         </button>
//       </div>
//     )}
//   </div>
// ))}




// removed section working
          {/* Render questions and info boxes with separate numbering */}
// {(() => {
//   let questionCount = 0;
//   let infoCount = 0;

//   return formData.questions.map((q, index) => {
//     if (q.question_type === "info") {
//       infoCount++;
//       return (
//         <div key={index} className="question-box info-box">
//           <div className="question-header">
//             <span className="question-label">Info Box {infoCount}</span>
            
//             <button
//               type="button"
//               className="remove-btn"
//               onClick={() => removeQuestion(index)}
//             >
//               ✖
//             </button>
//           </div>

//           <textarea
//             placeholder="Enter info text / section heading"
//             value={q.info_text || ""}
//             onChange={(e) =>
//               handleQuestionChange(index, "info_text", e.target.value)
//             }
//             style={{
//               backgroundColor: "#f9f9f9",
//               fontStyle: "italic",
//               padding: "5px",
//             }}
//           />
//         </div>
//       );
//     } else {
//       questionCount++;
//       return (
//         <div key={index} className="question-box">

//           <div className="question-header">
//             <span className="question-label">Question {questionCount}</span>
//              <button
//         type="button"
//         className="add-duplicate"
//         onClick={() => duplicateQuestion(index)}
//       >
//        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.333 1.33398H6.66634C5.93101 1.33398 5.33301 1.93198 5.33301 2.66732V5.33398H2.66634C1.93101 5.33398 1.33301 5.93198 1.33301 6.66732V13.334C1.33301 14.0693 1.93101 14.6673 2.66634 14.6673H9.33301C10.0683 14.6673 10.6663 14.0693 10.6663 13.334V10.6673H13.333C14.0683 10.6673 14.6663 10.0693 14.6663 9.33398V2.66732C14.6663 1.93198 14.0683 1.33398 13.333 1.33398ZM2.66634 13.334V6.66732H9.33301L9.33434 13.334H2.66634ZM13.333 9.33398H10.6663V6.66732C10.6663 5.93198 10.0683 5.33398 9.33301 5.33398H6.66634V2.66732H13.333V9.33398Z" fill="#262626"></path></svg> Duplicate
//       </button>
//       <button
//         type="button"
//         className="remove-btn"
//         onClick={() => removeQuestion(index)}
//       >
//         ✖
//       </button>
//             <button
//               type="button"
//               className="remove-btn"
//               onClick={() => removeQuestion(index)}
//             >
//               ✖
//             </button>
//           </div>

//           <input
//             type="text"
//             placeholder="Enter question"
//             value={q.question_text}
//             onChange={(e) =>
//               handleQuestionChange(index, "question_text", e.target.value)
//             }
//             required
//           />

//           {/* Question type */}
//           <select
//             value={q.question_type}
//             onChange={(e) =>
//               handleQuestionChange(index, "question_type", e.target.value)
//             }
//           >
//             <option value="multiple_choice">Multiple Choice</option>
//           </select>

//           {/* Options */}
//           {q.question_type === "multiple_choice" && (
//             <div className="options-box">
//               {q.options.map((opt, optIndex) => (
//                 <div key={optIndex} className="option-row">
//                   <input
//                     type="text"
//                     placeholder={`Option ${optIndex + 1}`}
//                     value={opt}
//                     onChange={(e) =>
//                       handleOptionChange(index, optIndex, e.target.value)
//                     }
//                   />
//                   <button
//                     type="button"
//                     className="remove-option-btn"
//                     onClick={() => removeOption(index, optIndex)}
//                   >
//                     ✖
//                   </button>
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 className="add-option-btn"
//                 onClick={() => addOption(index)}
//               >
//                 + Add Option
//               </button>
//             </div>
//           )}
//         </div>
//       );
//     }
//   });
// })()}