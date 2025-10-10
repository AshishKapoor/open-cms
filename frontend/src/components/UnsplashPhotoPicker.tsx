import React from "react";
import { X, Search, Image } from "lucide-react";
import UnsplashReact, {
  InsertIntoApplicationUploader,
  withDefaultProps,
} from "unsplash-react";

interface UnsplashPhotoPickerProps {
  onPhotoSelect: (photoUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const UnsplashPhotoPicker: React.FC<UnsplashPhotoPickerProps> = ({
  onPhotoSelect,
  isOpen,
  onClose,
}) => {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  const handlePhotoSelection = (response: unknown) => {
    console.log("Photo selection response:", response);

    // The InsertIntoApplicationUploader returns the photo URL
    if (typeof response === "string") {
      onPhotoSelect(response);
      onClose();
    } else if (response && typeof response === "object" && "url" in response) {
      const photoResponse = response as { url: string };
      onPhotoSelect(photoResponse.url);
      onClose();
    } else {
      console.error("Unexpected response format:", response);
    }
  };

  if (!isOpen) return null;

  if (!accessKey || accessKey === "your-unsplash-access-key-here") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
          <div className="text-red-500 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Unsplash API Key Required
          </h3>
          <div className="text-gray-600 space-y-3 text-sm">
            <p>To use the Unsplash photo picker, you need to:</p>
            <ol className="list-decimal list-inside space-y-2 text-left">
              <li>
                Visit{" "}
                <a
                  href="https://unsplash.com/developers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  Unsplash Developers
                </a>
              </li>
              <li>Create a new application</li>
              <li>Copy your Access Key</li>
              <li>Add it to your .env file as VITE_UNSPLASH_ACCESS_KEY</li>
            </ol>
          </div>
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Image className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Choose a Cover Photo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Unsplash Component */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="min-h-[400px]">
              <UnsplashReact
                accessKey={accessKey}
                applicationName="Blog Platform"
                columns={3}
                photoRatio={16 / 9} // Good ratio for blog covers
                highlightColor="#2563eb" // primary-600
                defaultSearch=""
                Uploader={withDefaultProps(InsertIntoApplicationUploader, {})}
                onFinishedUploading={handlePhotoSelection}
                preferredSize={{ width: 1200, height: 675 }} // 16:9 ratio
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Photos provided by{" "}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Unsplash
            </a>
            . Make sure to give proper attribution to photographers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnsplashPhotoPicker;
