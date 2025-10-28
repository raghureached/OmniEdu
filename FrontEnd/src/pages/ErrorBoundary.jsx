import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center",
          height: "100vh",
          background: "#f8d7da",
          padding: "20px",
          color: "#721c24",
          textAlign: "center"
        }}>
          <h2>⚠️ OOPS! Something went wrong!</h2>
          <p>Please try refreshing or contact support.</p>

          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: "12px", padding: "10px 20px" }}>
            🔄 Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
