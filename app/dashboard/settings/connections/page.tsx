'use client'

export default function SocialConnections() {
  // URLs for your OAuth bridge routes
  const platforms = [
    { name: 'LinkedIn', color: 'bg-blue-700', route: '/api/auth/linkedin' },
    { name: 'Instagram / Facebook', color: 'bg-pink-600', route: '/api/auth/meta' },
    { name: 'X (Twitter)', color: 'bg-black', route: '/api/auth/x' }
  ];

  return (
    <div className="p-8 max-w-2xl bg-white rounded-2xl shadow-sm border">
      <h2 className="text-2xl font-bold mb-2">Connect Your Channels</h2>
      <p className="text-gray-500 mb-8">Link your accounts to enable the 7-day CMO Automation.</p>
      
      <div className="space-y-4">
        {platforms.map((p) => (
          <div key={p.name} className="flex items-center justify-between p-4 border rounded-xl">
            <span className="font-semibold">{p.name}</span>
            <button 
              onClick={() => window.location.href = p.route}
              className={`${p.color} text-white px-6 py-2 rounded-lg text-sm font-bold`}
            >
              Connect Account
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}