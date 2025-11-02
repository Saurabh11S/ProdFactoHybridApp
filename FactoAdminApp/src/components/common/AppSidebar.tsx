import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RxDashboard } from "react-icons/rx";
import logo from '../../assets/logo.png'
import { LuChevronsLeft } from "react-icons/lu";
import { LuChevronsRight } from "react-icons/lu";
import { HiOutlineQuestionMarkCircle, HiOutlineUsers } from "react-icons/hi2";
import { MdOutlineMiscellaneousServices,MdOutlineLibraryBooks,MdOutlineNotificationsActive  } from "react-icons/md";
import { PiReadCvLogoLight } from "react-icons/pi";
import { GoQuestion } from "react-icons/go";
import { GrUserWorker } from "react-icons/gr";
import { MdOutlineAddIcCall } from "react-icons/md";




interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: MenuItem[];
}

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { key: '1', label: 'Dashboard', icon: <RxDashboard size={20} />, path: '/dashboard' },
    { key: '2', label: 'Users', icon: <HiOutlineUsers size={20} />, path: '/users' },
    { key: '10', label: 'Quotations', icon: <HiOutlineQuestionMarkCircle size={20}/>, path: '/quotations' },
    {
      key: '3',
      label: 'Services',
      icon: <MdOutlineMiscellaneousServices size={20} />,
      path: '/services',
      // children: [
      //   { key: '3-1', label: 'Class', path: '/classes' },
      //   { key: '3-2', label: 'Section', path: '/section' },
      //   { key: '3-3', label: 'Session', path: '/session' },
      // ],
    },
    { key: '4', label: 'Courses', icon: <MdOutlineLibraryBooks size={20} />, path: '/courses' },
    { key: '5', label: 'Employee', icon: <GrUserWorker size={20} />, path: '/employee' },
    { key: '6', label: 'Call Requests', icon: <MdOutlineAddIcCall size={20} />, path: '/requests' },
    { key: '7', label: 'Blogs', icon: <PiReadCvLogoLight size={20} />, path: '/blogs' },
    { key: '8', label: 'Notifications', icon: <MdOutlineNotificationsActive  size={20} />, path: '/notifications' },
    { key: '9', label: 'Query', icon: <GoQuestion size={20} />, path: '/query' },

  ];

  const renderMenuItem = (item: MenuItem) => {
    if (item.children) {
      return (
        <div key={item.key} className="group">
          <div className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#253483]">
            {item.icon}
            {!collapsed && <span className="ml-4">{item.label}</span>}
          </div>
          <div className="ml-6 mt-2">
            {item.children.map((child) => (
              <div
                key={child.key}
                onClick={() => navigate(child.path)}
                className={`px-4 py-1 cursor-pointer hover:bg-[#253483] rounded ${
                  location.pathname === child.path ? 'bg-gray-200 font-bold' : ''
                }`}
              >
                {!collapsed && child.label}
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div
          key={item.key}
          onClick={() => navigate(item.path)}
          className={`flex items-center px-4 py-2 cursor-pointer hover:bg-[#3246aa] hover:text-white ${
            location.pathname === item.path ? 'bg-[#253483] text-white font-bold' : ''
          }`}
        >
          {item.icon}
          {!collapsed && <span className="ml-4">{item.label}</span>}
        </div>
      );
    }
  };

  return (
    <div className={`flex flex-col h-screen bg-[#DDE2FF] border-r ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
    
      <div className="flex items-center justify-between p-4 border-b">
          <img src={logo}/>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className=" text-gray-600 hover:animate-out rounded text-right"
        >
          {collapsed ? <LuChevronsRight size={20} /> : <LuChevronsLeft size={20} />}
        </button>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto">
        {menuItems.map((item) => renderMenuItem(item))}
      </div>
    </div>
  );
};

export default Sidebar;
