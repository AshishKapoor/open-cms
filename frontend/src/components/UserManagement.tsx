import React, { useState, useEffect, useRef } from "react";
import { User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../services/api";
import Avatar from "./Avatar";
import toast from "react-hot-toast";
import type { User as UserType } from "../types";

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ isOpen, onClose }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot change your own admin status");
      return;
    }

    try {
      setUpdatingUserId(userId);
      const response = await userAPI.updateUserAdminStatus(
        userId,
        !currentStatus
      );

      // Update local state
      setUsers(
        users.map((user) => (user.id === userId ? response.data.user : user))
      );

      toast.success(
        `User ${!currentStatus ? "promoted to" : "demoted from"} admin successfully`
      );
    } catch (error) {
      console.error("Error updating user admin status:", error);
      toast.error("Failed to update user status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden mx-4 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6" />
              <h2 className="text-xl font-bold">User Management</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-500 mb-4">
                Total users: {users.length}
              </div>

              <div className="grid gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      user.id === currentUser?.id
                        ? "border-primary-200 bg-primary-50/30"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar
                          src={user.avatar}
                          alt={`${user.firstName || user.username} avatar`}
                          size="lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">
                              {user.firstName
                                ? `${user.firstName} ${user.lastName || ""}`.trim()
                                : user.username}
                            </h3>
                            {user.id === currentUser?.id && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                You
                              </span>
                            )}
                            {user.isAdmin && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            @{user.username}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Joined {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() =>
                              toggleAdminStatus(user.id, user.isAdmin)
                            }
                            disabled={updatingUserId === user.id}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              user.isAdmin
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {updatingUserId === user.id ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                <span>Updating...</span>
                              </div>
                            ) : user.isAdmin ? (
                              "Remove Admin"
                            ) : (
                              "Make Admin"
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {user.bio && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">{user.bio}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {users.length === 0 && (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
