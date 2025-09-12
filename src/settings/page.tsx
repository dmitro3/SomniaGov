

import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  Settings,
  Bell,
  Shield,
  Eye,
  Globe,
  Moon,
  Sun,
  Zap,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  
  const [settings, setSettings] = useState({
    notifications: {
      proposals: true,
      voting: true,
      rewards: true,
      badges: false,
      email: '',
    },
    privacy: {
      publicProfile: true,
      showVotes: true,
      showStakes: false,
      showBadges: true,
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      currency: 'USD',
      gasPrice: 'standard',
    },
    advanced: {
      slippage: '0.5',
      deadline: '20',
      expertMode: false,
    }
  });

  const handleSave = () => {
    // In a real implementation, this would save to localStorage or backend
    localStorage.setItem('somiagov-settings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    const defaultSettings = {
      notifications: {
        proposals: true,
        voting: true,
        rewards: true,
        badges: false,
        email: '',
      },
      privacy: {
        publicProfile: true,
        showVotes: true,
        showStakes: false,
        showBadges: true,
      },
      preferences: {
        theme: 'dark',
        language: 'en',
        currency: 'USD',
        gasPrice: 'standard',
      },
      advanced: {
        slippage: '0.5',
        deadline: '20',
        expertMode: false,
      }
    };
    setSettings(defaultSettings);
    toast.success('Settings reset to default!');
  };

  const exportData = () => {
    // In a real implementation, this would export user data
    const userData = {
      address,
      settings,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `somiagov-data-${address?.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
          <p className="text-gray-400">Please connect your wallet to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
        <p className="text-gray-400">Customize your governance experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark p-4 rounded-xl sticky top-8"
          >
            <nav className="space-y-2">
              <a href="#notifications" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary-600/10 text-gray-300 hover:text-white transition-colors">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </a>
              <a href="#privacy" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary-600/10 text-gray-300 hover:text-white transition-colors">
                <Shield className="h-4 w-4" />
                <span>Privacy</span>
              </a>
              <a href="#preferences" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary-600/10 text-gray-300 hover:text-white transition-colors">
                <Eye className="h-4 w-4" />
                <span>Preferences</span>
              </a>
              <a href="#advanced" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary-600/10 text-gray-300 hover:text-white transition-colors">
                <Zap className="h-4 w-4" />
                <span>Advanced</span>
              </a>
              <a href="#data" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary-600/10 text-gray-300 hover:text-white transition-colors">
                <Database className="h-4 w-4" />
                <span>Data</span>
              </a>
            </nav>
          </motion.div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Notifications */}
          <motion.section
            id="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-dark p-6 rounded-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-400" />
              Notification Settings
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">New Proposals</div>
                  <div className="text-sm text-gray-400">Get notified when new proposals are created</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.proposals}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, proposals: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Voting Reminders</div>
                  <div className="text-sm text-gray-400">Remind me about active proposals I haven't voted on</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.voting}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, voting: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Reward Notifications</div>
                  <div className="text-sm text-gray-400">Get notified about staking rewards and claims</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.rewards}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, rewards: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Badge Achievements</div>
                  <div className="text-sm text-gray-400">Get notified when you earn new badges or evolutions</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.badges}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, badges: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </motion.section>

          {/* Privacy */}
          <motion.section
            id="privacy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-dark p-6 rounded-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-400" />
              Privacy Settings
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Public Profile</div>
                  <div className="text-sm text-gray-400">Allow others to view your governance profile</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.publicProfile}
                    onChange={(e) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, publicProfile: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Show Voting History</div>
                  <div className="text-sm text-gray-400">Display your voting choices on proposals</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showVotes}
                    onChange={(e) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showVotes: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Show Staking Info</div>
                  <div className="text-sm text-gray-400">Display your staking amounts and rewards</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showStakes}
                    onChange={(e) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showStakes: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </motion.section>

          {/* Preferences */}
          <motion.section
            id="preferences"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-dark p-6 rounded-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-purple-400" />
              Display Preferences
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                <select
                  value={settings.preferences.theme}
                  onChange={(e) => setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, theme: e.target.value }
                  })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, language: e.target.value }
                  })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Default Gas Price</label>
                <select
                  value={settings.preferences.gasPrice}
                  onChange={(e) => setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, gasPrice: e.target.value }
                  })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="slow">Slow</option>
                  <option value="standard">Standard</option>
                  <option value="fast">Fast</option>
                </select>
              </div>
            </div>
          </motion.section>

          {/* Advanced */}
          <motion.section
            id="advanced"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-dark p-6 rounded-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-400" />
              Advanced Settings
            </h2>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-yellow-200 text-sm">Advanced settings can affect transaction behavior. Use with caution.</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slippage Tolerance ({settings.advanced.slippage}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={settings.advanced.slippage}
                  onChange={(e) => setSettings({
                    ...settings,
                    advanced: { ...settings.advanced, slippage: e.target.value }
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0.1%</span>
                  <span>5%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Transaction Deadline ({settings.advanced.deadline} minutes)
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={settings.advanced.deadline}
                  onChange={(e) => setSettings({
                    ...settings,
                    advanced: { ...settings.advanced, deadline: e.target.value }
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5 min</span>
                  <span>60 min</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Expert Mode</div>
                  <div className="text-sm text-gray-400">Disable confirmation prompts for experienced users</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.advanced.expertMode}
                    onChange={(e) => setSettings({
                      ...settings,
                      advanced: { ...settings.advanced, expertMode: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </motion.section>

          {/* Data Management */}
          <motion.section
            id="data"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-dark p-6 rounded-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Database className="h-5 w-5 mr-2 text-cyan-400" />
              Data Management
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Export Data</div>
                  <div className="text-sm text-gray-400">Download your governance data and settings</div>
                </div>
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Reset Settings</div>
                  <div className="text-sm text-gray-400">Reset all settings to default values</div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </motion.section>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-end"
          >
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}