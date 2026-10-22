import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import {
  Upload,
  AlertTriangle,
  CheckCircle2,
  Building,
  MapPin,
  Tag,
  FileText,
  X,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Electrical',
  'Plumbing and Water',
  'Cleanliness and Waste',
  'Furniture and Infrastructure',
  'IT and Wi-Fi',
  'Laboratory Equipment',
  'Classroom Equipment',
  'Safety',
  'Other',
];

const BUILDINGS = [
  'Main Academic Block',
  'Science & Engineering Wing',
  'Library Building',
  'Hostel Block A',
  'Hostel Block B',
  'Student Cafeteria',
  'Sports Complex',
];

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Plumbing and Water',
    description: '',
    building: 'Main Academic Block',
    locationDetails: '',
    priority: 'Medium',
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size cannot exceed 5MB.');
      return;
    }

    setSelectedPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a clear title for the complaint.');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please provide details describing the issue.');
      return;
    }
    if (!formData.locationDetails.trim()) {
      toast.error('Please specify the exact room, lab or floor location.');
      return;
    }

    setSubmitting(true);

    try {
      // Use FormData to support image uploads
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('building', formData.building);
      data.append('locationDetails', formData.locationDetails);
      data.append('priority', formData.priority);

      if (selectedPhoto) {
        data.append('photos', selectedPhoto);
      }

      const res = await complaintService.create(data);
      setCreatedComplaint(res.data);
      toast.success(`Complaint registered: ${res.data.complaintId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to submit complaint. Please check server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-navy-primary tracking-tight">
          Report a Campus Issue
        </h2>
        <p className="text-xs text-campus-muted mt-0.5">
          Submit facility breakdowns, water leakages, electrical hazards, or cleanliness requests.
        </p>
      </div>

      {createdComplaint ? (
        /* Success Screen */
        <div className="bg-white rounded-2xl border border-campus-border p-8 shadow-card text-center">
          <div className="w-16 h-16 rounded-2xl bg-mint-soft text-[#1b7a52] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#22A06B]" />
          </div>
          <h3 className="text-xl font-bold text-navy-primary">Complaint Successfully Registered!</h3>
          <p className="text-xs text-campus-muted mt-1 max-w-md mx-auto">
            Your grievance has been assigned a unique reference ticket. Campus administration will review and dispatch the maintenance crew.
          </p>

          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-campus-border max-w-sm mx-auto text-left">
            <div className="text-[10px] text-campus-muted uppercase font-bold tracking-wider">Ticket Reference</div>
            <div className="text-lg font-mono font-extrabold text-navy-primary">{createdComplaint.complaintId}</div>
            <div className="text-xs text-campus-text font-medium mt-1 truncate">{createdComplaint.title}</div>
            <div className="text-[11px] text-campus-muted mt-0.5">{createdComplaint.building} - {createdComplaint.locationDetails}</div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setCreatedComplaint(null);
                setFormData({
                  title: '',
                  category: 'Plumbing and Water',
                  description: '',
                  building: 'Main Academic Block',
                  locationDetails: '',
                  priority: 'Medium',
                });
                removePhoto();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-campus-border text-xs font-semibold text-navy-primary hover:bg-slate-50 transition-smooth"
            >
              Report Another Issue
            </button>
            <button
              onClick={() => navigate(`/student/complaints/${createdComplaint._id}`)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-navy-primary text-white text-xs font-semibold hover:bg-navy-secondary transition-smooth flex items-center justify-center gap-2"
            >
              <span>Track Complaint Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-campus-border p-6 sm:p-8 shadow-card space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-navy-primary mb-1">
              Complaint Subject / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="E.g., Water leaking from ceiling valve in 2nd Floor Restroom"
              className="w-full text-xs p-3 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary transition-smooth"
            />
          </div>

          {/* Category & Building Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-primary mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-primary mb-1">
                Campus Building / Zone <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
              >
                {BUILDINGS.map((bld) => (
                  <option key={bld} value={bld}>
                    {bld}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exact Location & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-primary mb-1">
                Specific Location Details <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.locationDetails}
                onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
                placeholder="E.g., Room 304, Computer Lab 2, East Corridor"
                className="w-full text-xs p-3 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-primary mb-1">
                Reported Urgency / Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
              >
                <option value="Low">Low - Minor nuisance, non-blocking</option>
                <option value="Medium">Medium - Regular maintenance needed</option>
                <option value="High">High - Impairing classroom or lab activities</option>
              </select>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-navy-primary mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what is broken, approximate leakage rate, unusual sounds, or safety concerns..."
              className="w-full text-xs p-3 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
            />
          </div>

          {/* Photo Upload with Live Preview */}
          <div>
            <label className="block text-xs font-bold text-navy-primary mb-1">
              Upload Supporting Photo / Evidence (Optional)
            </label>

            {previewUrl ? (
              <div className="relative inline-block mt-2">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="w-48 h-36 object-cover rounded-xl border border-campus-border shadow-xs"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-campus-border rounded-xl hover:border-navy-primary/50 transition-smooth bg-slate-50/50">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 text-campus-muted" />
                  <div className="flex text-xs text-campus-muted justify-center">
                    <label
                      htmlFor="photo-upload"
                      className="relative cursor-pointer rounded-md font-bold text-navy-primary hover:text-navy-secondary focus-within:outline-none"
                    >
                      <span>Upload an image</span>
                      <input
                        id="photo-upload"
                        name="photo-upload"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handlePhotoChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-[10px] text-campus-muted">PNG, JPG, WebP up to 5MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-navy-primary hover:bg-navy-secondary text-white font-semibold text-xs transition-smooth shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Registering Complaint...</span>
              ) : (
                <>
                  <span>Submit Complaint Ticket</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
