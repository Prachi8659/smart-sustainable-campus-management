import React, { useState, useEffect } from 'react';
import { sustainabilityService } from '../../services/sustainabilityService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Zap,
  Droplets,
  Recycle,
  PlusCircle,
  Download,
  Trash2,
  Calendar,
  Building,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResourceRecordsPage() {
  const [activeTab, setActiveTab] = useState('energy'); // energy, water, waste
  const [loading, setLoading] = useState(true);

  const [energyRecords, setEnergyRecords] = useState([]);
  const [waterRecords, setWaterRecords] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);

  // Modal & form states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Energy Form
  const [energyForm, setEnergyForm] = useState({
    building: 'Main Academic Block',
    reportingPeriod: '2026-03',
    electricityKWh: '',
    solarGeneratedKWh: '',
    notes: '',
  });

  // Water Form
  const [waterForm, setWaterForm] = useState({
    building: 'Main Academic Block',
    reportingPeriod: '2026-03',
    waterLitres: '',
    recycledLitres: '',
    notes: '',
  });

  // Waste Form
  const [wasteForm, setWasteForm] = useState({
    building: 'Main Academic Block',
    reportingPeriod: '2026-03',
    wasteCategory: 'Mixed',
    totalGeneratedKg: '',
    amountRecycledKg: '',
    notes: '',
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const [eRes, wRes, wstRes] = await Promise.all([
        sustainabilityService.getEnergyRecords(),
        sustainabilityService.getWaterRecords(),
        sustainabilityService.getWasteRecords(),
      ]);
      setEnergyRecords(eRes.records || []);
      setWaterRecords(wRes.records || []);
      setWasteRecords(wstRes.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCreateEnergy = async (e) => {
    e.preventDefault();
    if (!energyForm.electricityKWh) {
      toast.error('Please specify electricity in kWh.');
      return;
    }
    try {
      await sustainabilityService.createEnergyRecord({
        ...energyForm,
        electricityKWh: Number(energyForm.electricityKWh),
        solarGeneratedKWh: Number(energyForm.solarGeneratedKWh || 0),
      });
      toast.success('Energy log recorded successfully!');
      setModalOpen(false);
      fetchRecords();
    } catch (err) {
      toast.error(err.message || 'Failed to save energy record.');
    }
  };

  const handleCreateWater = async (e) => {
    e.preventDefault();
    if (!waterForm.waterLitres) {
      toast.error('Please enter water consumption in litres.');
      return;
    }
    try {
      await sustainabilityService.createWaterRecord({
        ...waterForm,
        waterLitres: Number(waterForm.waterLitres),
        recycledLitres: Number(waterForm.recycledLitres || 0),
      });
      toast.success('Water log recorded successfully!');
      setModalOpen(false);
      fetchRecords();
    } catch (err) {
      toast.error(err.message || 'Failed to save water record.');
    }
  };

  const handleCreateWaste = async (e) => {
    e.preventDefault();
    const total = Number(wasteForm.totalGeneratedKg);
    const recycled = Number(wasteForm.amountRecycledKg);

    if (!total || total < 0) {
      toast.error('Please enter total generated waste in kg.');
      return;
    }
    // Validation constraint
    if (recycled > total) {
      toast.error('Validation error: Recycled amount cannot exceed total waste generated!');
      return;
    }

    try {
      await sustainabilityService.createWasteRecord({
        ...wasteForm,
        totalGeneratedKg: total,
        amountRecycledKg: recycled || 0,
      });
      toast.success('Waste log recorded successfully!');
      setModalOpen(false);
      fetchRecords();
    } catch (err) {
      toast.error(err.message || 'Failed to save waste record.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      if (activeTab === 'energy') {
        await sustainabilityService.deleteEnergyRecord(itemToDelete._id);
      } else if (activeTab === 'water') {
        await sustainabilityService.deleteWaterRecord(itemToDelete._id);
      } else {
        await sustainabilityService.deleteWasteRecord(itemToDelete._id);
      }
      toast.success('Record deleted.');
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      fetchRecords();
    } catch (err) {
      toast.error(err.message || 'Delete operation failed.');
    }
  };

  // CSV Export
  const exportToCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `campus_${activeTab}_records.csv`;

    if (activeTab === 'energy') {
      headers = ['Building', 'Period', 'Electricity (kWh)', 'Solar (kWh)', 'Notes'];
      rows = energyRecords.map((r) => [r.building, r.reportingPeriod, r.electricityKWh, r.solarGeneratedKWh, r.notes || '']);
    } else if (activeTab === 'water') {
      headers = ['Building', 'Period', 'Water Intake (L)', 'Recycled (L)', 'Notes'];
      rows = waterRecords.map((r) => [r.building, r.reportingPeriod, r.waterLitres, r.recycledLitres, r.notes || '']);
    } else {
      headers = ['Building', 'Period', 'Category', 'Total (kg)', 'Recycled (kg)', 'Notes'];
      rows = wasteRecords.map((r) => [r.building, r.reportingPeriod, r.wasteCategory, r.totalGeneratedKg, r.amountRecycledKg, r.notes || '']);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${rows.length} records to ${filename}`);
  };

  const buildings = [
    'Main Academic Block',
    'Science & Engineering Wing',
    'Library Building',
    'Hostel Block A',
    'Hostel Block B',
    'Student Cafeteria',
    'Sports Complex',
  ];

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-navy-primary tracking-tight">
            Campus Resource Log Books
          </h2>
          <p className="text-xs text-campus-muted mt-0.5">
            Audit-grade logging for utility electricity, solar generation, water meters, and waste segregation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-campus-border text-xs font-semibold text-navy-primary hover:bg-slate-50 transition-smooth shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-navy-primary" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-primary text-white text-xs font-semibold hover:bg-navy-secondary transition-smooth shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-mint-DEFAULT" />
            <span>+ Add New Record</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-campus-border gap-2">
        <button
          onClick={() => setActiveTab('energy')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-smooth ${
            activeTab === 'energy'
              ? 'border-navy-primary text-navy-primary bg-white rounded-t-xl'
              : 'border-transparent text-campus-muted hover:text-navy-primary'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Electricity &amp; Solar Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('water')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-smooth ${
            activeTab === 'water'
              ? 'border-navy-primary text-navy-primary bg-white rounded-t-xl'
              : 'border-transparent text-campus-muted hover:text-navy-primary'
          }`}
        >
          <Droplets className="w-4 h-4 text-blue-500" />
          <span>Water &amp; Reclamation Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('waste')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-smooth ${
            activeTab === 'waste'
              ? 'border-navy-primary text-navy-primary bg-white rounded-t-xl'
              : 'border-transparent text-campus-muted hover:text-navy-primary'
          }`}
        >
          <Recycle className="w-4 h-4 text-emerald-600" />
          <span>Solid Waste &amp; Recycling</span>
        </button>
      </div>

      {/* Content Tables */}
      {loading ? (
        <LoadingSpinner text="Fetching resource logs..." />
      ) : activeTab === 'energy' ? (
        /* Energy Table */
        <div className="bg-white rounded-2xl border border-campus-border shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-campus-border text-campus-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Building</th>
                <th className="px-5 py-3.5 font-semibold">Period</th>
                <th className="px-5 py-3.5 font-semibold">Electricity (kWh)</th>
                <th className="px-5 py-3.5 font-semibold">Solar Offset (kWh)</th>
                <th className="px-5 py-3.5 font-semibold">Notes / Purpose</th>
                <th className="px-5 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-campus-border">
              {energyRecords.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/70 transition-smooth">
                  <td className="px-5 py-4 font-bold text-navy-primary">{r.building}</td>
                  <td className="px-5 py-4 font-mono font-medium text-campus-muted">{r.reportingPeriod}</td>
                  <td className="px-5 py-4 font-mono font-bold text-navy-primary">
                    {r.electricityKWh.toLocaleString()} kWh
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-[#22A06B]">
                    +{r.solarGeneratedKWh.toLocaleString()} kWh
                  </td>
                  <td className="px-5 py-4 text-campus-muted max-w-xs truncate">{r.notes || '—'}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => {
                        setItemToDelete(r);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-smooth"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'water' ? (
        /* Water Table */
        <div className="bg-white rounded-2xl border border-campus-border shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-campus-border text-campus-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Building</th>
                <th className="px-5 py-3.5 font-semibold">Period</th>
                <th className="px-5 py-3.5 font-semibold">Water Intake (Litres)</th>
                <th className="px-5 py-3.5 font-semibold">Recycled / Greywater</th>
                <th className="px-5 py-3.5 font-semibold">Notes</th>
                <th className="px-5 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-campus-border">
              {waterRecords.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/70 transition-smooth">
                  <td className="px-5 py-4 font-bold text-navy-primary">{r.building}</td>
                  <td className="px-5 py-4 font-mono font-medium text-campus-muted">{r.reportingPeriod}</td>
                  <td className="px-5 py-4 font-mono font-bold text-navy-primary">
                    {r.waterLitres.toLocaleString()} L
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-blue-600">
                    +{r.recycledLitres.toLocaleString()} L
                  </td>
                  <td className="px-5 py-4 text-campus-muted max-w-xs truncate">{r.notes || '—'}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => {
                        setItemToDelete(r);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-smooth"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Waste Table */
        <div className="bg-white rounded-2xl border border-campus-border shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-campus-border text-campus-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Building</th>
                <th className="px-5 py-3.5 font-semibold">Period</th>
                <th className="px-5 py-3.5 font-semibold">Waste Category</th>
                <th className="px-5 py-3.5 font-semibold">Total Generated (kg)</th>
                <th className="px-5 py-3.5 font-semibold">Recycled / Diverted (kg)</th>
                <th className="px-5 py-3.5 font-semibold">Recycling %</th>
                <th className="px-5 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-campus-border">
              {wasteRecords.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/70 transition-smooth">
                  <td className="px-5 py-4 font-bold text-navy-primary">{r.building}</td>
                  <td className="px-5 py-4 font-mono font-medium text-campus-muted">{r.reportingPeriod}</td>
                  <td className="px-5 py-4 font-semibold text-navy-primary">{r.wasteCategory}</td>
                  <td className="px-5 py-4 font-mono font-bold text-navy-primary">
                    {r.totalGeneratedKg.toLocaleString()} kg
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-emerald-600">
                    {r.amountRecycledKg.toLocaleString()} kg
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#1b7a52]">
                    {Math.round((r.amountRecycledKg / r.totalGeneratedKg) * 100)}%
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => {
                        setItemToDelete(r);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-smooth"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Record Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          activeTab === 'energy'
            ? 'Add Electricity & Solar Record'
            : activeTab === 'water'
            ? 'Add Water Consumption Record'
            : 'Add Solid Waste Record'
        }
      >
        {activeTab === 'energy' && (
          <form onSubmit={handleCreateEnergy} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy-primary mb-1">Building</label>
                <select
                  value={energyForm.building}
                  onChange={(e) => setEnergyForm({ ...energyForm, building: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
                >
                  {buildings.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-primary mb-1">Period (YYYY-MM)</label>
                <input
                  type="text"
                  required
                  pattern="^\d{4}-(0[1-9]|1[0-2])$"
                  placeholder="2026-04"
                  value={energyForm.reportingPeriod}
                  onChange={(e) => setEnergyForm({ ...energyForm, reportingPeriod: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy-primary mb-1">Electricity (kWh)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={energyForm.electricityKWh}
                  onChange={(e) => setEnergyForm({ ...energyForm, electricityKWh: e.target.value })}
                  placeholder="e.g. 14200"
                  className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-primary mb-1">Solar Offset (kWh)</label>
                <input
                  type="number"
                  min={0}
                  value={energyForm.solarGeneratedKWh}
                  onChange={(e) => setEnergyForm({ ...energyForm, solarGeneratedKWh: e.target.value })}
                  placeholder="e.g. 3800"
                  className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">Notes</label>
              <textarea
                rows={2}
                value={energyForm.notes}
                onChange={(e) => setEnergyForm({ ...energyForm, notes: e.target.value })}
                placeholder="Details about meter reading..."
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
                Save Record
              </button>
            </div>
          </form>
        )}

        {activeTab === 'water' && (
          <form onSubmit={handleCreateWater} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy-primary mb-1">Building</label>
                <select
                  value={waterForm.building}
                  onChange={(e) => setWaterForm({ ...waterForm, building: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
                >
                  {buildings.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-primary mb-1">Period (YYYY-MM)</label>
                <input
                  type="text"
                  required
                  pattern="^\d{4}-(0[1-9]|1[0-2])$"
                  placeholder="2026-04"
                  value={waterForm.reportingPeriod}
                  onChange={(e) => setWaterForm({ ...waterForm, reportingPeriod: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy-primary mb-1">Water Intake (Litres)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={waterForm.waterLitres}
                  onChange={(e) => setWaterForm({ ...waterForm, waterLitres: e.target.value })}
                  placeholder="e.g. 125000"
                  className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-primary mb-1">Recycled Greywater (L)</label>
                <input
                  type="number"
                  min={0}
                  value={waterForm.recycledLitres}
                  onChange={(e) => setWaterForm({ ...waterForm, recycledLitres: e.target.value })}
                  placeholder="e.g. 35000"
                  className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">Notes</label>
              <textarea
                rows={2}
                value={waterForm.notes}
                onChange={(e) => setWaterForm({ ...waterForm, notes: e.target.value })}
                placeholder="STP meter readings or filtration notes..."
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
                Save Record
              </button>
            </div>
          </form>
        )}

        {activeTab === 'waste' && (
          <form onSubmit={handleCreateWaste} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy-primary mb-1">Building</label>
                <select
                  value={wasteForm.building}
                  onChange={(e) => setWasteForm({ ...wasteForm, building: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
                >
                  {buildings.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-primary mb-1">Period (YYYY-MM)</label>
                <input
                  type="text"
                  required
                  pattern="^\d{4}-(0[1-9]|1[0-2])$"
                  placeholder="2026-04"
                  value={wasteForm.reportingPeriod}
                  onChange={(e) => setWasteForm({ ...wasteForm, reportingPeriod: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">Waste Category</label>
              <select
                value={wasteForm.wasteCategory}
                onChange={(e) => setWasteForm({ ...wasteForm, wasteCategory: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
              >
                <option value="Organic & Food">Organic &amp; Food Waste</option>
                <option value="Dry & Plastic">Dry &amp; Plastic Waste</option>
                <option value="Paper & Cardboard">Paper &amp; Cardboard</option>
                <option value="E-Waste">Electronic (E-Waste)</option>
                <option value="Hazardous & Lab">Laboratory &amp; Hazardous</option>
                <option value="Mixed">Mixed Solid Waste</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy-primary mb-1">Total Generated (kg)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={wasteForm.totalGeneratedKg}
                  onChange={(e) => setWasteForm({ ...wasteForm, totalGeneratedKg: e.target.value })}
                  placeholder="e.g. 850"
                  className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-primary mb-1">Amount Recycled (kg)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={wasteForm.amountRecycledKg}
                  onChange={(e) => setWasteForm({ ...wasteForm, amountRecycledKg: e.target.value })}
                  placeholder="e.g. 780"
                  className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50"
                />
              </div>
            </div>

            <p className="text-[10px] text-campus-muted">
              * Strict constraint: Recycled amount cannot exceed total generated waste.
            </p>

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
                Save Record
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDestructive={true}
        title="Delete Resource Record"
        message="Are you sure you want to permanently delete this resource log entry?"
      />
    </div>
  );
}
