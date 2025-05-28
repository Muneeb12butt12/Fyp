import React, { useState, useEffect } from "react";
import Logo from "../../assets/logo.png";
import { IoMdSearch, IoMdPerson } from "react-icons/io";
import { FaShoppingCart, FaUserCircle, FaCaretDown, FaBars, FaTimes } from "react-icons/fa";
import DarkMode from "./DarkMode";
import { useNavigate } from "react-router-dom";
import CartIcon from "../CartIcon";
import CartSidebar from "../CartSidebar";

const Menu = [
  { id: 1, name: "Home", link: "/" },
  { id: 2, name: "About Us", link: "/AboutUs" },
  { id: 3, name: "Blog", link: "/BlogPage" },
  { id: 4, name: "", link: "/#" },
  { id: 5, name: "Products", link: "/Product" },
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
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserDropdown(false);
    navigate('/');
  };

  const UserAvatar = () => {
    if (!user) return null;
    
    const getInitials = () => {
      if (user.firstName && user.lastName) {
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
      }
      return user.email.charAt(0).toUpperCase();
    };

    return (
      <div className="relative">
        <button
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="flex items-center gap-1 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center font-medium hover:shadow-md transition-all">
            {getInitials()}
          </div>
          <FaCaretDown className={`text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showUserDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
              {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
            </div>
            <a
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowUserDropdown(false)}
            >
              My Profile
            </a>
            <a
              href="/orders"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowUserDropdown(false)}
            >
              My Orders
            </a>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40">
      {/* Upper Navbar */}
      <div className="bg-primary/40 py-3">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <div 
            onClick={() => navigate("/")}
            className="font-bold text-2xl sm:text-3xl flex gap-2 items-center cursor-pointer"
          >
            <img src={Logo} alt="Logo" className="w-10" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SportWearXpress
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search (Desktop only) */}
            <div className="relative group hidden sm:block">
              <input
                type="text"
                placeholder="Search sportswear..."
                className="w-[200px] group-hover:w-[300px] transition-all duration-300 rounded-full border border-gray-300 px-4 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-800"
              />
              <IoMdSearch className="text-gray-500 group-hover:text-primary absolute top-1/2 -translate-y-1/2 right-4" />
            </div>

            {/* User Avatar or Sign In */}
            {user ? (
              <UserAvatar />
            ) : (
              <button 
                onClick={() => navigate("/signin")}
                className="hidden sm:flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                <IoMdPerson className="text-xl" />
                <span className="text-sm font-medium">Sign In</span>
              </button>
            )}

            {/* Order Button */}
            <button
              onClick={handleOrderPopup}
              className="hidden sm:flex bg-gradient-to-r from-primary to-secondary text-white py-2 px-4 rounded-full items-center gap-2 group hover:shadow-lg transition-all"
            >
              <span className="group-hover:block hidden text-sm">Order</span>
              <FaShoppingCart className="text-lg" />
            </button>

            {/* Dark Mode */}
            <div className="hidden sm:block">
              <DarkMode />
            </div>

            {/* Mobile Icons */}
            <div className="flex items-center gap-4 sm:hidden">
              {user ? (
                <div onClick={() => navigate('/profile')} className="cursor-pointer">
                  <FaUserCircle className="text-2xl text-primary" />
                </div>
              ) : (
                <button 
                  onClick={() => navigate("/signin")}
                  className="text-gray-700 dark:text-gray-300"
                >
                  <IoMdPerson className="text-xl" />
                </button>
              )}
              <CartIcon />
              <div 
                className="cursor-pointer" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </div>
            </div>
            
            {/* Desktop Cart */}
            <div className="hidden sm:block">
              <CartIcon />
            </div>
          </div>
          <CartSidebar />
        </div>
      </div>
     
      {/* Desktop Menu */}
      <div className="hidden sm:flex justify-center bg-white dark:bg-gray-800 shadow-sm">
        <ul className="flex items-center gap-6">
          {Menu.map((data) => (
            <li key={data.id}>
              <a 
                href={data.link} 
                className="px-4 py-3 hover:text-primary duration-200 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                {data.name}
              </a>
            </li>
          ))}

          {/* Desktop Dropdown */}
          <li className="group relative cursor-pointer">
            <a href="#" className="flex items-center gap-[4px] py-3 px-4 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
              Trending
              <FaCaretDown className="transition-all duration-200 group-hover:rotate-180" />
            </a>
            <div className="absolute hidden group-hover:block bg-white dark:bg-gray-700 text-black dark:text-white rounded-md shadow-lg mt-1 p-2 w-48 z-50 border border-gray-100 dark:border-gray-600">
              <ul>
                {DropdownLinks.map((item) => (
                  <li key={item.id}>
                    <a 
                      href={item.link} 
                      className="block p-2 rounded hover:bg-primary/10 dark:hover:bg-gray-600 transition-colors"
                    >
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
        <div className="sm:hidden bg-white dark:bg-gray-800 px-4 py-4 shadow-inner">
          <ul className="flex flex-col gap-2">
            {Menu.map((data) => (
              <li key={data.id}>
                <a 
                  href={data.link} 
                  className="block py-3 px-2 text-lg hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  {data.name}
                </a>
              </li>
            ))}

            {/* Mobile Dropdown */}
            <li>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-between w-full py-3 px-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <span>Trending</span>
                <FaCaretDown className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>
              {showDropdown && (
                <ul className="mt-1 pl-4 text-base">
                  {DropdownLinks.map((item) => (
                    <li key={item.id}>
                      <a 
                        href={item.link} 
                        className="block py-2 px-2 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
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