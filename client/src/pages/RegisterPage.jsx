import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, User, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import Input from '../components/ui/Input';
import AuthShell from '../components/layout/AuthShell';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords don\'t match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <AuthShell contentClassName="max-w-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          {/* Green Logo Box */}
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-sm shadow-primary/10">
            <Brain className="w-8 h-8" />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
            <p className="text-sm text-slate-500">Sign up to begin your journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="FULL NAME"
              type="text"
              name="name"
              placeholder="Alex"
              icon={User}
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              labelClassName="text-[11px] font-bold text-slate-500 tracking-wide uppercase mb-1"
            />

            <Input
              label="EMAIL"
              type="email"
              name="email"
              placeholder="alex@timetoprogram.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              labelClassName="text-[11px] font-bold text-slate-500 tracking-wide uppercase mb-1"
            />

            <Input
              label="PASSWORD"
              type="password"
              name="password"
              placeholder=""
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              labelClassName="text-[11px] font-bold text-slate-500 tracking-wide uppercase mb-1"
            />

            <Input
              label="CONFIRM PASSWORD"
              type="password"
              name="confirmPassword"
              placeholder=""
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              labelClassName="text-[11px] font-bold text-slate-500 tracking-wide uppercase mb-1"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account...' : (
                <>
                  Create account <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Signin footer link */}
          <p className="text-center text-slate-500 text-xs mt-6 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms footer */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </motion.div>
    </AuthShell>
  );
};

export default RegisterPage;

