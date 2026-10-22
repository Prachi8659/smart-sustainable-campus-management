import React from 'react';
import { Leaf, Heart, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-navy-primary flex items-center justify-center text-mint-DEFAULT border border-mint-DEFAULT/30">
                <Leaf className="w-4 h-4 fill-mint-DEFAULT" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">SmartCampus</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart &amp; Sustainable Campus Management System. Uniting transparent facility resolution with comprehensive eco-footprint tracking.
            </p>
            <div className="flex items-center gap-2 text-xs text-mint-DEFAULT">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Web Technology (WT) Capstone Project</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Facility Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-mint-DEFAULT transition-smooth">
                  Report Campus Problem
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-mint-DEFAULT transition-smooth">
                  Track Resolution Timeline
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-mint-DEFAULT transition-smooth">
                  Staff Task Dispatching
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-mint-DEFAULT transition-smooth">
                  Post-Repair Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Sustainability</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/sustainability" className="hover:text-mint-DEFAULT transition-smooth">
                  Electricity &amp; Solar Analytics
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="hover:text-mint-DEFAULT transition-smooth">
                  Water &amp; Greywater Reclamation
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="hover:text-mint-DEFAULT transition-smooth">
                  Solid Waste &amp; Recycling Logs
                </Link>
              </li>
              <li>
                <Link to="/sustainability/campaigns" className="hover:text-mint-DEFAULT transition-smooth">
                  Green Campus Campaigns
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Tech Architecture</h4>
            <p className="text-xs text-slate-400 mb-2">
              Full Stack MERN Architecture: React 19, Vite, Tailwind CSS, Express.js, MongoDB &amp; Mongoose.
            </p>
            <div className="p-3 rounded-lg bg-navy-secondary/60 border border-slate-700/80 text-[11px] text-slate-300">
              <span className="font-semibold text-mint-DEFAULT">Color System:</span> Navy Blue (#142B4A) &amp; Mint Green (#75E0C0).
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>&copy; {new Date().getFullYear()} Smart &amp; Sustainable Campus Management System. MIT Academy of Engineering.</p>
          <div className="flex items-center gap-1">
            <span>Designed for Campus Sustainability</span>
            <Leaf className="w-3.5 h-3.5 text-mint-DEFAULT inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
