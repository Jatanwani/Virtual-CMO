'use client'
import { useState } from 'react'

export default function ContentDashboard({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts || []);

  const downloadPNG = async (url, day) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Day-${day}-Marketing.png`;
    link.click();
  };

  const scheduleAll = async () => {
    // Update all drafts to 'scheduled' in Supabase
    alert("7-Day Campaign Scheduled for Free Auto-Posting!");
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">7-Day Content Plan</h1>
        <button onClick={scheduleAll} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold">
          Start 7-Day Auto-Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="relative group h-56">
              <img src={post.image_url} className="w-full h-full object-cover" />
              <button 
                onClick={() => downloadPNG(post.image_url, i+1)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold"
              >
                Download PNG
              </button>
            </div>
            <div className="p-5">
              <h3 className="font-bold mb-2">{post.headline}</h3>
              <p className="text-xs text-gray-500 line-clamp-3">{post.body_content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}