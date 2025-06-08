'use client'

import AdminNavLinks from '@/app/Components/dashboard/admin-nav-links';
import { PowerIcon, PaintBrushIcon, UserIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useModal } from '@/app/Components/Modal/ModalContext';
import { removeCookie, getCookie } from './utils/cookieUtils';
import ThemeModal from './ThemeChanger/ThemeModal';
import Icon from '@/app/Components/CustomIcons/Icon';

const logoutClickEvent = () => {
  removeCookie("projectID");
  removeCookie("UserID");
};

const AdminSideNav: React.FC = () => {
  const { openModal } = useModal(); 
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  // Fetch user data to check for alterationRights
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cookieUsername = getCookie('authToken') || 'Guest';
        const response = await fetch(`/api/userData?username=${cookieUsername}`);
        if (!response.ok) throw new Error('Failed to fetch user data');

        const userData = await response.json();
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleOpenModal = () => {
    openModal(() => (
      <div>
        <h2 style={{ color: 'green' }}>Logout Content</h2>
        <p>This is the content of the modal for logging out.</p>
        <a href="/api/auth/logout">
          <button type='button' onClick={logoutClickEvent} className="bg-BTDanger hover:bg-BTDanger-dark px-4 py-2 rounded-md mt-4">
            Sign-Out
          </button>
        </a>
      </div>
    ), {width: "50%", height: "50%", showCloseButton: true});
  };

  const handleOpenThemeModal = () => {
    openModal(() => <ThemeModal />, {width: "50%", height: "50%", showCloseButton: true});
  };

  const handleBackRedirect = () => {
    router.push('/Dashboard');
  };

  return (
    <div className="sidenav-container">
      <button className="sidenav-profile-btn" onClick={() => setDropdownOpen(!isDropdownOpen)}>
        <Icon name='CodeRecreation' className="w-full h-full" />
      </button>

      {isDropdownOpen && (
        <div className="sidenav-dropdown">
          <button onClick={() => console.log('Account Clicked')}>
            <UserIcon className='w-6' />
            <span className="hidden md:block">Account</span>
          </button>

          <button onClick={handleOpenThemeModal}>
            <PaintBrushIcon className='w-6' />
            <span className="hidden md:block">Change Theme</span>
          </button>

          <button onClick={handleOpenModal}>
            <PowerIcon className="w-6" />
            <span className="hidden md:block">Sign Out</span>
          </button>
        </div>
      )}

      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <AdminNavLinks />
        <div className="hidden h-auto w-full grow rounded-md md:block"></div>

        <button className='sidenav-btn' onClick={handleBackRedirect}>
          <PowerIcon className="w-6" />
          <span className="hidden md:block">Back to viewer mode</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSideNav;
