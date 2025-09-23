const CustomError = ({ error }) => {
    return (
      <div style={{
        maxWidth: '400px',
        margin: '20px auto',
        padding: '16px 24px',
        borderRadius: '8px',
        backgroundColor: '#fdecea',
        color: '#b00020',
        boxShadow: '0 2px 12px rgba(176, 0, 32, 0.2)',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        textAlign: 'center',
        userSelect: 'none',
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontWeight: '700', fontSize: '1.25rem' }}>Error</h2>
        <p style={{ margin: 0, fontSize: '1rem' }}>{error}</p>
      </div>
    );
  };
  
  export default CustomError;
  