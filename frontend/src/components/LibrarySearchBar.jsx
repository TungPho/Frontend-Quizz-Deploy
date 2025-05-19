import { Search } from "lucide-react";
import { useState } from "react";

// eslint-disable-next-line react/prop-types
const LibrarySearchBar = ({ searchTerm, setSearchTerm }) => {
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    console.log(searchTerm);
  };

  return (
    <div className="relative w-full sm:w-64 md:w-72">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-green-600" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white placeholder-green-500 text-green-800 text-sm"
        placeholder="Search in library..."
        value={searchTerm}
        onChange={handleSearch}
      />
    </div>
  );
};
export default LibrarySearchBar;
