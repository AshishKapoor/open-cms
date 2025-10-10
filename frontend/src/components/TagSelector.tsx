import React, { useState, useEffect } from "react";
import { tagsAPI } from "../services/api";
import type { Tag } from "../types";

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  disabled?: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds,
  onTagsChange,
  disabled = false,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await tagsAPI.getAllTags({
        search: searchTerm || undefined,
        limit: 100,
      });
      setTags(response.data.tags);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
  const availableTags = tags.filter((tag) => !selectedTagIds.includes(tag.id));

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTagIds.filter((id) => id !== tagId));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Tags</label>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border"
              style={{
                backgroundColor: tag.color ? `${tag.color}15` : "#E5E7EB",
                borderColor: tag.color || "#9CA3AF",
                color: tag.color || "#374151",
              }}
            >
              {tag.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors"
                >
                  <svg
                    className="w-3 h-3"
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
            </span>
          ))}
        </div>
      )}

      {/* Tag Selector */}
      {!disabled && (
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search and select tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {loading ? (
                <div className="p-3 text-center text-gray-500">
                  Loading tags...
                </div>
              ) : availableTags.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
                  {searchTerm
                    ? "No tags found matching your search."
                    : "No available tags."}
                </div>
              ) : (
                availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      handleToggleTag(tag.id);
                      setSearchTerm("");
                      setShowDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center gap-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: tag.color || "#6B7280" }}
                    ></div>
                    <div>
                      <div className="font-medium">{tag.name}</div>
                      {tag.description && (
                        <div className="text-sm text-gray-600">
                          {tag.description}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  );
};

export default TagSelector;
