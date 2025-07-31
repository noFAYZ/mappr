'use client'

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Textarea } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { Divider } from '@heroui/divider';
import { Badge } from '@heroui/badge';
import { Avatar } from '@heroui/avatar';
import { Chip } from '@heroui/chip';
import { Tabs, Tab } from '@heroui/tabs';
import { useTheme } from 'next-themes';
import { 
  User, 
  Bell, 
  Monitor, 
  Shield, 
  Palette, 
  Layout,
  Save,
  Camera,
  Sun,
  Moon,
  Crown,
  Settings as SettingsIcon,
  RefreshCw,
  LogOut,
  Mail,
  Check,
  Star,
  Zap,
  Keyboard,
  X,
  SaveAll,
  Verified
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useNavigationContext } from '@/contexts/NavigationContext';
import { useUIStore } from '@/stores';
import ThemeSwitcher from '@/components/shared/theme-switch';
import { MaterialIconThemeVerified } from '@/components/icons/icons';

export default function SettingsPage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { 
    isSidebarCollapsed, 
    setSidebarCollapsed 
  } = useNavigationContext();
  const { 
    compactMode, 
    setCompactMode,
    addNotification,
    clearNotifications,
    clearReadNotifications,
    notifications
  } = useUIStore();
  
  // Local state for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || ''
  });

  // Update local state when profile changes
  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, avatar_url: e.target?.result }));
      };
      reader.readAsDataURL(file);

      addNotification({
        type: 'info',
        title: 'Avatar Preview',
        message: 'Avatar preview updated. Click Save to apply changes.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to upload avatar. Please try again.'
      });
    }
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'enterprise':
        return (
          <Chip size="sm" color="warning" variant="bordered" startContent={<Crown className="w-3 h-3" />} className=' gap-1 px-2'>
            Enterprise
          </Chip>
        );
      case 'pro':
        return (
          <Chip size="sm" color="secondary" variant="bordered" startContent={<Shield className="w-3 h-3" />} className=' gap-1 px-2'>
            Pro
          </Chip>
        );
      default:
        return (
          <Chip size="sm" color="default" variant="bordered" startContent={<Star className="w-3 h-3" />}
          className=' gap-1 px-2'
          
          >
            Free
          </Chip>
        );
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      addNotification({
        type: 'success',
        title: 'Signed Out',
        message: 'You have been successfully signed out.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Sign Out Failed',
        message: 'Failed to sign out. Please try again.'
      });
    }
  };

  const getNotificationStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    return { total, unread };
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h3 className="font-semibold">Loading Settings</h3>
            <p className="text-sm text-default-500">Preparing your preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-default-600">Manage your account and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {getTierBadge(profile.tier)}
          {isEditing && (
            <Button 
            variant='solid'
          
              size="sm"
              startContent={<SaveAll className="w-4 h-4" />}
              className='bg-gradient-to-br from-amber-500/85 via-orange-500 to-pink-500/85 text-white/85'
              onPress={handleSaveProfile}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Clean Tabs */}
      <Tabs 
        variant="underlined"
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary font-medium",
          panel: "pt-6"
        }}
      >
        
        {/* Profile Tab */}
        <Tab 
          key="profile" 
          title={
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Main Profile Card */}
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                  <p className="text-sm text-default-500">Manage your personal details</p>
                </div>
                <Button
                  size="sm"
                  variant={isEditing ? "solid" : "flat"}
                  color={isEditing ? "danger" : "primary"}
                  onPress={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardBody className="space-y-6">
                
                {/* Avatar & Basic Info */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar
                      src={profileData.avatar_url}
                      name={profileData.full_name || user.email}
                      className="w-20 h-20"
                    />
                    {isEditing && (
                      <Button
                        isIconOnly
                        size="sm"
                        color="primary"
                        className="absolute -bottom-1 -right-1"
                        onPress={() => document.getElementById('avatar-upload')?.click()}
                      >
                        <Camera className="w-3 h-3" />
                      </Button>
                    )}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-xl font-bold">{profileData.full_name || 'Welcome!'}</h4>
                    <p className="text-default-600 flex items-center justify-center sm:justify-start gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      {getTierBadge(profile.tier)}
                      <Chip color="success" variant="flat" size="sm" startContent={<MaterialIconThemeVerified className="w-4 h-4" />}>
                        Verified
                      </Chip>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      variant="bordered"
                      isReadOnly={!isEditing}
                    />
                    <Input
                      label="Email Address"
                      value={user.email}
                      variant="bordered"
                      isReadOnly
                      description="Contact support to change email"
                    />
                  </div>
                  
                  <Textarea
                    label="Bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    variant="bordered"
                    isReadOnly={!isEditing}
                    placeholder="Tell us about yourself..."
                    minRows={3}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Account Info Sidebar */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Account Details</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-default-500">User ID</p>
                    <code className="text-xs font-mono">{user.id.slice(0, 8)}...</code>
                  </div>
                  <div>
                    <p className="text-xs text-default-500">Plan</p>
                    <p className="text-sm font-medium capitalize">{profile.tier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-default-500">Member Since</p>
                    <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <Divider />
                
                <Button
                  color="danger"
                  variant="flat"
                  size="sm"
                  startContent={<LogOut className="w-4 h-4" />}
                  onPress={handleSignOut}
                  className="w-full"
                >
                  Sign Out
                </Button>
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* Appearance Tab */}
        <Tab 
          key="appearance" 
          title={
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <div>
                  <h3 className="font-semibold">Theme Preference</h3>
                  <p className="text-sm text-default-500">Choose your visual style</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                
                {/* Theme Selector */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
                    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
                    { value: 'system', label: 'Auto', icon: <Monitor className="w-4 h-4" /> }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={theme === option.value ? "solid" : "bordered"}
                      color={theme === option.value ? "primary" : "default"}
                      className="h-16 flex-col gap-1"
                      onPress={() => setTheme(option.value)}
                    >
                      {option.icon}
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  ))}
                </div>

                <Divider />

                {/* Interface Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-default-500">Reduce spacing throughout interface</p>
                    </div>
                    <Switch
                      isSelected={compactMode}
                      onValueChange={setCompactMode}
                      color="primary"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sidebar Collapsed</p>
                      <p className="text-sm text-default-500">Start with minimized sidebar</p>
                    </div>
                    <Switch
                      isSelected={isSidebarCollapsed}
                      onValueChange={setSidebarCollapsed}
                      color="secondary"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Quick Controls */}
            <Card>
              <CardHeader>
                <div>
                  <h3 className="font-semibold">Quick Controls</h3>
                  <p className="text-sm text-default-500">Fast theme switching</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                
                {/* Theme Switcher */}
                <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg">
                  <div>
                    <p className="font-medium">Theme Toggle</p>
                    <p className="text-sm text-default-500 capitalize">
                      Current: {theme === 'system' ? 'Auto' : theme}
                    </p>
                  </div>
                  <ThemeSwitcher />
                </div>

                {/* Keyboard Shortcut Info */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Keyboard className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Keyboard Shortcut</p>
                      <p className="text-xs text-default-600 mt-1">
                        Press <kbd className="px-1 py-0.5 bg-default-100 rounded text-xs">⌘+D</kbd> to toggle theme
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* Notifications Tab */}
        <Tab 
          key="notifications" 
          title={
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
              {getNotificationStats().unread > 0 && (
                <Badge color="danger" content={getNotificationStats().unread} size="sm" />
              )}
            </div>
          }
        >
          <Card>
            <CardHeader>
              <div>
                <h3 className="font-semibold">Notification Center</h3>
                <p className="text-sm text-default-500">
                  {getNotificationStats().total} total, {getNotificationStats().unread} unread
                </p>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<RefreshCw className="w-4 h-4" />}
                  onPress={clearReadNotifications}
                  isDisabled={getNotificationStats().unread === 0}
                >
                  Clear Read ({getNotificationStats().total - getNotificationStats().unread})
                </Button>
                
                <Button
                  color="danger"
                  variant="flat"
                  startContent={<X className="w-4 h-4" />}
                  onPress={() => {
                    clearNotifications();
                    addNotification({
                      type: 'success',
                      title: 'Notifications Cleared',
                      message: 'All notifications have been cleared.'
                    });
                  }}
                  isDisabled={getNotificationStats().total === 0}
                >
                  Clear All ({getNotificationStats().total})
                </Button>
              </div>

              {/* System Status */}
              <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <h4 className="font-medium text-success-700">System Active</h4>
                    <p className="text-sm text-success-600 mt-1">
                      Notification system is operational. Manage notifications via navbar dropdown.
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>

        {/* System Tab */}
        <Tab 
          key="system" 
          title={
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              System
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Interface Settings */}
            <Card>
              <CardHeader>
                <div>
                  <h3 className="font-semibold">Interface Settings</h3>
                  <p className="text-sm text-default-500">Control application behavior</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                
                {/* Navigation Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-collapse Sidebar</p>
                      <p className="text-sm text-default-500">Start with minimized navigation</p>
                    </div>
                    <Switch
                      isSelected={isSidebarCollapsed}
                      onValueChange={setSidebarCollapsed}
                      color="secondary"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact Interface</p>
                      <p className="text-sm text-default-500">Reduce spacing and padding</p>
                    </div>
                    <Switch
                      isSelected={compactMode}
                      onValueChange={setCompactMode}
                      color="warning"
                    />
                  </div>
                </div>

                <Divider />

                {/* System Info */}
                <div className="p-4 bg-default-50 rounded-lg">
                  <h4 className="font-medium mb-3">System Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-default-500">Version</p>
                      <code className="font-mono">v2.1.0</code>
                    </div>
                    <div>
                      <p className="text-default-500">Build</p>
                      <code className="font-mono">#1234</code>
                    </div>
                    <div>
                      <p className="text-default-500">Theme</p>
                      <span className="capitalize">{theme}</span>
                    </div>
                    <div>
                      <p className="text-default-500">Layout</p>
                      <span>{compactMode ? 'Compact' : 'Standard'}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Performance & Features */}
            <Card>
              <CardHeader>
                <div>
                  <h3 className="font-semibold">Performance</h3>
                  <p className="text-sm text-default-500">Application metrics</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-primary/5 rounded-lg text-center">
                    <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-default-500">Load Time</p>
                    <p className="font-mono text-sm">1.2s</p>
                  </div>
                  
                  <div className="p-3 bg-success/5 rounded-lg text-center">
                    <Monitor className="w-5 h-5 text-success mx-auto mb-1" />
                    <p className="text-xs text-default-500">Memory</p>
                    <p className="font-mono text-sm">45MB</p>
                  </div>
                  
                  <div className="p-3 bg-secondary/5 rounded-lg text-center">
                    <Shield className="w-5 h-5 text-secondary mx-auto mb-1" />
                    <p className="text-xs text-default-500">Security</p>
                    <Badge color="success" size="sm">Active</Badge>
                  </div>
                  
                  <div className="p-3 bg-warning/5 rounded-lg text-center">
                    <Layout className="w-5 h-5 text-warning mx-auto mb-1" />
                    <p className="text-xs text-default-500">Cache</p>
                    <Badge color="success" size="sm">Enabled</Badge>
                  </div>
                </div>

                <Divider />

                {/* State Management Info */}
                <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                  <div className="flex items-start gap-3">
                    <SettingsIcon className="w-4 h-4 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-success-700">Auto-Save Active</p>
                      <p className="text-xs text-success-600 mt-1">
                        Settings automatically persist across sessions
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}