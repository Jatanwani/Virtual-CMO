'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Post {
  image_url: string;
  headline: string;
  body_content: string;
}

export default function ContentDashboard() {
  const supabase = createClientComponentClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH LOGIC: This pulls the AI-generated posts from your database
  useEffect(() => {
    async function fetchPosts() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('content_posts') // Ensure this matches your Supabase table name
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) setPosts(data);
        if (error) console.error("Error fetching posts:", error);
      }
      setLoading(false);
    }
    fetchPosts();
  }, [supabase]);

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
    alert("Campaign Scheduled! Your marketing automation is now active.");
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading your content plan...</div>;

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Content Strategy</h1>
          <p className="text-gray-500">Generated content for your business niche.</p>
        </div>
        <button 
          onClick={scheduleAll} 
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg"
        >
          Start Auto-Posting
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {posts.length > 0 ? (
          posts.map((post, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="relative group h-56">
                <img 
                  src={post.image_url || 'https://via.placeholder.com/400x300?text=Generating+Image...'} 
                  alt={post.headline} 
                  className="w-full h-full object-cover" 
                />
                <button 
                  onClick={() => downloadPNG(post.image_url, i+1)}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold"
                >
                  Download Asset
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-bold mb-2 text-gray-800 line-clamp-1">{post.headline}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{post.body_content}</p>
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Day {i + 1}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-4">✍️</div>
            <p className="text-gray-500 font-medium">No content found yet.</p>
            <p className="text-sm text-gray-400">Run your CMO Brain to generate your first 7-day plan.</p>
          </div>
        )}
      </div>
    </div>
  );
}