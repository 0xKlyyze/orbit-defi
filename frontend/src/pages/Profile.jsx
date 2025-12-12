import React from 'react';

const Profile = () => {
  return (
    <main className="ml-20 p-8 text-white max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-[#666] text-sm">Manage your Orbit settings and preferences.</p>
      </header>

      <section className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-2">Account</h2>
          <p className="text-[#999] text-sm">Coming soon.</p>
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