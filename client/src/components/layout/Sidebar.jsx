import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Layers,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Brain,
  X,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Documents', path: '/documents', icon: FileText },
  { label: 'Flashcards', path: '/flashcards', icon: Layers },
  { label: 'Profile', path: '/profile', icon: User },
];

const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white relative">
      {/* Logo & Mobile Close Header */}
      <div className="flex items-center justify-between px-6 py-8 shrink-0 h-[100px]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-2xl text-white shrink-0 shadow-md shadow-primary/20">
            <Brain className="w-6 h-6" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[17px] font-bold text-slate-900 whitespace-nowrap"
              >
                LearnAI
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-2 pr-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `
              group flex items-center gap-4 pl-6 pr-4 py-3.5 rounded-r-full
              transition-all duration-200 relative
              ${isActive
                ? 'bg-primary text-white font-semibold shadow-md shadow-primary/20'
                : 'text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-50'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout button at bottom */}
      <div className="p-4 mt-auto mb-4 pr-6 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 pl-6 pr-4 py-3.5 rounded-r-full text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0 text-slate-400" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle - Desktop only */}
      <div className="hidden lg:block border-t border-slate-200 p-3 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col bg-white border-r border-slate-200 h-full shrink-0 z-10"
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-full w-[260px] bg-white border-r border-slate-200 z-50"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
