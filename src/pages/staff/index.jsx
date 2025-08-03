import React, { useState } from 'react';
import Sidebar from './components/sidebar';
import Dashboard from './components/dashboard';
import Project from './components/project';
import Inventory from './product/inventory';
import UserDropdown from './components/user-dropdown';
import { Menu } from 'lucide-react';
import ProductItems from './product/items';
import './staff-dashboard.css';

export default function StaffDashboardMain() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');

    const handleDropdownToggle = (data) => {
        setUserData(data);
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleDropdownClose = () => {
        setIsDropdownOpen(false);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleLogout = () => {
        localStorage.removeItem('user_session');
        window.location.href = '/auth/login';
    };

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'sales':
                return <Project />;
            case 'inventory':
                return <Inventory />;
            case 'product':
                return <ProductItems />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="staff-dashboard bg-gray-50 h-screen flex overflow-hidden">
            {/* Sidebar - Fixed on large screens */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsSidebarOpen} 
                onDropdownToggle={handleDropdownToggle}
                currentPage={currentPage}
                onPageChange={handlePageChange}
            />
            
            {/* Main Content - Scrollable */}
            <div className="flex-1 flex flex-col min-h-0 bg-white">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                    <button 
                        onClick={() => setIsSidebarOpen(true)} 
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">MITE Canteen</h1>
                    <div className="w-6"></div> {/* Spacer for centering */}
                </div>
                
                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    {renderCurrentPage()}
                </div>
            </div>

            {/* User Dropdown - Positioned over dashboard */}
            <UserDropdown 
                isOpen={isDropdownOpen}
                userData={userData}
                onClose={handleDropdownClose}
                onLogout={handleLogout}
            />

            {/* Backdrop for mobile sidebar */}
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                ></div>
            )}
        </div>
    );
} 