// src/components/products/SearchInput.jsx
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchInput = ({ value, onChange }) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search products..."
        className="pl-8"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchInput;
