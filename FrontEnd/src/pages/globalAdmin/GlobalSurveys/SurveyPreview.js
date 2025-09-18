import React from "react";
import "./SurveyPreview.css";

const SurveyPreview = ({ survey, onClose }) => {
  if (!survey) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h3>Survey Preview: {survey.title}</h3>
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        {/* Body */}
        <div className="preview-body">
          <p><strong>Description:</strong> {survey.description}</p>
          <p><strong>Status:</strong> {survey.is_active ? "Active" : "Inactive"}</p>
          <p><strong>Start Date:</strong> {survey.start_date ? new Date(survey.start_date).toLocaleDateString() : "N/A"}</p>
          <p><strong>End Date:</strong> {survey.end_date ? new Date(survey.end_date).toLocaleDateString() : "N/A"}</p>

          <h4>Questions</h4>
          {survey.questions?.length > 0 ? (
            survey.questions.map((q, index) => (
              <div key={index} className="preview-question">
                <p><strong>Q{index + 1}:</strong> {q.question_text}</p>

                {q.question_type === "text" && (
                  <input type="text" placeholder="Your answer" disabled />
                )}

                {q.question_type === "rating" && (
                  <div>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} style={{ marginRight: "5px" }}>⭐</span>
                    ))}
                  </div>
                )}

                {q.question_type === "multiple_choice" && (
                  <div>
                    {q.options?.map((opt, optIndex) => (
                      <label key={optIndex} style={{ display: "block" }}>
                        <input type="radio" name={`q${index}`} disabled /> {opt}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No questions added.</p>
          )}
        </div>

        {/* Footer */}
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyPreview;
