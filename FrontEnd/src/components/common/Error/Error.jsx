import './Error.css'
const CustomError = ({ error }) => {
    return (
      <div className="custom-error">
        <p style={{ textAlign: 'center' }}>{error}</p>
      </div>
    );
  };
  
  export default CustomError;
  