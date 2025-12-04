import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { authAPI, uploadAPI } from "../services/api";
import { User, Camera, Save, X, AlertCircle, Upload } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "../components/Avatar";
import ImageUploadDialog from "../components/ImageUploadDialog";

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (data) => {
      // Update the user data in AuthContext and query cache
      updateUser(data.data.user);
      queryClient.setQueryData(["user"], data);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { error?: string } } })?.response
            ?.data?.error || "Failed to update profile"
          : "Failed to update profile";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare update data - only include fields that have changed
    const updateData: { avatar?: string; bio?: string } = {};

    if (avatar !== (user?.avatar || "")) {
      updateData.avatar = avatar;
    }

    if (bio !== (user?.bio || "")) {
      updateData.bio = bio;
    }

    // Only submit if there are changes
    if (Object.keys(updateData).length === 0) {
      toast("No changes to save");
      setIsEditing(false);
      return;
    }

    updateProfileMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setAvatar(user?.avatar || "");
    setBio(user?.bio || "");
    setIsEditing(false);
  };

  const handleAvatarUploaded = (imageUrl: string) => {
    setAvatar(imageUrl);
    setIsUploadDialogOpen(false);
    toast.success("Avatar uploaded successfully!");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Not Authenticated
          </h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-gray-900/5 border border-gray-200/50 overflow-hidden">
            {/* Avatar Section */}
            <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-12 text-center">
              <div className="relative inline-block">
                <Avatar
                  src={isEditing ? avatar : user.avatar}
                  alt={`${user.firstName || user.username} avatar`}
                  size="xl"
                  className="ring-4 ring-white shadow-xl"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.username}
              </h2>
              <p className="text-primary-100">{user.email}</p>
            </div>

            {/* Form Section */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                {isEditing && (
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <Camera className="h-4 w-4 mr-2" />
                      Profile Picture
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsUploadDialogOpen(true)}
                      disabled={isUploadingAvatar}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-dashed border-primary-300 rounded-xl text-primary-600 hover:bg-primary-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="h-4 w-4" />
                      <span>
                        {isUploadingAvatar ? "Uploading..." : "Upload Profile Picture"}
                      </span>
                    </button>
                    <p className="mt-2 text-xs text-gray-500">
                      Supports JPEG, PNG, GIF, and WebP (Max 5MB)
                    </p>
                  </div>
                )}

                {/* Bio */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <User className="h-4 w-4 mr-2" />
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    maxLength={500}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 resize-none ${isEditing
                      ? "border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white"
                      : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    placeholder="Tell us about yourself..."
                  />
                  {isEditing && (
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>Share a brief description about yourself</span>
                      <span>{bio.length}/500</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={updateProfileMutation.isPending}
                        className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="h-4 w-4" />
                        <span>
                          {updateProfileMutation.isPending
                            ? "Saving..."
                            : "Save Changes"}
                        </span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/40"
                    >
                      <User className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-gray-900/5 border border-gray-200/50 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Username
                </label>
                <p className="mt-1 text-gray-900 font-medium">
                  {user.username}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="mt-1 text-gray-900 font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  First Name
                </label>
                <p className="mt-1 text-gray-900 font-medium">
                  {user.firstName || "Not set"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Name
                </label>
                <p className="mt-1 text-gray-900 font-medium">
                  {user.lastName || "Not set"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Member Since
                </label>
                <p className="mt-1 text-gray-900 font-medium">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Account Type
                </label>
                <p className="mt-1 text-gray-900 font-medium">
                  {user.isAdmin ? "Administrator" : "User"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onImageUploaded={handleAvatarUploaded}
      />
    </div>
  );
};

export default Profile;
