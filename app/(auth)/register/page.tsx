'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'COUPLE' as 'COUPLE' | 'PLANNER' | 'VENDOR',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store tokens
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        toast.success('Account created successfully!');
        router.push('/dashboard');
      } else {
        toast.error(data.message || 'Registration failed');
        if (data.errors) {
          const errorObj: Record<string, string> = {};
          data.errors.forEach((error: any) => {
            errorObj[error.path[0]] = error.message;
          });
          setErrors(errorObj);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center">
            <Heart className="h-10 w-10 text-pink-600" />
            <span className="ml-2 text-3xl font-bold text-gray-900">WeddingPlanner</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-gray-600">Start planning your perfect day</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                error={errors.firstName}
                required
              />

              <Input
                label="Last Name"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                error={errors.lastName}
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />

            <Input
              label="Phone (Optional)"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              helperText="Must be at least 8 characters"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value="COUPLE"
                    checked={formData.role === 'COUPLE'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  <span className="ml-3">
                    <span className="block font-medium">Couple</span>
                    <span className="text-sm text-gray-500">Planning my own wedding</span>
                  </span>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value="PLANNER"
                    checked={formData.role === 'PLANNER'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  <span className="ml-3">
                    <span className="block font-medium">Wedding Planner</span>
                    <span className="text-sm text-gray-500">Professional event planner</span>
                  </span>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value="VENDOR"
                    checked={formData.role === 'VENDOR'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  <span className="ml-3">
                    <span className="block font-medium">Vendor</span>
                    <span className="text-sm text-gray-500">Photographer, venue, caterer, etc.</span>
                  </span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
