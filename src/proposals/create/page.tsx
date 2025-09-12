

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateProposal } from '../../hooks/useProposals';

const categories = [
  'Treasury',
  'Protocol', 
  'Grants',
  'Technical',
  'Community',
  'Partnerships',
  'Security',
  'Other'
];

export default function CreateProposal() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { createProposal, loading } = useCreateProposal();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Treasury',
    executionDelay: '2', // days
    requiresMultiSig: false,
    options: ['For', 'Against']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (formData.options.length < 2) {
      newErrors.options = 'At least 2 voting options required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const result = await createProposal({
        title: formData.title,
        description: formData.description,
        options: formData.options.filter(opt => opt.trim()),
        executionDelay: Number(formData.executionDelay), // Pass in days, hook will convert
        requiresMultiSig: formData.requiresMultiSig
      });

      toast.success('Proposal created successfully!');
      navigate(`/proposals/${result.proposalId}`);
    } catch (error) {
      toast.error('Failed to create proposal');
      console.error(error);
    }
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, '']
      });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index)
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <AlertTriangle className="h-16 w-16 text-warning-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Wallet Connection Required</h1>
          <p className="text-gray-400 mb-6">
            You need to connect your wallet and have Council rank (1500+ reputation) to create proposals.
          </p>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/proposals" 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Proposals
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Create New Proposal</h1>
          <p className="text-xl text-gray-400">
            Submit a new governance proposal for community voting
          </p>
        </div>

        {/* Requirements Info */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-semibold">Proposal Requirements</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Must have Council rank or higher (1500+ reputation)</li>
            <li>• Must have minimum staked tokens</li>
            <li>• Proposal will be active for 7 days</li>
            <li>• Requires minimum quorum to pass</li>
            <li>• Execution delay of 2+ days after passing</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="stats-card">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Proposal Title *
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.title ? 'border-danger-500' : ''}`}
                  placeholder="Enter a clear, descriptive title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                {errors.title && (
                  <p className="text-danger-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  className={`form-textarea ${errors.description ? 'border-danger-500' : ''}`}
                  placeholder="Provide a detailed description of your proposal, including rationale, expected outcomes, and any relevant details..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                {errors.description && (
                  <p className="text-danger-400 text-sm mt-1">{errors.description}</p>
                )}
                <p className="text-sm text-gray-400 mt-1">
                  {formData.description.length}/50 minimum characters
                </p>
              </div>
            </div>
          </div>

          {/* Voting Options */}
          <div className="stats-card">
            <h2 className="text-xl font-semibold mb-6">Voting Options</h2>
            
            <div className="space-y-4">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder={`Option ${index + 1}...`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-3 text-danger-400 hover:bg-danger-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              
              {formData.options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </button>
              )}
              
              {errors.options && (
                <p className="text-danger-400 text-sm">{errors.options}</p>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="stats-card">
            <h2 className="text-xl font-semibold mb-6">Advanced Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Execution Delay (days)
                </label>
                <select
                  className="form-select max-w-xs"
                  value={formData.executionDelay}
                  onChange={(e) => setFormData({ ...formData, executionDelay: e.target.value })}
                >
                  <option value="1">1 day</option>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                </select>
                <p className="text-sm text-gray-400 mt-1">
                  Time delay before execution after proposal passes
                </p>
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
                    checked={formData.requiresMultiSig}
                    onChange={(e) => setFormData({ ...formData, requiresMultiSig: e.target.checked })}
                  />
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Requires Multi-signature Execution
                  </span>
                </label>
                <p className="text-sm text-gray-400 ml-8">
                  Requires additional validation from multisig wallet
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1 max-w-xs"
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-5 h-5 mr-2" />
                  Creating Proposal...
                </>
              ) : (
                'Create Proposal'
              )}
            </button>
            
            <Link to="/proposals" className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}