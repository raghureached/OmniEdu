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
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "20px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Animated Background Circles */}
          <div style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "300px",
            height: "300px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            animation: "float 6s ease-in-out infinite"
          }}></div>
          <div style={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: "200px",
            height: "200px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            animation: "float 8s ease-in-out infinite reverse"
          }}></div>

          <div style={{
            background: "#fff",
            borderRadius: "24px",
            padding: "48px 40px",
            maxWidth: "560px",
            width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            textAlign: "center",
            animation: "fadeInUp 0.6s ease-out",
            position: "relative",
            zIndex: 1
          }}>
            {/* Custom SVG Illustration */}
            <div style={{ marginBottom: "32px" }}>
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: "pulse 2s ease-in-out infinite" }}>
                {/* Browser Window */}
                <rect x="20" y="40" width="160" height="120" rx="8" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2"/>
                <rect x="20" y="40" width="160" height="24" rx="8" fill="#667eea"/>
                <circle cx="35" cy="52" r="4" fill="#FCA5A5"/>
                <circle cx="48" cy="52" r="4" fill="#FCD34D"/>
                <circle cx="61" cy="52" r="4" fill="#86EFAC"/>
                
                {/* Error Symbol - X */}
                <circle cx="100" cy="110" r="35" fill="#FEE2E2" stroke="#EF4444" strokeWidth="3"/>
                <line x1="85" y1="95" x2="115" y2="125" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
                <line x1="115" y1="95" x2="85" y2="125" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
                
                {/* Floating Error Particles */}
                <circle cx="50" cy="90" r="3" fill="#EF4444" opacity="0.6">
                  <animate attributeName="cy" values="90;70;90" dur="3s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="150" cy="100" r="3" fill="#EF4444" opacity="0.6">
                  <animate attributeName="cy" values="100;80;100" dur="4s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="4s" repeatCount="indefinite"/>
                </circle>
                <circle cx="70" cy="130" r="3" fill="#EF4444" opacity="0.6">
                  <animate attributeName="cy" values="130;110;130" dur="3.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3.5s" repeatCount="indefinite"/>
                </circle>
                
                {/* Warning Lines at Bottom */}
                <rect x="40" y="175" width="40" height="4" rx="2" fill="#F59E0B" opacity="0.7"/>
                <rect x="90" y="175" width="60" height="4" rx="2" fill="#F59E0B" opacity="0.7"/>
                <rect x="160" y="175" width="20" height="4" rx="2" fill="#F59E0B" opacity="0.7"/>
              </svg>
            </div>

            <h2 style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#1a202c",
              marginBottom: "12px",
              lineHeight: "1.3",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>Oops! Something Went Wrong</h2>

            <p style={{
              fontSize: "16px",
              color: "#718096",
              marginBottom: "32px",
              lineHeight: "1.6"
            }}>
              We encountered an unexpected error. Don't worry, your data is safe. 
              Please try refreshing the page or contact our support team if the problem persists.
            </p>

            {/* Error Details (collapsed by default) */}
            {this.state.error && (
              <details style={{
                marginBottom: "24px",
                textAlign: "left",
                background: "#F9FAFB",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB"
              }}>
                <summary style={{
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "#4B5563",
                  fontSize: "14px",
                  marginBottom: "8px"
                }}>View Error Details</summary>
                <pre style={{
                  fontSize: "12px",
                  color: "#EF4444",
                  overflow: "auto",
                  maxHeight: "150px",
                  margin: "8px 0 0 0",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap"
            }}>
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
                  padding: "14px 32px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#fff",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 12C4 7.58172 7.58172 4 12 4C14.5264 4 16.7792 5.17107 18.2454 7M20 12C20 16.4183 16.4183 20 12 20C9.47362 20 7.22075 18.8289 5.75463 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M17 3L18 7L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 21L6 17L10 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Reload Page
              </button>

              <button 
                onClick={() => window.location.href = '/'}
                onMouseEnter={(e) => {
                  e.target.style.background = "#F3F4F6";
                  e.target.style.borderColor = "#9CA3AF";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#fff";
                  e.target.style.borderColor = "#E5E7EB";
                }}
                style={{ 
                  padding: "14px 32px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#4B5563",
                  background: "#fff",
                  border: "2px solid #E5E7EB",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12L3 9C3 6.79086 4.79086 5 7 5H17C19.2091 5 21 6.79086 21 9V15C21 17.2091 19.2091 19 17 19H13M3 12L7 16M3 12L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Go Home
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeInUp {
              from { 
                opacity: 0; 
                transform: translateY(30px); 
              }
              to { 
                opacity: 1; 
                transform: translateY(0); 
              }
            }
            @keyframes pulse {
              0%, 100% { 
                transform: scale(1); 
              }
              50% { 
                transform: scale(1.05); 
              }
            }
            @keyframes float {
              0%, 100% { 
                transform: translateY(0) translateX(0); 
              }
              50% { 
                transform: translateY(-20px) translateX(10px); 
              }
            }
            details summary::-webkit-details-marker {
              display: none;
            }
            details summary::before {
              content: '▶ ';
              display: inline-block;
              transition: transform 0.2s;
            }
            details[open] summary::before {
              transform: rotate(90deg);
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;