import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color = 'primary', index = 0 }) => {
  const [count, setCount] = useState(0);

  const colorMap = {
    primary: { bg: 'bg-[#24A0ED]', shadow: 'shadow-[#24A0ED]/30' },
    secondary: { bg: 'bg-[#EC4899]', shadow: 'shadow-[#EC4899]/30' },
    accent: { bg: 'bg-[#00B69B]', shadow: 'shadow-[#00B69B]/30' },
    success: { bg: 'bg-[#10B981]', shadow: 'shadow-[#10B981]/30' },
  };

  const colors = colorMap[color] || colorMap.primary;

  useEffect(() => {
    const numValue = typeof value === 'number' ? value : parseInt(value) || 0;
    if (numValue === 0) {
      setCount(0);
      return;
    }

    let start = 0;
    const duration = 1000;
    const increment = numValue / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= numValue) {
        setCount(numValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-white border border-slate-200 rounded-3xl p-8 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 min-w-0"
    >
      <div className="space-y-2 min-w-0 flex-1 pr-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 truncate">
          {typeof value === 'number' ? count.toLocaleString() : value}
        </h3>
      </div>
      <div className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center shrink-0 ${colors.bg} ${colors.shadow} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </motion.div>
  );
};

export default StatCard;
