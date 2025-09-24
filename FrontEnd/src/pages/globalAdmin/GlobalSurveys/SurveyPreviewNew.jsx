// import React from "react";
// import "./SurveyPreviewNew.css"; // Use this for the sleek card UI

// const SurveyPreview = ({formData, onClosePreview}) => (
//   <div className="Survey-preview-overlay">
//     <div className="Survey-preview-header">
//       <span className="Survey-preview-class-label">Class name</span>
//       <button className="Survey-close-preview-btn" onClick={onClosePreview}>
//         Close Preview (Esc)
//       </button>
//     </div>
//     <div className="Survey-preview-survey-card">
//       <h2>{formData.title}</h2>
//       <div>{formData.description}</div>
//     </div>
//     {formData.questions.map((q, index) => (
//       <div className="Survey-preview-question-card" key={index}>
//         <div className="Survey-preview-question-text">{q.question_text}</div>
//         <div className="Survey-preview-options-list">
//           {q.options.map((opt, i) => (
//             <div className="Survey-preview-option-row" key={i}>
//               <input type="checkbox" disabled />
//               <span>{opt}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     ))}
//   </div>
// );
// export default SurveyPreview;
// import React from "react";
// import "./SurveyPreviewNew.css";

// const SurveyPreview = ({ formData, onClosePreview }) => (
//   <div className="Survey-preview-overlay">
//     <div className="Survey-preview-header">
//       <span className="Survey-preview-class-label">{<h2>{formData.title}</h2>}</span>
//       <button className="Survey-close-preview-btn" onClick={onClosePreview}>
//         ❌ Close Preview
//       </button>
//     </div>

//     <div className="Survey-preview-survey-card">

//       {/* <h2>{formData.title}</h2> */}
      
//        <h3>Description:</h3>
//         <p>{formData.description}</p>
      
     
   
//     </div>
    

//     {formData.questions.map((q, index) => (
//       <div className="Survey-preview-question-card" key={index}>
//         <div className="Survey-preview-question-text">Q{index+1}. {q.question_text}</div>
//         <div className="Survey-preview-options-list">
//           {q.options.map((opt, i) => (
//             <div className="Survey-preview-option-row" key={i}>
//               <input type="checkbox" disabled />
//               <span>{opt}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     ))}
//   </div>
// );

// export default SurveyPreview;


// working now
// import React from "react";
// import "./SurveyPreviewNew.css";

// const SurveyPreview = ({ formData, onClosePreview }) => (
//   <div className="Survey-preview-overlay">
//     <div className="Survey-preview-header">
//       <span className="Survey-preview-class-label">
//         <h2>{formData.title}</h2>
//       </span>
//       <button className="Survey-close-preview-btn" onClick={onClosePreview}>
//         ❌ Close Preview
//       </button>
//     </div>

//     <div className="Survey-preview-survey-card">
//       <h3>Description:</h3>
//       <p>{formData.description}</p>
//     </div>

//     {formData.questions.map((q, index) => {
//       if (q.question_type === "info") {
//         // ✅ Render info boxes as section headers
//         return (
//           <div key={index} className="Survey-preview-info-box">
//             <h3 className="Survey-preview-info-heading">{q.info_text}</h3>
//           </div>
//         );
//       }

//       // Render normal questions
//       return (
//         <div className="Survey-preview-question-card" key={index}>
//           <div className="Survey-preview-question-text">
//             Q{index + 1}. {q.question_text}
//           </div>
//           <div className="Survey-preview-options-list">
//             {q.options.map((opt, i) => (
//               <div className="Survey-preview-option-row" key={i}>
//                 <input type="checkbox" disabled />
//                 <span>{opt}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       );
//     })}
//   </div>
// );

// export default SurveyPreview;
// import React, { useState } from "react";
// import "./SurveyPreviewNew.css";

// const SurveyPreview = ({ formData, onClosePreview }) => {
//   // State to track which info boxes are open
//   const [openInfoIndex, setOpenInfoIndex] = useState(null);

//   const toggleInfoBox = (index) => {
//     if (openInfoIndex === index) {
//       setOpenInfoIndex(null); // close if already open
//     } else {
//       setOpenInfoIndex(index); // open this info box
//     }
//   };

//   return (
//     <div className="Survey-preview-overlay">
//       <div className="Survey-preview-header">
//         <span className="Survey-preview-class-label">
//           <h2>{formData.title}</h2>
//         </span>
//         <button className="Survey-close-preview-btn" onClick={onClosePreview}>
//           ❌ Close Preview
//         </button>
//       </div>

//       <div className="Survey-preview-survey-card">
//         <h3>Description:</h3>
//         <p>{formData.description}</p>
//       </div>

//       {formData.questions.map((q, index) => {
//         if (q.question_type === "info") {
//           return (
//             <div key={index} className="Survey-preview-info-box">
//               <button
//                 className="info-box-toggle"
//                 onClick={() => toggleInfoBox(index)}
//               >
//                 ?
//               </button>
//               {openInfoIndex === index && (
//                 <div className="Survey-preview-info-text">{q.question_text}</div>
//               )}
//             </div>
//           );
//         }

//         // Render normal questions
//         return (
//           <div className="Survey-preview-question-card" key={index}>
//             <div className="Survey-preview-question-text">
//               Q{index + 1}. {q.question_text}
//             </div>
//             <div className="Survey-preview-options-list">
//               {q.options.map((opt, i) => (
//                 <div className="Survey-preview-option-row" key={i}>
//                   <input type="checkbox" disabled />
//                   <span>{opt}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default SurveyPreview;
// import React, { useState } from "react";
// import "./SurveyPreviewNew.css";

// const SurveyPreview = ({ formData, onClosePreview }) => {
//   const [openInfoIndex, setOpenInfoIndex] = useState(null);

//   // const toggleInfoBox = (index) => {
//   //   setOpenInfoIndex(openInfoIndex === index ? null : index);
//   // };

//   return (
//     <div className="Survey-preview-overlay">
//       {/* Header */}
//       <div className="Survey-preview-header">
//       <div className="Survey-preview-class-label">
//         <h2>{formData.title}</h2>
//         </div>
//         <button className="Survey-close-preview-btn" onClick={onClosePreview}>
//           ❌ Close Preview
//         </button>
      
// </div>
//       {/* Description */}
//       {formData.description && (
//         <div className="Survey-preview-survey-card">
//           <h3>Description:</h3>
//           <p>{formData.description}</p>
//         </div>
//       )}

//       {/* Questions */}
//       {formData.questions.map((q, index) => {
//         if (q.question_type === "info") {
//           return (
//             <div key={index} className="Survey-preview-question-card">
//               <div className="info-box-header" onClick={() => toggleInfoBox(index)}>
//                 <strong>{q.question_text.charAt(0).toUpperCase() + q.question_text.slice(1)}</strong>
//                 <span className="info-toggle-btn">{openInfoIndex === index ? "▲" : "▼"}</span>
//               </div>
//               {openInfoIndex === index && (
//                 <div className="Survey-preview-info-text">{q.info_text}</div>
//               )}
//             </div>
//           );
//         }

//         // Normal question card
//         return (
//           <div className="Survey-preview-question-card" key={index}>
//             <div className="Survey-preview-question-text">
//               Q{index + 1}. {q.question_text}
//             </div>
//             <div className="Survey-preview-options-list">
//               {q.options.map((opt, i) => (
//                 <div className="Survey-preview-option-row" key={i}>
//                   <input type="checkbox" disabled />
//                   <span>{opt}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default SurveyPreview;

import React from "react";
import "./SurveyPreviewNew.css";

const SurveyPreview = ({ formData, onClosePreview }) => {
  let questionNumber = 0;

  return (
    <div className="Survey-preview-overlay">
      {/* Header */}
      <div className="Survey-preview-header">
        <div className="Survey-preview-class-label">
          <h2>{formData.title}</h2>
        </div>
        <button className="Survey-close-preview-btn" onClick={onClosePreview}>
          ❌ Close Preview
        </button>
      </div>

      {/* Description */}
      {formData.description && (
        <div className="Survey-preview-survey-card">
          <h3>Description:</h3>
          <p>{formData.description}</p>
        </div>
      )}

      {/* Render questions & info boxes in the same style */}
      {formData.questions.map((q, index) => {
        if (q.question_type === "info") {
          return (
            <div key={index} className="Survey-preview-question-card info-box">
              <div className="Survey-preview-info-text">
                <h4>{q.question_text}</h4>
              
              </div>
                <p>{q.info_text}</p>
            </div>
          );
        } else {
          questionNumber++;
          return (
            <div className="Survey-preview-question-card" key={index}>
              <div className="Survey-preview-question-text">
                Q{questionNumber}. {q.question_text}
              </div>
              <div className="Survey-preview-options-list">
                {q.options.map((opt, i) => (
                  <div className="Survey-preview-option-row" key={i}>
                    <input type="checkbox" disabled />
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};

export default SurveyPreview;

