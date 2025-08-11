// AlertListContext.tsx
import React, { createContext, useContext, useState } from 'react';
import AlertsList from './AlertsList';
import { AlertProps, AlertTypes } from './Alert';

// Create context
const AlertListContext = createContext<any>(null);

// Custom hook to consume the context
export const useAlertList = () => useContext(AlertListContext);

// Context provider
export const AlertListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertProps[]>([]);

  // Function to add alert
  const addAlert = (type: AlertTypes, message: React.ReactNode) => {
    const newAlerts = [...alerts, { type, message }];
    setAlerts(newAlerts);
  };

  return (
    <AlertListContext.Provider value={{ alerts, addAlert }}>
      {/* <AlertsList alerts={alerts} addAlert={addAlert} /> */} { /* this would show the alerts on top of the website(not page but above content) */}
      {children}
    </AlertListContext.Provider>
  );
};
