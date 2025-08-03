import React, { useState, useEffect } from 'react';
// Icons for the UI
import { 
    Box, ChevronDown, ChevronRight, ChevronsUpDown, Code, Cog, Book, 
    History, Star, Clock, PenTool, BookOpen, MoreHorizontal, Menu, X,
    LayoutDashboard, Utensils, ShoppingCart, Users, MessageSquare, Settings2, LogOut,
    BadgeCheck, Bell, CreditCard, Sparkles, BarChart3, TrendingUp
} from 'lucide-react';


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


// --- Reusable Components ---

// Company Profile at the top of the sidebar
const CompanyProfile = () => (
    <div className="flex items-center justify-between p-1">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <img src="/canteenlogo.png" alt="Canteen Logo" className="w-6 h-6 object-contain" />
            </div>
            <div>
                <p className="font-bold text-gray-900 text-sm">MITE Canteen</p>
                <p className="text-xs text-gray-500">Staff Portal</p>
            </div>
        </div>
    </div>
);

// A container for a section of navigation links
const NavSection = ({ title, children }) => (
    <div className="px-3 py-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</h3>
        <div className="space-y-0.5">
            {children}
        </div>
    </div>
);

// A single navigation item
const NavItem = ({ icon: Icon, label, hasSubmenu = false, isSubItem = false, isCollapsible = false, isOpen = false, onClick = () => {}, isActive = false }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-2 py-1.5 rounded-md transition-colors text-left ${
        isSubItem ? 'pl-6 text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'px-2 text-gray-800 hover:bg-gray-100'
    } ${isActive ? 'bg-orange-100 text-orange-700' : ''}`}>
        {!isSubItem && <Icon size={16} className={`${isActive ? 'text-orange-600' : 'text-gray-500'}`} />}
        <span className="flex-grow font-medium text-sm">{label}</span>
        {isCollapsible && <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        {hasSubmenu && !isCollapsible && <ChevronRight size={14} className="text-gray-400" />}
    </button>
);

// User Profile at the bottom of the sidebar
const UserProfile = ({ onDropdownToggle }) => {
    const [userData, setUserData] = useState({
        email: 'user@canteen.com',
        email_name: 'user',
        avatar: '/'
    });

    useEffect(() => {
        const loadUserData = () => {
            try {
                const userSession = localStorage.getItem('user_session');
                if (userSession) {
                    const session = JSON.parse(userSession);
                    if (session && session.email) {
                        setUserData({
                            email: session.email,
                            email_name: session.email_name || session.email.split('@')[0],
                            avatar: 'https://randomuser.me/api/portraits/lego/8.jpg'
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };
        
        loadUserData();
    }, []);

    const handleProfileClick = () => {
        onDropdownToggle(userData);
    };

    return (
        <div className="p-3 border-t border-gray-200 mb-4">
            <button 
                type="button"
                className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-gray-100 transition-colors"
                onClick={handleProfileClick}
            >
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 rounded-full">
                        <AvatarImage src={userData.avatar} alt={userData.email_name} />
                        <AvatarFallback className="rounded-full bg-orange-100 text-orange-600 text-xs">
                            {userData.email_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-xs leading-tight truncate max-w-[120px]">{userData.email_name}</span>
                        <span className="text-gray-500 text-xs truncate max-w-[120px]">Canteen Staff</span>
                    </div>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
            </button>
        </div>
    );
};

// --- Main Sidebar Component ---
const Sidebar = ({ isOpen, setIsOpen, onDropdownToggle, currentPage, onPageChange }) => {
    const [isDashboardOpen, setIsDashboardOpen] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isOrdersOpen, setIsOrdersOpen] = useState(false);

    const handlePageChange = (page) => {
        onPageChange(page);
    };

    return (
        <aside className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-gray-50 h-full flex flex-col border-r border-gray-200 shadow-sm transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <CompanyProfile />
                <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-800">
                    <X size={20} />
                </button>
            </div>
            <div className="flex-grow py-3 overflow-y-auto">
                <NavSection title="Main Menu">
                    <NavItem 
                        icon={LayoutDashboard} 
                        label="Dashboard" 
                        isCollapsible 
                        isOpen={isDashboardOpen}
                        isActive={currentPage === 'dashboard'}
                        onClick={() => {
                            setIsDashboardOpen(!isDashboardOpen);
                            handlePageChange('dashboard');
                        }}
                    />
                    {isDashboardOpen && (
                        <div className="pl-4 border-l-2 border-gray-200 ml-4">
                            <NavItem 
                                label="Overview" 
                                isSubItem 
                                isActive={currentPage === 'dashboard'}
                                onClick={() => handlePageChange('dashboard')}
                            />
                            <NavItem label="Analytics" isSubItem />
                            <NavItem label="Reports" isSubItem />
                        </div>
                    )}
                    <NavItem 
                        icon={TrendingUp} 
                        label="Sales" 
                        isActive={currentPage === 'sales'}
                        onClick={() => handlePageChange('sales')}
                    />
                    <NavItem 
                        icon={Utensils} 
                        label="Menu Management" 
                        isCollapsible 
                        isOpen={isMenuOpen}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    />
                    {isMenuOpen && (
                        <div className="pl-4 border-l-2 border-gray-200 ml-4">
                            <NavItem label="Add Item" isSubItem />
                            <NavItem label="Edit Items" isSubItem />
                            <NavItem label="Categories" isSubItem />
                        </div>
                    )}
                    <NavItem 
                        icon={ShoppingCart} 
                        label="Orders" 
                        isCollapsible 
                        isOpen={isOrdersOpen}
                        onClick={() => setIsOrdersOpen(!isOrdersOpen)}
                    />
                    {isOrdersOpen && (
                        <div className="pl-4 border-l-2 border-gray-200 ml-4">
                            <NavItem label="New Orders" isSubItem />
                            <NavItem label="In Progress" isSubItem />
                            <NavItem label="Completed" isSubItem />
                        </div>
                    )}
                    <NavItem icon={Users} label="Customers" hasSubmenu />
                    <NavItem icon={MessageSquare} label="Chat Support" hasSubmenu />
                    <NavItem icon={Settings2} label="Settings" hasSubmenu />
                </NavSection>

                <NavSection title="Quick Actions">
                    <NavItem icon={PenTool} label="Today's Special" />
                    <NavItem 
                        icon={Clock} 
                        label="Inventory" 
                        isActive={currentPage === 'inventory'}
                        onClick={() => handlePageChange('inventory')}
                    />
                    <NavItem icon={BookOpen} label="Reports" />
                    <NavItem icon={MoreHorizontal} label="More" />
                </NavSection>
            </div>
            <UserProfile onDropdownToggle={onDropdownToggle} />
        </aside>
    );
};

export default Sidebar; 