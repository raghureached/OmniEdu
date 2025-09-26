import React from 'react';

const CustomLoader2 = ({ size = 48, color = '#5570f1' }) => {
  const style = {
    width: size,
    height: size,
    border: `5px solid ${color}`,
    borderTop: `5px solid transparent`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return <div style={style} aria-label="Loading" role="status" />;
};

export default CustomLoader2;
