"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

interface User {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  img?: string;
  cover?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export default function EditProfileModal({ isOpen, onClose, currentUser }: EditProfileModalProps) {
  const queryClient = useQueryClient();
  
  // Form state
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [location, setLocation] = useState(currentUser?.location || "");
  const [website, setWebsite] = useState(currentUser?.website || "");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Reset form when modal opens with new user data
  useEffect(() => {
    if (isOpen && currentUser) {
      setDisplayName(currentUser.displayName || "");
      setBio(currentUser.bio || "");
      setLocation(currentUser.location || "");
      setWebsite(currentUser.website || "");
      setProfileImage(null);
      setCoverImage(null);
      setProfileImagePreview("");
      setCoverImagePreview("");
      setSuccessMessage("");
    }
  }, [isOpen, currentUser]);

  // Handle profile image upload
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cover image upload
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', currentUser?.username] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        onClose();
      }, 1000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append('displayName', displayName);
      formData.append('bio', bio);
      formData.append('location', location);
      formData.append('website', website);
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      await updateProfileMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccessMessage("");
    setProfileImagePreview("");
    setCoverImagePreview("");
    setProfileImage(null);
    setCoverImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Edit profile</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Error Display */}
        {updateProfileMutation.error && (
          <div className="mx-4 mt-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-400 text-sm">
            {updateProfileMutation.error.message}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mx-4 mt-4 p-3 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg text-green-400 text-sm">
            {successMessage}
          </div>
        )}

        {/* Cover Image Section */}
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 relative overflow-hidden">
            {coverImagePreview ? (
              <Image src={coverImagePreview} alt="Cover preview" fill className="object-cover" />
            ) : currentUser?.cover ? (
              <Image src={currentUser.cover} alt="Cover" fill className="object-cover" />
            ) : null}
            
            {/* Cover image upload button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <label className="p-3 rounded-full bg-black bg-opacity-60 hover:bg-opacity-80 cursor-pointer transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Profile Image Section */}
          <div className="absolute -bottom-12 left-4">
            <div className="relative w-24 h-24 rounded-full border-4 border-black bg-gray-600 overflow-hidden">
              {profileImagePreview ? (
                <Image src={profileImagePreview} alt="Profile preview" fill className="object-cover" />
              ) : currentUser?.img ? (
                <Image src={currentUser.img} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                  {(currentUser?.displayName || currentUser?.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Profile image upload button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <label className="p-2 rounded-full bg-black bg-opacity-60 hover:bg-opacity-80 cursor-pointer transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-4 pt-16">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-transparent border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Your name"
                maxLength={50}
              />
              <div className="text-xs text-gray-500 mt-1">{displayName.length}/50</div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-transparent border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Tell people about yourself"
                maxLength={160}
              />
              <div className="text-xs text-gray-500 mt-1">{bio.length}/160</div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Where are you located?"
                maxLength={50}
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-transparent border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                placeholder="https://yourwebsite.com"
                maxLength={100}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
