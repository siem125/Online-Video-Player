'use client'

import SideNav from '@/app/Components/sidenav';
import React from 'react';
import { ModalProvider } from '../Components/Modal/ModalContext';
import CustomModal from '../Components/Modal/Modals/CustomModal';
import { AlertListProvider } from '../Components/Alert/AlertContext';
import AlertsList from '../Components/Alert/AlertsList';
import { ThemeProvider } from '../Components/ThemeChanger/ThemeContext'; // Import ThemeContext for theme management

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <ModalProvider>
        <AlertListProvider>
          <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
              <div className="w-full flex-none md:w-64">
              <SideNav />
              </div>
              <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
              <div className="absolute top-0 right-0 mt-6 mr-6"> {/* Position the alerts */}
                <AlertsList /> {/* Assuming AlertsList is rendered here */}
              </div>
          </div>
          <CustomModal />
        </AlertListProvider>
      </ModalProvider>
    </ThemeProvider>
  );
}