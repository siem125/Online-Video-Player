import React, { useState } from 'react';
import styles from './Alert.module.css';

export enum AlertTypes {
    Success = 'success',
    Danger = 'danger',
    Warning = 'warning',
    Info = 'info',
}

export interface AlertProps {
  type: AlertTypes;
  message: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ type, message }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  const typeClassMap: { [key: string]: string } = {
    success: 'bg-BTSuccess',
    danger: 'bg-BTDanger',
    warning: 'bg-BTWarning',
    info: 'bg-BTInfo',
  };

  const className = typeClassMap[type];

  return (
    <>
      {isVisible && (
        <div className={className} role="alert" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          {message}
          <button type="button" className={styles.closeButton} onClick={handleClose} style={{width: '40px', height: '40px', fontSize: '1.5em', padding: '10px'}}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}
    </>
  );
};

export default Alert;
