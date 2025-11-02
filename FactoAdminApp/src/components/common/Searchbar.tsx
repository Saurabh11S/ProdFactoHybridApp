import React from "react";
import { CiSearch } from "react-icons/ci";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onChange }) => {
  return (
    <div className="relative w-full sm:w-3/4 md:w-2/3 lg:w-1/2 max-w-md mx-2">
      <CiSearch
        size={20}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
      />
      <Input
        type="search"
        placeholder="Search"
        className="pl-10 outline-none w-full py-2 rounded-md text-gray-700 placeholder-gray-400"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};

export default SearchBar;
