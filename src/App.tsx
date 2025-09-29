import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import ServiceSearch from './components/ServiceSearch';
import { Wishlist } from './components/Wishlist';
import { Profile } from './components/Profile';
import { AuthPage } from './AuthPage';
import { ToastContainer } from './components/Toast';
import { AuthTest } from './components/AuthTest';
import CostCalculatorPage from './CostCalculatorPage';
import TiffinRentalList from './components/TiffinRentalList';
import { LoginPromptModal } from './components/LoginPromptModal';
import { supabase } from './config/supabase';


function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAuthPage, setShowAuthPage] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url,
          supabase: true
        };
        setUser(userData);
        // Store in localStorage for consistency
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Clear any stale data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
            supabase: true
          };
          setUser(userData);
          localStorage.setItem('token', session.access_token);
          localStorage.setItem('user', JSON.stringify(userData));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Clear user-specific data
          clearUserSpecificData();
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const clearUserSpecificData = () => {
    // Clear user-specific localStorage data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('user_') || key === 'local_bookmarks' || key === 'local_bookmark_items')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const handleAuth = (user: any, token: string) => {
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    // Return to main app after successful login
    setShowAuthPage(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // The onAuthStateChange listener will handle cleanup
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback cleanup
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      clearUserSpecificData();
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page when explicitly requested
  if (showAuthPage) {
    return (
      <>
        <AuthPage onAuth={handleAuth} />
        <ToastContainer />
      </>
    );
  }

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const handleLoginPrompt = () => {
    setShowAuthModal(false);
    setShowAuthPage(true);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'search':
        return <ServiceSearch user={user} onAuthRequired={handleAuthRequired} />;
      case 'tiffin':
        return <TiffinRentalList />;
      case 'calculator':
        return <CostCalculatorPage />;
      case 'wishlist':
        return <Wishlist user={user} onAuthRequired={handleAuthRequired} />;
      case 'profile':
        return <Profile user={user} onAuthRequired={handleAuthRequired} />;
      case 'authtest':
        return <AuthTest />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      <div className="flex justify-end gap-2 p-2">
        {user ? (
          <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={handleSignOut}>
            Sign Out
          </button>
        ) : (
          <button 
            className="bg-blue-500 text-white px-3 py-1 rounded" 
            onClick={() => setShowAuthPage(true)}
          >
            Login / Sign Up
          </button>
        )}
      </div>
      {renderCurrentPage()}
      <LoginPromptModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLoginPrompt}
        message="You need to login to save items to your wishlist or edit your profile."
      />
      <ToastContainer />
    </Layout>
  );
}

export default App;