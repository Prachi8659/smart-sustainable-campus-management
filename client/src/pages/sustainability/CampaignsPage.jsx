import React, { useState, useEffect } from 'react';
import { sustainabilityService } from '../../services/sustainabilityService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  Calendar,
  Award,
  Users,
  Target,
  PlusCircle,
  CheckCircle2,
  Leaf,
  Sparkles,
  Zap,
  Droplets,
  Recycle,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Energy',
    startDate: '',
    endDate: '',
    targetGoal: '',
    rewardsOrPoints: 75,
    metricsAchieved: 'Challenge initiated',
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await sustainabilityService.getCampaigns();
      setCampaigns(res.campaigns || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleJoin = async (campId) => {
    setJoiningId(campId);
    try {
      const res = await sustainabilityService.joinCampaign(campId);
      toast.success(res.message || 'You joined the campaign!');
      await fetchCampaigns();
    } catch (err) {
      toast.error(err.message || 'Could not join campaign.');
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await sustainabilityService.createCampaign(formData);
      toast.success(`Campaign "${formData.title}" launched!`);
      setModalOpen(false);
      await fetchCampaigns();
    } catch (err) {
      toast.error(err.message || 'Failed to create campaign.');
    }
  };

  const canManage = user?.role === 'sustainability_officer' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-navy-primary tracking-tight">
            Green Campus Initiatives &amp; Campaigns
          </h2>
          <p className="text-xs text-campus-muted mt-0.5">
            Participate in campus energy reductions, recycling challenges, and water conservation drives.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-primary text-white text-xs font-semibold hover:bg-navy-secondary transition-smooth shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-mint-DEFAULT" />
            <span>+ Launch New Campaign</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching campus campaigns..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <div
              key={camp._id}
              className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs hover:border-slate-300 hover:shadow-card transition-smooth flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      camp.category === 'Energy'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : camp.category === 'Water'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : camp.category === 'Waste'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-mint-soft text-[#1b7a52] border border-[#a3edd7]'
                    }`}
                  >
                    {camp.category === 'Energy' && <Zap className="w-3 h-3" />}
                    {camp.category === 'Water' && <Droplets className="w-3 h-3" />}
                    {camp.category === 'Waste' && <Recycle className="w-3 h-3" />}
                    {camp.category} Challenge
                  </span>

                  <span className="text-[11px] font-bold text-mint-DEFAULT bg-navy-primary px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Award className="w-3 h-3" /> +{camp.rewardsOrPoints || 50} pts
                  </span>
                </div>

                <h3 className="font-extrabold text-navy-primary text-base mb-2 leading-snug">
                  {camp.title}
                </h3>

                <p className="text-xs text-campus-muted line-clamp-3 mb-4 leading-relaxed">
                  {camp.description}
                </p>

                <div className="space-y-2 text-xs text-campus-text pt-4 border-t border-campus-border">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-navy-primary flex-shrink-0" />
                    <span className="text-campus-muted font-medium">Target: {camp.targetGoal}</span>
                  </div>
                  {camp.metricsAchieved && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#22A06B] flex-shrink-0" />
                      <span className="text-emerald-700 font-semibold text-[11px]">Progress: {camp.metricsAchieved}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-navy-primary flex-shrink-0" />
                    <span className="text-campus-muted font-medium">{camp.participantCount || 18} Students Active</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-campus-border flex items-center justify-between">
                <span className="text-[10px] text-campus-muted">
                  Status: <strong className="text-navy-primary">{camp.status || 'Active'}</strong>
                </span>
                <button
                  onClick={() => handleJoin(camp._id)}
                  disabled={joiningId === camp._id}
                  className="px-4 py-2 bg-navy-primary hover:bg-navy-secondary text-white font-semibold text-xs rounded-xl transition-smooth shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-mint-DEFAULT" />
                  <span>{joiningId === camp._id ? 'Joining...' : 'Join Challenge'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Launch Campus Eco Campaign">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-primary mb-1">
              Campaign Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Save Electricity Week: Switch Off Idle Computers"
              className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
              >
                <option value="Energy">Energy Conservation</option>
                <option value="Water">Water Stewardship</option>
                <option value="Waste">Waste Segregation &amp; E-Waste</option>
                <option value="Biodiversity">Green Campus &amp; Trees</option>
                <option value="General">General Campus Eco</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">Eco-Points Reward</label>
              <input
                type="number"
                min={10}
                max={500}
                value={formData.rewardsOrPoints}
                onChange={(e) => setFormData({ ...formData, rewardsOrPoints: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-primary mb-1">Target Goal Objective</label>
            <input
              type="text"
              required
              value={formData.targetGoal}
              onChange={(e) => setFormData({ ...formData, targetGoal: e.target.value })}
              placeholder="e.g. Reduce lab standby power consumption by 15%"
              className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-primary mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Instructions and student participation rules..."
              className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-campus-border">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-campus-border text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-navy-primary text-white text-xs font-semibold rounded-xl"
            >
              Publish Campaign
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
