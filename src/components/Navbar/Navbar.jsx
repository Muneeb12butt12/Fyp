import React, { useState } from "react";
import Logo from "../../assets/logo.png";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import { FaCaretDown, FaBars, FaTimes } from "react-icons/fa";
import DarkMode from "./DarkMode";
import { useNavigate } from "react-router-dom";

const Menu = [
  { id: 1, name: "Home", link: "/" },
  { id: 2, name: "Top Rated", link: "/AboutPage" },
  { id: 3, name: "Kids Wear", link: "/signin" },
  { id: 4, name: "Mens Wear", link: "/#" },
  { id: 5, name: "Electronics", link: "/#" },
];

const DropdownLinks = [
  { id: 1, name: "Trending Products", link: "/#" },
  { id: 2, name: "Best Selling", link: "/#" },
  { id: 3, name: "Top Rated", link: "/#" },
];

const Navbar = ({ handleOrderPopup }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40">
      {/* Upper Navbar */}
      <div className="bg-primary/40 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="font-bold text-2xl sm:text-3xl flex gap-2 items-center">
            <img src={Logo} alt="Logo" className="w-10" />
            SportWearXpress
          </a>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search (Desktop only) */}
            <div className="relative group hidden sm:block">
              <input
                type="text"
                placeholder="search"
                className="w-[200px] group-hover:w-[300px] transition-all duration-300 rounded-full border border-gray-300 px-3 py-1 focus:outline-none dark:border-gray-500 dark:bg-gray-800"
              />
              <IoMdSearch className="text-gray-500 group-hover:text-primary absolute top-1/2 -translate-y-1/2 right-3" />
            </div>

            {/* Order Button */}
            <button
              onClick={handleOrderPopup}
              className="bg-gradient-to-r from-primary to-secondary text-white py-1 px-4 rounded-full flex items-center gap-2 group"
            >
              <span className="group-hover:block hidden">Order</span>
              <FaCartShopping className="text-xl" />
            </button>

            {/* Dark Mode */}
            <DarkMode />

            {/* Hamburger Icon (Mobile) */}
            <div className="sm:hidden cursor-pointer" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden sm:flex justify-center">
        <ul className="flex items-center gap-6">
          {Menu.map((data) => (
            <li key={data.id}>
              <a href={data.link} className="px-4 py-2 hover:text-primary duration-200">
                {data.name}
              </a>
            </li>
          ))}

          {/* Desktop Dropdown */}
          <li className="group relative cursor-pointer">
            <a href="#" className="flex items-center gap-[4px] py-2">
              Trending Products
              <FaCaretDown className="transition-all group-hover:rotate-180" />
            </a>
            <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 text-black dark:text-white rounded-md shadow-md mt-2 p-2 w-48 z-50">
              <ul>
                {DropdownLinks.map((item) => (
                  <li key={item.id}>
                    <a href={item.link} className="block p-2 rounded hover:bg-primary/20 dark:hover:bg-gray-700">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-800 px-4 py-4">
          <ul className="flex flex-col gap-4">
            {Menu.map((data) => (
              <li key={data.id}>
                <a href={data.link} className="block py-1 text-lg hover:text-primary">
                  {data.name}
                </a>
              </li>
            ))}

            {/* Mobile Dropdown */}
            <li>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-between w-full text-lg"
              >
                <span>Trending Products</span>
                <FaCaretDown className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>
              {showDropdown && (
                <ul className="mt-2 pl-4 text-base">
                  {DropdownLinks.map((item) => (
                    <li key={item.id}>
                      <a href={item.link} className="block py-1 hover:text-primary">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
