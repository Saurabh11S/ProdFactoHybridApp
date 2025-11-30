import React from "react";
import { BiSolidUserCircle } from "react-icons/bi";

interface HeaderBarProps {
  pageTitle: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ pageTitle }) => {
  return (
    <div className="flex justify-between items-center px-4 py-2 my-4 shadow-sm">

      <h1 className="text-lg sm:text-2xl font-semibold text-black">{pageTitle}</h1>
      
    
      <div className="flex items-center space-x-2">
        <span className="text-sm sm:text-md font-medium  text-gray-700">Mr. Admin</span>
        <BiSolidUserCircle size={30}  />
      </div>
    </div>

  );
};

export default HeaderBar;
