// 'use client'

// import SideNav from '@/app/Components/sidenav';
// import React from 'react';
// import { ModalProvider } from '../Components/OldProjects/Modal/ModalContext';
// import CustomModal from '../Components/OldProjects/Modal/Modals/CustomModal';

// export default function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <ModalProvider>
//       <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
//         <div className="w-full flex-none md:w-64">
//           <SideNav />
//         </div>
//         <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
//         <CustomModal />
//       </div>
//     </ModalProvider>
//   );
// }