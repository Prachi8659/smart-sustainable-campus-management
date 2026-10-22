import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FeedbackForm({ complaintId, existingFeedback, onSubmitSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isSatisfied, setIsSatisfied] = useState(true);
  const [loading, setLoading] = useState(false);

  if (existingFeedback) {
    return (
      <div className="bg-mint-soft/40 border border-[#a3edd7] rounded-2xl p-6">
        <div className="flex items-center gap-2 text-[#1b7a52] font-bold text-sm mb-2">
          <CheckCircle className="w-5 h-5 text-[#22A06B]" />
          <span>Resolution Feedback Submitted</span>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= (existingFeedback.rating || 5)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300'
              }`}
            />
          ))}
          <span className="text-xs font-semibold text-navy-primary ml-2">
            {existingFeedback.rating || 5}/5 Stars
          </span>
        </div>
        {existingFeedback.comments && (
          <p className="text-xs text-campus-text bg-white/70 p-3 rounded-xl border border-campus-border italic">
            "{existingFeedback.comments}"
          </p>
        )}
        <p className="text-[10px] text-campus-muted mt-2">
          Submitted on: {new Date(existingFeedback.createdAt || Date.now()).toLocaleDateString()}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a star rating.');
      return;
    }
    setLoading(true);
    try {
      await onSubmitSuccess({ rating, comments, isSatisfied });
      toast.success('Thank you! Your feedback has been recorded.');
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-5 h-5 text-navy-primary" />
        <h4 className="font-bold text-navy-primary text-sm">Resolution Feedback</h4>
      </div>
      <p className="text-xs text-campus-muted mb-4">
        This problem has been resolved. Please rate the quality and timeliness of the maintenance work.
      </p>

      {/* Star Selector */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-navy-primary mb-1">
          Your Rating
        </label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-slate-300 hover:scale-110 transition-smooth focus:outline-none"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-navy-primary ml-2">
            {rating === 5
              ? 'Excellent (5/5)'
              : rating === 4
              ? 'Good (4/5)'
              : rating === 3
              ? 'Average (3/5)'
              : rating === 2
              ? 'Poor (2/5)'
              : 'Very Poor (1/5)'}
          </span>
        </div>
      </div>

      {/* Remarks */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-navy-primary mb-1">
          Comments / Observations (Optional)
        </label>
        <textarea
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="E.g., Problem solved efficiently, clean workspace left behind..."
          className="w-full text-xs p-3 rounded-xl border border-campus-border focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
        />
      </div>

      {/* Satisfaction checkbox */}
      <div className="flex items-center gap-2 mb-5">
        <input
          type="checkbox"
          id="isSatisfied"
          checked={isSatisfied}
          onChange={(e) => setIsSatisfied(e.target.checked)}
          className="w-4 h-4 text-navy-primary rounded border-campus-border focus:ring-navy-primary"
        />
        <label htmlFor="isSatisfied" className="text-xs text-campus-text select-none cursor-pointer">
          I confirm that the reported issue has been completely fixed to my satisfaction.
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-navy-primary hover:bg-navy-secondary text-white font-semibold text-xs rounded-xl transition-smooth shadow-sm"
      >
        {loading ? 'Submitting Feedback...' : 'Submit Resolution Feedback'}
      </button>
    </form>
  );
}
