"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, ThumbsUp, FileText, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Post State
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  
  // Post Detail / Comment State
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const toast = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/community');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostTitle) return;
    try {
      await api.post('/community', {
        title: newPostTitle,
        content: newPostContent
      });
      setShowNewPost(false);
      setNewPostTitle('');
      setNewPostContent('');
      toast.success('Post Created!', 'Your post is now live in the community.');
      fetchPosts();
    } catch (err) {
      console.error(err);
      toast.error('Error', 'Failed to create post.');
    }
  };

  const handleUpvote = async (postId) => {
    try {
      await api.post(`/community/${postId}/upvote`);
      // Optimistic update
      fetchPosts(); 
      if (selectedPost && selectedPost.id === postId) {
        openPost(postId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openPost = async (postId) => {
    try {
      const res = await api.get(`/community/${postId}`);
      setSelectedPost(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedPost) return;
    try {
      await api.post(`/community/${selectedPost.id}/comments`, { content: commentText });
      setCommentText('');
      toast.success('Comment Added', 'Your feedback has been posted.');
      openPost(selectedPost.id);
      fetchPosts();
    } catch (err) {
      console.error(err);
      toast.error('Error', 'Failed to add comment.');
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Community Review</h1>
          <p className="text-xl font-bold bg-brutal-green inline-block px-2 border-2 border-brutal-black">Peer-to-peer resume teardowns.</p>
        </div>
        <Button 
          variant="brutal" 
          onClick={() => setShowNewPost(!showNewPost)}
          className="bg-brutal-blue text-white"
        >
          {showNewPost ? 'Cancel' : 'Share Resume'}
        </Button>
      </div>

      {showNewPost && (
        <Card className="mb-8 border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)] bg-brutal-yellow">
          <CardContent className="p-6">
            <h2 className="text-2xl font-black mb-4">Request a Review</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="font-bold block mb-1">Title</label>
                <input 
                  value={newPostTitle}
                  onChange={e => setNewPostTitle(e.target.value)}
                  placeholder="e.g., Roasting my Frontend Developer Resume"
                  className="w-full border-2 border-brutal-black p-2 outline-none font-medium"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Context (Optional)</label>
                <textarea 
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  placeholder="What kind of roles are you applying for?"
                  rows={3}
                  className="w-full border-2 border-brutal-black p-2 outline-none font-medium resize-none"
                />
              </div>
              <Button type="submit" variant="brutal" className="w-full bg-white text-black">Post</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Feed List */}
        <div className={`md:col-span-1 space-y-4 ${selectedPost ? 'hidden md:block' : 'col-span-full md:col-span-2'}`}>
          {loading ? (
            <div className="flex items-center justify-center p-12">
               <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="border-4 border-brutal-black p-8 text-center bg-white opacity-50">
              <p className="font-bold">No posts yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map(post => (
              <Card 
                key={post.id} 
                onClick={() => openPost(post.id)}
                className={`cursor-pointer border-4 border-brutal-black transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,1)] ${selectedPost?.id === post.id ? 'bg-brutal-pink' : 'bg-white'}`}
              >
                <CardContent className="p-4">
                  <h3 className="font-black text-lg line-clamp-2">{post.title}</h3>
                  <p className="text-xs font-bold text-gray-500 mt-1 uppercase">Posted by Anonymous</p>
                  
                  <div className="flex items-center gap-4 mt-4 text-sm font-bold">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUpvote(post.id); }}
                      className="flex items-center gap-1 hover:text-brutal-blue"
                    >
                      <ThumbsUp className="w-4 h-4" /> {post._count.upvotes}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" /> {post._count.comments}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Post Detail View */}
        {selectedPost && (
          <div className="md:col-span-2">
            <Card className="border-4 border-brutal-black bg-white shadow-[8px_8px_0_rgba(0,0,0,1)] h-[800px] flex flex-col">
              <div className="p-6 border-b-4 border-brutal-black">
                <Button variant="outline" onClick={() => setSelectedPost(null)} className="md:hidden mb-4 border-2 border-brutal-black font-bold">
                  &larr; Back to Feed
                </Button>
                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-3xl font-black">{selectedPost.title}</h2>
                  <Button 
                    variant="brutal" 
                    onClick={() => handleUpvote(selectedPost.id)}
                    className={selectedPost.hasUpvoted ? 'bg-brutal-blue text-white' : 'bg-white text-black'}
                  >
                    <ThumbsUp className="w-5 h-5 mr-2" /> {selectedPost._count.upvotes}
                  </Button>
                </div>
                {selectedPost.content && (
                  <p className="mt-4 font-medium text-lg">{selectedPost.content}</p>
                )}
                <div className="mt-4 inline-flex items-center gap-2 bg-brutal-bg p-3 border-2 border-dashed border-brutal-black">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="font-bold text-sm text-gray-500">[Resume PDF Placeholder]</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="flex-1 overflow-y-auto p-6 bg-brutal-bg space-y-4">
                {selectedPost.comments?.length === 0 ? (
                  <p className="text-center font-bold text-gray-500 mt-8">No feedback yet. Be the first!</p>
                ) : (
                  selectedPost.comments?.map(comment => (
                    <div key={comment.id} className="bg-white p-4 border-2 border-brutal-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-brutal-yellow border border-brutal-black rounded-full"></div>
                        <span className="font-bold text-xs uppercase">Peer</span>
                      </div>
                      <p className="font-medium">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t-4 border-brutal-black bg-white">
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input 
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Provide constructive feedback..."
                    className="flex-1 p-3 border-2 border-brutal-black outline-none font-medium focus:bg-brutal-yellow/20"
                  />
                  <Button type="submit" variant="brutal" className="bg-brutal-pink text-black px-6" disabled={!commentText.trim()}>
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
