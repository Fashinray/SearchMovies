import React from "react";

const Search = ({searchTerm, setSearchTerm}) => {
  return (
    <div className="search my-4">
        <div className="text-white flex gap-3 p-2 rounded-s-sm">
            <i className="fas fa-search p-4"></i>

            <input className="w-full px-4 py-2"
                type="text"
                placeholder="Search through thousands of Movies"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
            />
        </div>
    </div>
  )
}

export default Search