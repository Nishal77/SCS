import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Shield, Edit, Save, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from './Header';
import { generateAvatarFromEmail, generateInitials, getDisplayName, getDisplayEmail } from '../../lib/avatar-utils';

const ProfilePage = () => {
  const [userSession, setUserSession] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    email_name: ''
  });
  const navigate = useNavigate();

  // Get user session data
  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        setUserSession(sessionData);
        setFormData({
          name: sessionData.name || '',
          email: sessionData.email || '',
          phone: sessionData.phone || '',
          email_name: sessionData.email_name || ''
        });
      } catch (error) {
        console.error('Error parsing user session:', error);
        setError('Failed to load user data');
      }
    } else {
      // Redirect to login if no session
      navigate('/auth/login');
      return;
    }
    setLoading(false);
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here you would typically update the user profile in the database
      // For now, we'll just update the local session
      const updatedSession = {
        ...userSession,
        ...formData
      };
      
      localStorage.setItem('user_session', JSON.stringify(updatedSession));
      setUserSession(updatedSession);
      setIsEditing(false);
      
      // Show success message (you could add a toast notification here)
      console.log('Profile updated successfully');
    } catch (error) {
      setError('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: userSession?.name || '',
      email: userSession?.email || '',
      phone: userSession?.phone || '',
      email_name: userSession?.email_name || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Get display information
  const displayName = getDisplayName(userSession);
  const displayEmail = getDisplayEmail(userSession);
  const avatarUrl = '/profile1.JPG';
  const initials = generateInitials(displayEmail, displayName);

  return (
    <div className="bg-stone-50 min-h-screen font-sans flex flex-col">
      <Header />
      
      <div className="bg-gray-50 py-8 flex-1 mt-32">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/user/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Account</h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4">
                    <Avatar className="w-28 h-28 border-4 border-amber-200 shadow-2xl hover:shadow-amber-200/50 transition-all duration-300 transform hover:scale-105">
                      <AvatarImage 
                        src={avatarUrl} 
                        alt={displayName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold text-3xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">{displayName}</CardTitle>
                  <CardDescription className="text-gray-600">{displayEmail}</CardDescription>
                  <div className="mt-3">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {userSession?.role === 'staff' ? 'Staff Member' : 'Customer'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{userSession?.email || 'No email'}</span>
                    </div>
                    {userSession?.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{userSession.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Account ID: {userSession?.id?.slice(0, 8)}...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information and account details
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={loading} className="gap-2">
                          <Save className="w-4 h-4" />
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={handleCancel} className="gap-2">
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="w-full"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md border">
                          <span className="text-gray-900">{formData.name || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                          className="w-full"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md border">
                          <span className="text-gray-900">{formData.email || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    {/* Email Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email_name" className="text-sm font-medium">
                        Display Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email_name"
                          name="email_name"
                          value={formData.email_name}
                          onChange={handleInputChange}
                          placeholder="Enter your display name"
                          className="w-full"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md border">
                          <span className="text-gray-900">{formData.email_name || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          className="w-full"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md border">
                          <span className="text-gray-900">{formData.phone || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    {/* Account Security Note */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Account Security</h4>
                          <p className="text-sm text-blue-700">
                            For security reasons, password changes and account deletion must be done through our support team. 
                            Contact us if you need assistance with these operations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
