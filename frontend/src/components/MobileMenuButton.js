import React from 'react';
import { useSidebar } from '../context/SidebarContext';

const MobileMenuButton = () => {
  const { isMobileOpen, toggleSidebar } = useSidebar();

  return (
    <button 
      className={`mobile-menu-btn ${isMobileOpen ? 'active' : ''}`}
      onClick={toggleSidebar}
      aria-label="Toggle menu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
};

export default MobileMenuButton;
