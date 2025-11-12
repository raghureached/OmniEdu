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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "20px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "48px 40px",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            textAlign: "center",
            animation: "fadeIn 0.5s ease-in"
          }}>
            <div style={{
              fontSize: "64px",
              marginBottom: "24px",
              animation: "bounce 1s infinite"
            }}>⚠️</div>
            
            <h2 style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#1a202c",
              marginBottom: "12px",
              lineHeight: "1.3"
            }}>Oops! Something went wrong</h2>
            
            <p style={{
              fontSize: "16px",
              color: "#718096",
              marginBottom: "32px",
              lineHeight: "1.6"
            }}>We encountered an unexpected error. Don't worry, your data is safe. Please try refreshing the page or contact our support team if the problem persists.</p>

            <button 
              onClick={() => window.location.reload()}
              onMouseEnter={(e) => {
                e.target.style.background = "linear-gradient(135deg, #5568d3 0%, #6941a0 100%)";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
              }}
              style={{ 
                marginTop: "12px", 
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: "600",
                color: "#fff",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}>
              <span style={{ fontSize: "18px" }}>🔄</span>
              Reload Page
            </button>
          </div>
          
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
