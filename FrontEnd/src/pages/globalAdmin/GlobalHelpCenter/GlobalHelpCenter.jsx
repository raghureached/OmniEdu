import React from "react";
import "./GlobalHelpCenter.css";

const GlobalHelpCenter = () => {
  return (
    <div className="globaladmin-help-center">
      <h1> Help Center </h1>{" "}
      <div className="help-sections">
        <section className="help-section">
          <h2> Getting Started </h2>{" "}
          <ul>
            <li> Overview of Global - Admin Dashboard </li>{" "}
            <li> Managing Users and Groups </li>{" "}
            <li> Content Management Basics </li>{" "}
            <li> Assignment Creation Guide </li>{" "}
          </ul>{" "}
        </section>
        <section className="help-section">
          <h2> Frequently Asked Questions </h2>{" "}
          <div className="faq-list">
            <details>
              <summary> How do I create a new user account ? </summary>{" "}
              <p>
                {" "}
                Navigate to Users Management, click "Add New User", and fill in
                the required information.{" "}
              </p>{" "}
            </details>{" "}
            <details>
              <summary> How do I assign content to groups ? </summary>{" "}
              <p>
                {" "}
                Go to Content Modules, select the content, and use the "Assign"
                feature to select target groups.{" "}
              </p>{" "}
            </details>{" "}
            <details>
              <summary> How do I create learning paths ? </summary>{" "}
              <p>
                {" "}
                Access Learning Paths section, click "Create New Path", and
                follow the step - by - step wizard.{" "}
              </p>{" "}
            </details>{" "}
          </div>{" "}
        </section>
        <section className="help-section">
          <h2> Support Resources </h2>{" "}
          <div className="support-links">
            <a href="#" className="support-link">
              Documentation{" "}
            </a>{" "}
            <a href="#" className="support-link">
              {" "}
              Video Tutorials{" "}
            </a>{" "}
            <a href="#" className="support-link">
              {" "}
              Contact Support{" "}
            </a>{" "}
          </div>{" "}
        </section>{" "}
      </div>{" "}
    </div>
  );
};

export default GlobalHelpCenter;
