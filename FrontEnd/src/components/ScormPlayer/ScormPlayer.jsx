import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
export const BACKEND_URL = "http://localhost:5003";


export default function Player() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state?.url) navigate("/modules");
  }, []);
//   console.log("Player state:", state);
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <iframe
        src={`${BACKEND_URL}${state?.url || ''}`}
        title="SCORM Player"
        style={{
          width: "100%",
          height: "100%",
          border: "none"
        }}
        allow="fullscreen"
      />
    </div>
  );
}
