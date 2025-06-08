import React from 'react';
import Alert, { AlertTypes, AlertProps } from './Alert'; // Assuming you have the Alert component from previous examples
import { useAlertList } from './AlertContext';

// interface AlertsListProps {
//   alerts: AlertProps[];
//   addAlert: (type: AlertTypes, message: string) => void; // Add this prop
// }

const AlertsList: React.FC = () => {
  const { alerts } = useAlertList();

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      {alerts.map((alert: AlertProps, index: any) => (
        <Alert key={index} type={alert.type} message={alert.message} />
      ))}
    </div>
  );
};

export default AlertsList;
