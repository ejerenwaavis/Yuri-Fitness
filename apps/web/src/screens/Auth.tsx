import React, { useContext, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../App';

export default function Auth() {
  const { login } = useContext(AuthContext);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!res.ok) {
        throw new Error('Failed to authenticate with backend');
      }

      const data = await res.json();
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-surface p-8 rounded-lg border border-surfaceElevated shadow-2xl">
        <h1 className="text-3xl font-black text-primary text-center mb-6 tracking-tighter">YURI</h1>
        <h2 className="text-xl font-bold text-textPrimary mb-4">Welcome</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login Failed')}
            theme="filled_black"
            shape="rectangular"
            text="continue_with"
          />
        </div>

        <div className="relative flex items-center py-2 mb-4">
          <div className="flex-grow border-t border-surfaceElevated"></div>
          <span className="flex-shrink-0 mx-4 text-textMuted text-sm">or</span>
          <div className="flex-grow border-t border-surfaceElevated"></div>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm text-textMuted mb-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-background border border-surfaceElevated rounded-md px-4 py-2 text-textPrimary focus:outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-textMuted mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-background border border-surfaceElevated rounded-md px-4 py-2 text-textPrimary focus:outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <button className="w-full bg-primary text-black font-bold py-3 rounded-md shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 mt-2">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
