"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { authApi } from '@/lib/services/user/api';
import PasswordChangeModal from '@/components/PasswordChangeModal';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [isPasswordResetRequired, setIsPasswordResetRequired] = useState(false);

  useEffect(() => {
    if (isLoggedIn && !isPasswordResetRequired) {
      router.push('/');
    }
  }, [isLoggedIn, isPasswordResetRequired, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      if (!email.trim() || !password.trim()) {
        setLoginError('이메일과 비밀번호를 모두 입력해주세요.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setLoginError('올바른 이메일 형식을 입력해주세요.');
        return;
      }

      const loginData = await authApi.login({ email, password });

      const userData = {
        id: loginData.userId,
        email: loginData.email,
        name: loginData.name,
        role: loginData.role,
      };

      login(userData, {
        accessToken: loginData.accessToken,
        expiresIn: loginData.expiresIn,
      });

      if (loginData.needsPasswordReset) {
        setIsPasswordResetRequired(true);
        setShowPasswordChangeModal(true);
        toast.warning('비밀번호를 변경해주세요.');
      } else {
        toast.success('로그인 성공!');
        router.push('/');
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      const errorMessage = error.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChangeSuccess = () => {
    setShowPasswordChangeModal(false);
    setIsPasswordResetRequired(false);
    toast.success('비밀번호가 성공적으로 변경되었습니다. 메인 페이지로 이동합니다.');
    router.push('/');
  };

  const handlePasswordChangeCancel = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      setShowPasswordChangeModal(false);
      setIsPasswordResetRequired(false);
      window.location.href = '/login';
    }
  };

  return (!isLoggedIn || isPasswordResetRequired) && (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 animate-blob rounded-full bg-purple-300 mix-blend-multiply opacity-70 blur-xl"></div>
        <div className="animation-delay-2000 absolute -bottom-40 -left-40 h-80 w-80 animate-blob rounded-full bg-yellow-300 mix-blend-multiply opacity-70 blur-xl"></div>
        <div className="animation-delay-4000 absolute top-40 left-40 h-80 w-80 animate-blob rounded-full bg-pink-300 mix-blend-multiply opacity-70 blur-xl"></div>
      </div>
      <Card className="relative z-10 w-full max-w-md border-0 bg-white/80 shadow-2xl backdrop-blur-sm login-card">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center login-logo">
            <Image src="/logo.png" alt="Hermes Logo" width={200} height={200} />
          </div>
          <CardTitle className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-3xl font-bold tracking-wide text-transparent login-title">
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent className="login-content">
          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div className="space-y-2 login-email">
              <Label htmlFor="email" className="text-sm font-semibold tracking-wide text-gray-700">
                Email / ID
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  className={`h-12 pl-10 font-medium ${
                    loginError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>
            <div className="space-y-2 login-password">
              <Label htmlFor="password" className="text-sm font-semibold tracking-wide text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className={`h-12 pl-10 pr-12 font-medium ${
                    loginError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {loginError && <p className="mt-1 text-xs text-red-500">{loginError}</p>}
            </div>
            <Button
              type="submit"
              className="login-button h-12 w-full transform rounded-lg bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-gray-800 hover:to-gray-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>로그인 중...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm font-medium tracking-wide text-gray-500 login-footer">
            비밀번호를 잊어버렸을 경우 관리자에게 문의 바랍니다.
          </p>
        </CardContent>
      </Card>

      <PasswordChangeModal
        isOpen={showPasswordChangeModal}
        onClose={handlePasswordChangeCancel}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
}