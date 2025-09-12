import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Settings, Bell, Shield, Palette, Globe, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  
  const [settings, setSettings] = useState({
    notifications: {
      proposalUpdates: true,
      votingReminders: true,
      rewardAlerts: true,
      discussionReplies: false
    },
    privacy: {
      showProfile: true,
      showVotingHistory: false,
      showStakingBalance: false
    },
    appearance: {
      theme: 'dark',
      language: 'en'
    }
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
          <p className="text-gray-400">Please connect your wallet to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-gray-400">Customize your governance experience</p>
        </div>

        <div className="space-y-8">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark p-6 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-6 w-6 text-primary-400" />
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'proposalUpdates', label: 'Proposal Updates', desc: 'Get notified about new proposals and status changes' },
                { key: 'votingReminders', label: 'Voting Reminders', desc: 'Reminders before voting periods end' },
                { key: 'rewardAlerts', label: 'Reward Alerts', desc: 'Notifications about staking rewards and claims' },
                { key: 'discussionReplies', label: 'Discussion Replies', desc: 'Notifications when someone replies to your comments' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{label}</div>
                    <div className="text-sm text-gray-400">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.notifications[key]}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          [key]: e.target.checked
                        }
                      })}
                    />
                    <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark p-6 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Privacy</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'showProfile', label: 'Public Profile', desc: 'Allow others to view your profile information' },
                { key: 'showVotingHistory', label: 'Voting History', desc: 'Make your voting history publicly visible' },
                { key: 'showStakingBalance', label: 'Staking Balance', desc: 'Show your staking balance on your profile' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{label}</div>
                    <div className="text-sm text-gray-400">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.privacy[key]}
                      onChange={(e) => setSettings({
                        ...settings,
                        privacy: {
                          ...settings.privacy,
                          [key]: e.target.checked
                        }
                      })}
                    />
                    <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-dark p-6 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Palette className="h-6 w-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Appearance</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Theme</label>
                <select 
                  className="form-select"
                  value={settings.appearance.theme}
                  onChange={(e) => setSettings({
                    ...settings,
                    appearance: {
                      ...settings.appearance,
                      theme: e.target.value
                    }
                  })}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Language</label>
                <select 
                  className="form-select"
                  value={settings.appearance.language}
                  onChange={(e) => setSettings({
                    ...settings,
                    appearance: {
                      ...settings.appearance,
                      language: e.target.value
                    }
                  })}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <button 
              onClick={handleSave}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}