import React, { useState, useEffect } from "react";
import { tagsAPI } from "../services/api";
import type { Tag, CreateTagData, UpdateTagData } from "../types";

interface TagsManagementProps {
  onClose?: () => void;
}

const TagsManagement: React.FC<TagsManagementProps> = ({ onClose }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [formData, setFormData] = useState<CreateTagData>({
    name: "",
    description: "",
    color: "#3B82F6",
  });

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await tagsAPI.getAllTags({
        includePostCount: true,
        search: searchTerm || undefined,
        limit: 100,
      });
      setTags(response.data.tags);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (editingTag) {
        // Update existing tag
        const updateData: UpdateTagData = {};
        if (formData.name !== editingTag.name) updateData.name = formData.name;
        if (formData.description !== editingTag.description)
          updateData.description = formData.description;
        if (formData.color !== editingTag.color)
          updateData.color = formData.color;

        if (Object.keys(updateData).length > 0) {
          await tagsAPI.updateTag(editingTag.id, updateData);
        }
      } else {
        // Create new tag
        await tagsAPI.createTag(formData);
      }

      // Reset form
      setFormData({ name: "", description: "", color: "#3B82F6" });
      setIsCreating(false);
      setEditingTag(null);
      fetchTags();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to save tag");
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || "",
      color: tag.color || "#3B82F6",
    });
    setIsCreating(true);
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
      return;
    }

    try {
      await tagsAPI.deleteTag(tag.id);
      fetchTags();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to delete tag");
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", color: "#3B82F6" });
    setIsCreating(false);
    setEditingTag(null);
    setError("");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tags Management</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search and Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Create New Tag
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingTag ? "Edit Tag" : "Create New Tag"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                maxLength={200}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {editingTag ? "Update Tag" : "Create Tag"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tags List */}
      <div className="space-y-2">
        {tags.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? "No tags found matching your search."
              : "No tags created yet."}
          </div>
        ) : (
          tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: tag.color || "#6B7280" }}
                ></div>
                <div>
                  <h3 className="font-medium text-gray-900">{tag.name}</h3>
                  {tag.description && (
                    <p className="text-sm text-gray-600">{tag.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>Slug: {tag.slug}</span>
                    <span>{tag._count?.posts || 0} posts</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(tag)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tag)}
                  disabled={Boolean(tag._count?.posts && tag._count.posts > 0)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={
                    tag._count?.posts && tag._count.posts > 0
                      ? "Cannot delete tag that is being used by posts"
                      : "Delete tag"
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TagsManagement;
