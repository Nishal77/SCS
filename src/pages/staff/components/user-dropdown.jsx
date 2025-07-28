import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart3, Cog, BookOpen, LogOut } from 'lucide-react';

const UserDropdown = ({ isOpen, userData, onClose, onLogout }) => {
    if (!isOpen || !userData) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 z-40" 
                onClick={onClose}
            />
            
            {/* Dropdown Menu */}
            <div className="fixed bottom-2 ml-2 left-4 lg:left-64 z-50 w-64 rounded-xl border border-gray-200 bg-white shadow-xl p-2 mb-4 lg:mb-2">
                <div className="flex items-center gap-3 px-3 py-3 text-left border-b border-gray-100">
                    <Avatar className="h-10 w-10 rounded-full">
                        <AvatarImage src={userData.avatar} alt={userData.email_name} />
                        <AvatarFallback className="rounded-full bg-orange-100 text-orange-600 text-sm">
                            {userData.email_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-semibold text-base text-gray-900">{userData.email_name}</span>
                        <span className="truncate text-xs text-gray-500">{userData.email}</span>
                        <span className="truncate text-xs text-gray-400 mt-0.5">Canteen Staff</span>
                    </div>
                </div>
                
                <div className="py-1">
                    <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                        <BarChart3 className="mr-2 h-5 w-5 text-gray-500" />
                        <span>Reports</span>
                    </button>
                    <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                        <Cog className="mr-2 h-5 w-5 text-gray-500" />
                        <span>Settings</span>
                    </button>
                    <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        <span>Help</span>
                    </button>
                </div>
                
                <div className="border-t border-gray-100 pt-1">
                    <button 
                        onClick={onLogout}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <LogOut className="mr-2 h-5 w-5 text-gray-500" />
                        <span>Log out</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default UserDropdown; 