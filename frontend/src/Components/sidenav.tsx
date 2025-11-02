'use client'

import NavLinks from '@/Components/dashboard/nav-links';
import { PowerIcon, PaintBrushIcon, UserIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useModal } from '@/features/Providers/Modal/ModalContext';
import { removeCookie, getCookie } from './utils/cookieUtils';
import ThemeModal from '../features/Providers/ThemeChanger/ThemeModal';
import Icon from '@/Components/CustomIcons/Icon';

import { useAuth } from '@/features/Providers/Keycloak/KeycloakProvider';

const SideNav: React.FC = () => {
  const { openModal } = useModal(); 
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [hasAdminRights, setHasAdminRights] = useState(false);
  const router = useRouter();
  
  const { keycloak, user } = useAuth();
   
  const handleKeycloakLogout = () => {
    //removeCookie("projectID");
    //removeCookie("UserID");

    keycloak.logout({
      redirectUri: "http://localhost:3000"
    });
};

  // Fetch user data to check for alterationRights
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // const cookieUsername = getCookie('authToken');
        const response = await fetch(`/api/userData?userId=${user?.uniqueID}`);
        if (!response.ok) throw new Error('Failed to fetch user data');

        const userData = await response.json();

        
        setHasAdminRights(userData?.isAdmin || false);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleOpenThemeModal = () => {
    openModal(() => <ThemeModal />, {width: "50%", height: "50%", showCloseButton: true});
  };

  const handleAdminRedirect = () => {
    router.push('/Admin');
  };

  const handleCreateRedirect = () => {
    router.push('/Dashboard/CreateSeries');
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

          <button onClick={handleKeycloakLogout}>
            <PowerIcon className="w-6" />
            <span className="hidden md:block">Sign Out</span>
          </button>
        </div>
      )}

      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md md:block"></div>
        <button className='sidenav-btn' onClick={handleCreateRedirect}>
          <PowerIcon className="w-6" />
          <span className="hidden md:block">Create Series</span>
        </button>
        <button className='sidenav-btn' onClick={handleAdminRedirect}>
          <PowerIcon className="w-6" />
          <span className="hidden md:block">Admin page</span>
        </button>
      </div>
    </div>
  );
};

export default SideNav;
