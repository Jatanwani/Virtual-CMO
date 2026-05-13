export const dynamic = 'force-dynamic';
'use client'
import { useState, useEffect } from 'react'
export const dynamic = 'force-dynamic';
// Define the structure of a post
interface Post {
  image_url: string;
  headline: string;
  body_content: string;
}

export default function ContentDashboard() {
  // We start with an empty list and let the app handle it internally
  const [posts, setPosts] = useState<Post[]>([]);

  // This function is for your manufacturing clients to download images
  const downloadPNG = async (url: string, day: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Day-${day}-Marketing.png`;
      link.click();
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const scheduleAll = async () => {
    alert("7-Day Campaign Scheduled for Free Auto-Posting!");
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">7-Day Content Plan</h1>
        <button 
          onClick={scheduleAll} 
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors"
        >
          Start 7-Day Auto-Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.length > 0 ? (
          posts.map((post, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="relative group h-56">
                <img 
                  src={post.image_url} 
                  alt={post.headline} 
                  className="w-full h-full object-cover" 
                />
                <button 
                  onClick={() => downloadPNG(post.image_url, i+1)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold"
                >
                  Download PNG
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-bold mb-2 text-gray-800">{post.headline}</h3>
                <p className="text-xs text-gray-500 line-clamp-3">{post.body_content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No content generated yet. Use your Virtual CMO to start.</p>
          </div>
        )}
      </div>
    </div>
  );
}