"use client";

import { useState, useEffect } from "react";
import { Star, StarHalf, CheckCircle, User, ChevronLeft, ChevronRight } from "lucide-react";

// Reusable StarRating Component
const StarRating = ({ rating, size = "w-5 h-5" }) => {
  const clampedRating = Math.max(0, Math.min(5, rating || 0));
  const fullStars = Math.floor(clampedRating);
  const hasHalf = clampedRating - fullStars >= 0.5;

  
  return (
    <div className="flex">
      {Array.from({ length: fullStars }, (_, i) => (
        <Star
          key={`full-${i}`}
          className={`${size} text-yellow-500`}
          fill="currentColor"
          strokeWidth={0}
        />
      ))}
      {hasHalf && (
        <StarHalf
          className={`${size} text-yellow-500`}
          fill="currentColor"
          strokeWidth={0}
        />
      )}
      {Array.from({ length: 5 - fullStars - (hasHalf ? 1 : 0) }, (_, i) => (
        <Star
          key={`empty-${i}`}
          className={`${size} text-gray-300`}
          stroke="currentColor"
          fill="none"
          strokeWidth={2}
        />
      ))}
    </div>
  );
};

// Rating Distribution Bars
const RatingDistribution = ({ reviews }) => {
  const counts = [0, 0, 0, 0, 0]; // 5 stars to 1 star
  reviews.forEach((r) => {
    const star = Math.round(r.rating);
    if (star >= 1 && star <= 5) counts[5 - star]++;
  });

  const total = reviews.length || 1;

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center gap-3 text-sm">
          <div className="flex gap-1">
            <StarRating rating={star} size="w-4 h-4" />
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-[#7d4b0e] transition-all"
              style={{ width: `${(counts[5 - star] / total) * 100}%` }}
            />
          </div>
          <span className="w-10 text-right text-gray-600">{counts[5 - star]}</span>
        </div>
      ))}
    </div>
  );
};

export default function ReviewsPage({ productId: propProductId }) {
  const productId = propProductId || "";

  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 0,
    review: "",
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const reviewsPerPage = 5;

  // Validation functions
  const validateName = (name) => {
    if (!name || !name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return "Name should only contain letters";
    return "";
  };

  const validateRating = (rating) => {
    if (!rating || rating === 0) return "Please select a rating";
    if (rating < 1 || rating > 5) return "Rating must be between 1 and 5";
    return "";
  };

  const validateReview = (review) => {
    if (!review || !review.trim()) return "Review is required";
    if (review.trim().length < 10) return "Review must be at least 10 characters";
    if (review.trim().length > 500) return "Review must not exceed 500 characters";
    return "";
  };

  // Handle field blur
  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    
    let error = "";
    
    switch (fieldName) {
      case "name":
        error = validateName(newReview.name);
        break;
      case "rating":
        error = validateRating(newReview.rating);
        break;
      case "review":
        error = validateReview(newReview.review);
        break;
      default:
        break;
    }
    
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  // Handle field change with validation
  const handleFieldChange = (fieldName, value) => {
    setNewReview({ ...newReview, [fieldName]: value });
    
    // Only validate if field has been touched
    if (touched[fieldName]) {
      let error = "";
      
      switch (fieldName) {
        case "name":
          error = validateName(value);
          break;
        case "rating":
          error = validateRating(value);
          break;
        case "review":
          error = validateReview(value);
          break;
        default:
          break;
      }
      
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    }
  };

  // Fetch reviews from API
  const fetchReviews = async () => {
    if (!productId) return;
    try {
      const res = await fetch(`/api/reviews/list?productId=${encodeURIComponent(productId)}`);
      const data = await res.json();

      const reviewList = data.reviews || [];
      
      // Sort reviews by rating (highest to lowest)
      const sortedReviews = reviewList.sort((a, b) => b.rating - a.rating);
      
      setReviews(sortedReviews);

      // Calculate average rating
      const avg =
        reviewList.length > 0
          ? reviewList.reduce((acc, r) => acc + r.rating, 0) / reviewList.length
          : 0;
      setAverage(avg);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Submit a new review
  const submitReview = async () => {
    // Mark all fields as touched
    setTouched({ name: true, rating: true, review: true });

    // Validate all fields
    const nameError = validateName(newReview.name);
    const ratingError = validateRating(newReview.rating);
    const reviewError = validateReview(newReview.review);

    const newErrors = {};
    if (nameError) newErrors.name = nameError;
    if (ratingError) newErrors.rating = ratingError;
    if (reviewError) newErrors.review = reviewError;

    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch("/api/reviews/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newReview, productId }),
      });

      if (res.ok) {
        setNewReview({ name: "", rating: 0, review: "" });
        setShowReviewForm(false);
        setCurrentPage(1); // Reset to first page when new review is added
        setErrors({});
        setTouched({});
        fetchReviews();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to submit review");
      }
    } catch (err) {
      console.error("Submit review failed:", err);
      alert("Failed to submit review");
    }
  };

  const handleCloseForm = () => {
    setShowReviewForm(false);
    setErrors({});
    setTouched({});
    setNewReview({ name: "", rating: 0, review: "" });
  };

  // Pagination calculations
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 bg-white">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Customer Reviews</h2>

      {/* Summary + Distribution + Write Button */}
      <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-200 p-8 mb-8">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Average Rating */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <StarRating rating={average} size="w-10 h-10" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{average.toFixed(1)} out of 5</p>
            <p className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
              Based on {reviews.length} reviews
              <CheckCircle className="w-4 h-4 text-green-600" />
            </p>
          </div>

          {/* Rating Bars */}
          <div>
            <RatingDistribution reviews={reviews} />
          </div>

          {/* Write a Review Button */}
          <div className="text-center">
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-[#7d4b0e] hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-full transition shadow-md cursor-pointer"
            >
              WRITE A REVIEW
            </button>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-[#00000091] bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Write a Review</h3>
            
            {/* Name Field */}
            <div className="mb-4">
              <input
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-[#7d4b0e]"
                }`}
                placeholder="Your Name"
                value={newReview.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Rating Field */}
            <div className="mb-4">
              <div className="flex justify-center gap-4 my-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      handleFieldChange("rating", i);
                      handleBlur("rating");
                    }}
                    className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`w-12 h-12 transition-colors ${
                        i <= newReview.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-red-500 text-sm text-center">{errors.rating}</p>
              )}
            </div>

            {/* Review Field */}
            <div className="mb-4">
              <textarea
                className={`w-full border p-3 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 ${
                  errors.review
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-[#7d4b0e]"
                }`}
                placeholder="Write your review..."
                value={newReview.review}
                onChange={(e) => handleFieldChange("review", e.target.value)}
                onBlur={() => handleBlur("review")}
              />
              {errors.review && (
                <p className="text-red-500 text-sm mt-1">{errors.review}</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={submitReview}
                className="flex-1 bg-[#7d4b0e] hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition cursor-pointer"
              >
                Submit Review
              </button>
              <button
                onClick={handleCloseForm}
                className="flex-1 border border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="grid md:grid-cols-3 gap-8">
        {currentReviews.length === 0 && reviews.length === 0 ? (
          <p className="col-span-3 text-center text-gray-500 py-12 text-lg">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          currentReviews.map((r, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <StarRating rating={r.rating} size="w-5 h-5" />
                <span className="text-sm text-gray-500">
                  {new Date(r.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{r.name || "Anonymous"}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Verified
                  </span>
                </div>
              </div>

              <p className="text-gray-700 flex-1 leading-relaxed">{r.review}</p>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {reviews.length > reviewsPerPage && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {/* First Page Button */}
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center transition cursor-pointer ${
              currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-[#7d4b0e] hover:text-yellow-600"
            }`}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={3} />
            <ChevronLeft className="w-5 h-5 -ml-3" strokeWidth={3} />
          </button>

          {/* Previous Page Button */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center transition cursor-pointer ${
              currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-[#7d4b0e] hover:text-yellow-600"
            }`}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={3} />
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 flex items-center justify-center rounded font-medium transition cursor-pointer ${
                currentPage === page
                  ? "text-[#7d4b0e] font-bold text-lg"
                  : "text-gray-600 hover:text-[#7d4b0e]"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Page Button */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`w-10 h-10 flex items-center justify-center transition cursor-pointer ${
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-[#7d4b0e] hover:text-yellow-600"
            }`}
          >
            <ChevronRight className="w-5 h-5" strokeWidth={3} />
          </button>

          {/* Last Page Button */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={`w-10 h-10 flex items-center justify-center transition cursor-pointer ${
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-[#7d4b0e] hover:text-yellow-600"
            }`}
          >
            <ChevronRight className="w-5 h-5" strokeWidth={3} />
            <ChevronRight className="w-5 h-5 -ml-3" strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}