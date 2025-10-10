import React, { useState } from "react";
import { Mail, Check } from "lucide-react";
import toast from "react-hot-toast";

interface NewsletterSubscriptionFormProps {
  className?: string;
  showTitle?: boolean;
  compact?: boolean;
}

const NewsletterSubscriptionForm: React.FC<NewsletterSubscriptionFormProps> = ({
  className = "",
  showTitle = true,
  compact = false,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);

      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "https://blog.sannty.in";
      const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Email is already subscribed to our newsletter") {
          toast.error("You're already subscribed to our newsletter!");
        } else {
          toast.error(data.error || "Failed to subscribe");
        }
        return;
      }

      // Success
      setIsSubscribed(true);
      setEmail("");
      toast.success(
        data.message || "Successfully subscribed to our newsletter!"
      );

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 5000);
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <div className={`${className}`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            />
            {isSubscribed && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || isSubscribed}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSubscribed
                ? "bg-green-600 text-white"
                : "bg-primary-600 text-white hover:bg-primary-700"
            }`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : isSubscribed ? (
              <Check className="h-4 w-4" />
            ) : (
              "Subscribe"
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl p-6 border border-primary-200/50 ${className}`}
    >
      {showTitle && (
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-primary-600 p-3 rounded-full">
              <Mail className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Stay Updated</h3>
          <p className="text-gray-600 text-sm">
            Subscribe to our newsletter and never miss our latest blog posts and
            updates.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          />
          {isSubscribed && (
            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || isSubscribed}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isSubscribed
              ? "bg-green-600 text-white"
              : "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/40"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Subscribing...</span>
            </div>
          ) : isSubscribed ? (
            <div className="flex items-center justify-center space-x-2">
              <Check className="h-5 w-5" />
              <span>Subscribed!</span>
            </div>
          ) : (
            "Subscribe to Newsletter"
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
};

export default NewsletterSubscriptionForm;
