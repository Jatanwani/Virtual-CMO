'use client'
export default function ConnectionsPage() {
  const connectLinkedIn = () => {
    // This redirects the user to LinkedIn to approve your app
    window.location.href = '/api/auth/linkedin';
  };

  return (
    <div className="p-10 bg-white rounded-xl shadow-sm border">
      <h2 className="text-xl font-bold mb-4">Social Media Integrations</h2>
      <p className="text-gray-600 mb-6 text-sm">Connect your accounts to enable 7-day auto-posting.</p>
      
      <button 
        onClick={connectLinkedIn}
        className="flex items-center gap-3 bg-[#0077b5] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#005582] transition-colors"
      >
        <span>Connect LinkedIn Professional</span>
      </button>
    </div>
  );
}