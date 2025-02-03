import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface Comment {
  id: number;
  section_id: string;
  content: string;
  created_at: string;
  user_email: string;
}

interface CommentsProps {
  sectionId: string;
}

export default function Comments({ sectionId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('section_id', sectionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      setComments(data || []);
    };

    fetchComments();

    // Subscribe to new comments
    const subscription = supabase
      .channel('comments')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'comments',
        filter: `section_id=eq.${sectionId}`
      }, payload => {
        setComments(current => [payload.new as Comment, ...current]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert('Please sign in to comment');
      return;
    }

    const { error } = await supabase.from('comments').insert([
      {
        section_id: sectionId,
        content: newComment,
        user_email: session.user.email,
      },
    ]);

    if (error) {
      console.error('Error adding comment:', error);
      return;
    }

    setNewComment('');
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Error signing in:', error);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Comments</h2>
      
      {session ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
            placeholder="Add a comment..."
            rows={3}
          />
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add Comment
            </button>
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-800"
            >
              Sign Out
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={handleSignIn}
          className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 mb-6"
        >
          Sign in to comment
        </button>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">{comment.user_email}</span>
              <span className="text-sm text-gray-500">
                {format(new Date(comment.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}