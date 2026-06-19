import { Brain } from 'lucide-react';
import Footer from './Footer';

const AuthShell = ({ children, contentClassName = '' }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 flex flex-col items-center mb-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Brain className="w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">LearnAI</span>
        </div>
      </div>

      <div className={`sm:mx-auto sm:w-full sm:max-w-md z-10 ${contentClassName}`}>
        {children}
      </div>
      <div className="mt-8 z-10 w-full flex justify-center">
        <Footer />
      </div>
    </div>
  );
};

export default AuthShell;
