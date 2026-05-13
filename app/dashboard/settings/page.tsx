'use client'; // This MUST be the first line

export const dynamic = 'force-dynamic'; // Prevents the 60s timeout during build

export default function Connections() {
  const connect = (platform: string) => {
    window.location.href = `/api/auth/${platform}`;
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Connect Your Socials</h2>
      <div className="grid gap-4">
        <button 
          onClick={() => connect('linkedin')} 
          className="bg-[#0077b5] text-white p-3 rounded"
        >
          Connect LinkedIn
        </button>
        <button 
          onClick={() => connect('meta')} 
          className="bg-[#0668E1] text-white p-3 rounded"
        >
          Connect FB & Instagram
        </button>
        <button 
          onClick={() => connect('x')} 
          className="bg-black text-white p-3 rounded"
        >
          Connect X (Twitter)
        </button>
      </div>
    </div>
  );
}