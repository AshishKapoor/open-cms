import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useZenMode } from "../context/ZenModeContext";
import Avatar from "./Avatar";
import NewsletterSubscriptionForm from "./NewsletterSubscriptionForm";
import {
  LogOut,
  User,
  Home,
  Menu,
  X,
  ChevronDown,
  MessageCircleIcon,
  UserCogIcon,
  Users,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isZenMode } = useZenMode();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      {/* Navigation */}
      {!isZenMode && (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg shadow-gray-900/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <Link
                to="/"
                className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105"
              >
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="Sannty Logo"
                    className="h-8 w-8 transition-transform duration-300 group-hover:rotate-12"
                  />
                  <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-lg scale-0 group-hover:scale-150 transition-transform duration-300"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 bg-clip-text text-transparent">
                  Sannty
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden lg:flex items-center space-x-1">
                <Link
                  to="/"
                  className="group flex items-center space-x-2 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 relative"
                >
                  <MessageCircleIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-medium">Posts</span>
                </Link>

                <Link
                  to="/docs"
                  className="group flex items-center space-x-2 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 relative"
                >
                  <svg className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="font-medium">Docs</span>
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="group flex items-center space-x-2 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 relative"
                    >
                      <UserCogIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                      <span className="font-medium">Posts Panel</span>
                    </Link>

                    {user?.isAdmin && (
                      <>
                        <Link
                          to="/admin/documentation"
                          className="group flex items-center space-x-2 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 relative"
                        >
                          <svg className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="font-medium">Docs Panel</span>
                        </Link>

                        <button
                          onClick={() => navigate("/dashboard?tab=users")}
                          className="group flex items-center space-x-2 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 relative"
                        >
                          <Users className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                          <span className="font-medium">Users</span>
                        </button>

                        {/* <Link
                          to="/dashboard?tab=newsletter"
                          className="group flex items-center space-x-2 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 relative"
                        >
                          <Mail className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                          <span className="font-medium">Newsletter</span>
                        </Link> */}
                      </>
                    )}
                    {/* {user?.isAdmin && (
                      <Link
                        to="/create"
                        className="group flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/40 hover:scale-105"
                      >
                        <Plus className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
                        <span className="font-semibold">Write</span>
                      </Link>
                    )} */}

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={toggleUserMenu}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        <Avatar
                          src={user?.avatar}
                          alt={`${user?.firstName || user?.username} avatar`}
                          size="lg"
                        />
                        <div className="hidden xl:block text-left">
                          <div className="text-sm font-medium text-gray-900">
                            {user?.firstName || user?.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user?.email}
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      {/* User Dropdown */}
                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="text-sm font-medium text-gray-900">
                              {user?.firstName || user?.username}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </div>
                          </div>
                          <Link
                            to="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 group"
                          >
                            <User className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            <span className="font-medium">Profile</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 group"
                          >
                            <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            <span className="font-medium">Sign out</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/login"
                      className="px-6 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 font-medium"
                    >
                      Sign in
                    </Link>
                    {/* <Link
                    to="/register"
                    className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/40 hover:scale-105 font-semibold"
                  >
                    Get Started
                  </Link> */}
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="p-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-6 space-y-2">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200"
                  >
                    <Home className="h-5 w-5" />
                    <span className="font-medium">Home</span>
                  </Link>

                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200"
                      >
                        <UserCogIcon className="h-5 w-5" />
                        <span className="font-medium">Admin Panel</span>
                      </Link>

                      {user?.isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              navigate("/dashboard?tab=users");
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200"
                          >
                            <Users className="h-5 w-5" />
                            <span className="font-medium">Manage Users</span>
                          </button>

                          {/* <Link
                            to="/dashboard?tab=newsletter"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200"
                          >
                            <Mail className="h-5 w-5" />
                            <span className="font-medium">Newsletter</span>
                          </Link> */}
                        </>
                      )}
                      {/* {user?.isAdmin && (
                        <Link
                          to="/create"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-primary-600/25"
                        >
                          <Plus className="h-5 w-5" />
                          <span className="font-semibold">Write</span>
                        </Link>
                      )} */}
                      <div className="border-t border-gray-200/50 pt-4 mt-4">
                        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-50/50">
                          <Avatar
                            src={user?.avatar}
                            alt={`${user?.firstName || user?.username} avatar`}
                            size="sm"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user?.firstName || user?.username}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user?.email}
                            </div>
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full flex items-center space-x-3 px-4 py-3 mt-2 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200"
                        >
                          <User className="h-5 w-5" />
                          <span className="font-medium">Profile</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 mt-2 rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50/50 transition-all duration-200"
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="font-medium">Sign out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2 border-t border-gray-200/50 pt-4 mt-4">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 rounded-xl text-center text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 font-medium"
                      >
                        Sign in
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-50/30 to-transparent pointer-events-none"></div>
        <div className="relative">{children}</div>
      </main>

      {/* Footer */}
      {!isZenMode && (
        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 mt-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-6 md:mb-0 group">
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="Sannty Logo"
                    className="h-8 w-8 transition-transform duration-300 group-hover:rotate-12"
                  />
                  <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-lg scale-0 group-hover:scale-150 transition-transform duration-300"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 bg-clip-text text-transparent">
                  Sannty
                </span>
              </div>
              {/* Newsletter Subscription */}
              <div className="max-w-sm mx-auto">
                <NewsletterSubscriptionForm showTitle={false} compact={true} />
              </div>
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <span>© {new Date().getFullYear()} Sannty.</span>
                <span>Built with ❤️</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
