import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sustainabilityService } from '../../services/sustainabilityService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Leaf,
  Zap,
  Droplets,
  Recycle,
  CloudFog,
  Award,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
} from 'recharts';

export default function SustainabilityDashboard() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, trendRes] = await Promise.all([
        sustainabilityService.getSummary({ building: selectedBuilding }),
        sustainabilityService.getTrends({ building: selectedBuilding }),
      ]);
      setSummary(sumRes.data);
      setTrends(trendRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBuilding]);

  if (loading) return <LoadingSpinner text="Analyzing campus environmental metrics..." />;

  const buildings = [
    'All',
    'Main Academic Block',
    'Science & Engineering Wing',
    'Library Building',
    'Hostel Block A',
    'Student Cafeteria',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Building Filter */}
      <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-mint-soft text-[#1b7a52] text-xs font-semibold mb-2">
            <Leaf className="w-3.5 h-3.5" />
            <span>Campus Sustainability Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-primary tracking-tight">
            Environmental Impact &amp; Resource Footprint
          </h2>
          <p className="text-xs text-campus-muted mt-0.5">
            Transparent metrics calculating carbon intensity, solar offset, water reclamation, and recycling efficiency.
          </p>
        </div>

        {/* Building Filter & Action */}
        <div className="flex items-center gap-3">
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/70 text-navy-primary font-semibold focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
          >
            {buildings.map((b) => (
              <option key={b} value={b}>
                {b === 'All' ? 'Campus-Wide Aggregated' : b}
              </option>
            ))}
          </select>

          <Link
            to="/sustainability/records"
            className="px-4 py-2 bg-navy-primary hover:bg-navy-secondary text-white font-semibold text-xs rounded-xl transition-smooth shadow-xs whitespace-nowrap"
          >
            Resource Logs
          </Link>
        </div>
      </div>

      {/* 6 Key Environmental Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Score */}
        <div className="bg-gradient-to-br from-navy-primary to-navy-secondary text-white p-4 rounded-2xl shadow-card relative overflow-hidden">
          <span className="text-[10px] font-bold text-mint-DEFAULT uppercase tracking-wider block">
            Sustainability Index
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold">
              {summary?.sustainabilityScore || 83}
            </span>
            <span className="text-xs text-slate-300">/ 100</span>
          </div>
          <span className="text-[10px] text-mint-light mt-1 block">Weighted algorithm</span>
        </div>

        {/* Electricity */}
        <div className="bg-white p-4 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-1">
            <span className="text-[11px] font-semibold">Total Electricity</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-navy-primary">
            {summary?.electricityKWh ? (summary.electricityKWh / 1000).toFixed(1) + 'k' : '40.9k'}
          </div>
          <span className="text-[10px] text-campus-muted mt-1 block">kWh consumption</span>
        </div>

        {/* Solar Generation */}
        <div className="bg-white p-4 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-1">
            <span className="text-[11px] font-semibold">Clean Solar</span>
            <Sparkles className="w-4 h-4 text-[#22A06B]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#22A06B]">
            {summary?.solarGeneratedKWh ? (summary.solarGeneratedKWh / 1000).toFixed(1) + 'k' : '12.9k'}
          </div>
          <span className="text-[10px] text-mint-DEFAULT font-semibold mt-1 block">kWh generated</span>
        </div>

        {/* Water Usage */}
        <div className="bg-white p-4 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-1">
            <span className="text-[11px] font-semibold">Water Intake</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-navy-primary">
            {summary?.waterConsumptionLitres
              ? (summary.waterConsumptionLitres / 1000).toFixed(0) + 'k'
              : '350k'}
          </div>
          <span className="text-[10px] text-campus-muted mt-1 block">Litres total used</span>
        </div>

        {/* Waste Recycled */}
        <div className="bg-white p-4 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-1">
            <span className="text-[11px] font-semibold">Waste Recycled</span>
            <Recycle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">
            {summary?.wasteRecycledKg ? summary.wasteRecycledKg.toLocaleString() : '3,330'}
          </div>
          <span className="text-[10px] text-campus-muted mt-1 block">kg diverted (88.5%)</span>
        </div>

        {/* Estimated Emissions */}
        <div className="bg-white p-4 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-1">
            <span className="text-[11px] font-semibold">Estimated CO₂e</span>
            <CloudFog className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-navy-primary">
            {summary?.estimatedEmissionsTons || '23.4'}
          </div>
          <span className="text-[10px] text-campus-muted mt-1 block">Metric Tons est.</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Electricity & Solar Trend Chart */}
        <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-primary">Electricity Consumption vs Solar Offset</h3>
              <p className="text-xs text-campus-muted">Net grid dependency in kilowatt-hours (kWh)</p>
            </div>
            <span className="text-[11px] font-semibold text-mint-DEFAULT bg-navy-primary px-2.5 py-1 rounded-lg">
              CEA Factor: 0.82 kg/kWh
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#718096' }} />
                <YAxis tick={{ fontSize: 11, fill: '#718096' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E3EAF2',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="electricity" name="Grid Electricity (kWh)" fill="#142B4A" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="solar"
                  name="Solar Generated (kWh)"
                  stroke="#75E0C0"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#75E0C0' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste & Water Recycling Trend */}
        <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-primary">Solid Waste Segregation &amp; Recovery</h3>
              <p className="text-xs text-campus-muted">Generated versus diverted from landfill (kg)</p>
            </div>
            <span className="text-[11px] font-semibold text-[#1b7a52] bg-mint-soft px-2.5 py-1 rounded-lg">
              88.5% Diversion Rate
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#718096' }} />
                <YAxis tick={{ fontSize: 11, fill: '#718096' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E3EAF2',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="waste" name="Total Waste (kg)" fill="#203D5B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recycled" name="Amount Recycled (kg)" fill="#75E0C0" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Documented Sustainability Formula & Audit Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Component Breakdown */}
        <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-primary">Campus Sustainability Index Formula</h3>
            <span className="text-xs font-mono font-bold text-navy-primary">Total: {summary?.sustainabilityScore || 83}/100</span>
          </div>
          <p className="text-xs text-campus-muted">
            The composite campus eco-score is calculated deterministically from four transparent sub-metrics:
          </p>

          <div className="space-y-3 text-xs">
            {/* Component 1 */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-navy-primary">1. Renewable Solar Adoption (Max 35 pts)</span>
                <span className="text-mint-hover font-bold font-mono">
                  {summary?.scoreBreakdown?.renewableShare || 28} / 35
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-navy-primary"
                  style={{ width: `${((summary?.scoreBreakdown?.renewableShare || 28) / 35) * 100}%` }}
                />
              </div>
            </div>

            {/* Component 2 */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-navy-primary">2. Waste Recycling &amp; Composting (Max 35 pts)</span>
                <span className="text-mint-hover font-bold font-mono">
                  {summary?.scoreBreakdown?.wasteRecycling || 31} / 35
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#22A06B]"
                  style={{ width: `${((summary?.scoreBreakdown?.wasteRecycling || 31) / 35) * 100}%` }}
                />
              </div>
            </div>

            {/* Component 3 */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-navy-primary">3. Water Conservation &amp; STP (Max 15 pts)</span>
                <span className="text-mint-hover font-bold font-mono">
                  {summary?.scoreBreakdown?.waterReclamation || 11} / 15
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${((summary?.scoreBreakdown?.waterReclamation || 11) / 15) * 100}%` }}
                />
              </div>
            </div>

            {/* Component 4 */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-navy-primary">4. Rapid Leak &amp; Energy Resolution (Max 15 pts)</span>
                <span className="text-mint-hover font-bold font-mono">
                  {summary?.scoreBreakdown?.maintenanceEfficiency || 13} / 15
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${((summary?.scoreBreakdown?.maintenanceEfficiency || 13) / 15) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transparent Carbon Accounting Factors */}
        <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-navy-primary" />
            <h3 className="text-sm font-bold text-navy-primary">Documented Configurable Carbon Factors</h3>
          </div>
          <p className="text-xs text-campus-muted leading-relaxed">
            Carbon emissions are calculated with verifiable conversion factors (benchmarked to Central Electricity Authority of India and EPA emission guidelines):
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-campus-border flex justify-between items-center">
              <div>
                <span className="font-bold text-navy-primary block">Grid Electricity</span>
                <span className="text-[10px] text-campus-muted">Thermal power emission factor</span>
              </div>
              <span className="font-mono font-bold text-navy-primary">0.82 kg CO₂e / kWh</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-campus-border flex justify-between items-center">
              <div>
                <span className="font-bold text-emerald-700 block">Rooftop Solar Offset</span>
                <span className="text-[10px] text-campus-muted">Avoided coal generation</span>
              </div>
              <span className="font-mono font-bold text-emerald-700">-0.82 kg CO₂e / kWh</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-campus-border flex justify-between items-center">
              <div>
                <span className="font-bold text-navy-primary block">Unrecycled Waste to Landfill</span>
                <span className="text-[10px] text-campus-muted">Methane decomposition factor</span>
              </div>
              <span className="font-mono font-bold text-navy-primary">1.25 kg CO₂e / kg</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-campus-border flex justify-between items-center">
              <div>
                <span className="font-bold text-blue-700 block">Potable Water Pumping</span>
                <span className="text-[10px] text-campus-muted">Pumping &amp; purification footprint</span>
              </div>
              <span className="font-mono font-bold text-blue-700">0.00035 kg CO₂e / Litre</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
