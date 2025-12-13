import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      // no-op for now; errors can be surfaced via global toasts if desired
    }
  };
  return (
<main className="p-8 text-white max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-[#666] text-sm">Manage your Orbit settings and preferences.</p>
      </header>

      <section className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-2">Account</h2>
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-[#0A0A0A] border border-[#222] text-sm hover:border-[#FFE066]">Logout</button>
          </div>
        </div>
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-2">Notifications</h2>
          <p className="text-[#999] text-sm">Coming soon.</p>
        </div>
      </section>
    </main>
  );
};

export default Profile;