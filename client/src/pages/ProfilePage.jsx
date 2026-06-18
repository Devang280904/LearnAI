import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ProfilePage = () => {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Required';
    if (!passwordData.newPassword) errors.newPassword = 'Required';
    else if (passwordData.newPassword.length < 6) errors.newPassword = 'Must be at least 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = 'Passwords don\'t match';
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h1 className="text-[28px] font-bold text-slate-900">Profile Settings</h1>

      {/* User Information Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">User Information</h2>
        <div className="space-y-4">
          <Input
            label="Username"
            icon={User}
            value={user?.name || ''}
            disabled
            className="bg-slate-50 cursor-not-allowed border-slate-200"
          />
          <Input
            label="Email Address"
            icon={Mail}
            value={user?.email || ''}
            disabled
            className="bg-slate-50 cursor-not-allowed border-slate-200"
          />
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            icon={Lock}
            value={passwordData.currentPassword}
            onChange={(e) => { setPasswordData({ ...passwordData, currentPassword: e.target.value }); setPasswordErrors({ ...passwordErrors, currentPassword: '' }); }}
            error={passwordErrors.currentPassword}
            placeholder=""
          />
          <Input
            label="New Password"
            type="password"
            icon={Lock}
            value={passwordData.newPassword}
            onChange={(e) => { setPasswordData({ ...passwordData, newPassword: e.target.value }); setPasswordErrors({ ...passwordErrors, newPassword: '' }); }}
            error={passwordErrors.newPassword}
            placeholder=""
          />
          <Input
            label="Confirm New Password"
            type="password"
            icon={Lock}
            value={passwordData.confirmPassword}
            onChange={(e) => { setPasswordData({ ...passwordData, confirmPassword: e.target.value }); setPasswordErrors({ ...passwordErrors, confirmPassword: '' }); }}
            error={passwordErrors.confirmPassword}
            placeholder=""
          />
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              isLoading={passwordLoading}
              variant="primary"
              className="px-6 py-2.5 font-medium rounded-xl text-white"
            >
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ProfilePage;

