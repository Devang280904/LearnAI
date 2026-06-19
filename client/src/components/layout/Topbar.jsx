import { motion } from 'framer-motion';
import { Menu, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shrink-0"
    >
      <div className="flex items-center justify-between h-[100px] px-8">
        {/* Left side - Mobile Menu Toggle */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Right side - Actions & Profile */}
        <div className="flex items-center gap-6">
          {/* User profile block */}
          {user && (
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 rounded-2xl transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-sm shadow-primary/20">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="hidden sm:block text-left pr-2">
                <p className="text-[15px] font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">
                  {user.name || 'Alex'}
                </p>
                <p className="text-xs text-slate-500 leading-tight mt-0.5">
                  {user.email || 'alex@timetoprogram.com'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Topbar;
