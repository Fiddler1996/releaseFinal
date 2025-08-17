import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store/context';
import { useSecurity } from '../hooks/useSecurity';

interface SecurityGateProps {
  children: React.ReactNode;
}

export const SecurityGate: React.FC<SecurityGateProps> = ({ children }) => {
  const { security, initializeSecurity } = useAppContext();
  const { isInitialized } = useSecurity();
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if security is already initialized and unlocked
    if (security && isInitialized) {
      setIsUnlocked(true);
    }
  }, [security, isInitialized]);

  const handleUnlock = async () => {
    if (!masterPassword.trim()) {
      setError('Please enter a master password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!security) {
        // First time initialization
        if (initializeSecurity) {
          await initializeSecurity(masterPassword);
        }
        setIsUnlocked(true);
      } else {
        // Unlock existing security context
        const success = await security.unlock(masterPassword);
        if (success) {
          setIsUnlocked(true);
        } else {
          setError('Invalid master password');
        }
      }
    } catch (error) {
      setError(`Authentication failed: ${(error as any).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  const handleLock = () => {
    if (security) {
      security.lock();
      setIsUnlocked(false);
      setMasterPassword('');
      setError(null);
    }
  };

  if (!security || !isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Organizer Zero</h1>
            <p className="text-blue-200">Secure Access Required</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                Master Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your master password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleUnlock}
              disabled={isLoading || !masterPassword.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {!security ? 'Initializing...' : 'Unlocking...'}
                </div>
              ) : (
                !security ? 'Initialize Security' : 'Unlock'
              )}
            </button>

            {!security && (
              <div className="text-center">
                <p className="text-blue-200 text-sm">
                  This is your first time. Set a master password to encrypt your data.
                </p>
              </div>
            )}

            {/* TODO: Add WebAuthn support */}
            <div className="text-center">
              <button
                type="button"
                className="text-blue-200 hover:text-white text-sm transition-colors"
                onClick={() => {
                  // TODO: Implement WebAuthn authentication
                  console.log('WebAuthn not implemented yet');
                }}
              >
                Use Security Key (Coming Soon)
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-blue-300 text-xs">
              Your data is encrypted with AES-256-GCM and stored securely
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Security Status Bar */}
      <div className="bg-green-600 text-white px-4 py-2 text-sm font-medium text-center">
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Secure Session Active</span>
          <button
            onClick={handleLock}
            className="ml-4 px-2 py-1 bg-green-700 hover:bg-green-800 rounded text-xs transition-colors"
          >
            Lock
          </button>
        </div>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
};