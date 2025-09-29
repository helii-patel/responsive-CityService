import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export const AuthTest: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        console.log('Session:', session);
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    
    if (error) {
      console.error('Google login error:', error);
      alert('Error: ' + error.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Auth Test</h2>
      
      {session ? (
        <div>
          <p className="text-green-600 mb-2">✅ Authenticated!</p>
          <p className="text-sm mb-2">User: {session.user.email}</p>
          <p className="text-sm mb-4">Provider: {session.user.app_metadata.provider}</p>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">Not authenticated</p>
          <button
            onClick={handleGoogleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Google Login
          </button>
        </div>
      )}
    </div>
  );
};