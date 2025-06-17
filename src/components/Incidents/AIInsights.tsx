import React from 'react';
import { motion } from 'framer-motion';
import { Incident } from '../../types';
import { 
  Brain,
  Lightbulb,
  Target,
  Clock,
  AlertTriangle,
  Zap,
  Shield,
  Activity,
  Cpu,
  Bot,
  Sparkles
} from 'lucide-react';

interface AIInsightsProps {
  incident: Incident;
}

export function AIInsights({ incident }: AIInsightsProps) {
  // AI Insights based on incident data
  const getAIInsights = () => {
    const insights = [];
    
    // Priority-based insights
    if (incident.priority === 'critical') {
      insights.push({
        type: 'urgent',
        icon: AlertTriangle,
        title: 'Critical Priority Alert',
        description: 'This incident requires immediate attention. Consider activating emergency response protocols.',
        action: 'Activate Emergency Protocol',
        confidence: 95
      });
    }

    // Alert type specific insights
    switch (incident.alertType) {
      case 'equipment':
        insights.push({
          type: 'maintenance',
          icon: Cpu,
          title: 'Predictive Maintenance',
          description: 'AI analysis suggests checking related equipment components. Historical data shows 78% correlation with similar failures.',
          action: 'Run Diagnostic Scan',
          confidence: 87
        });
        break;
      case 'security':
        insights.push({
          type: 'security',
          icon: Shield,
          title: 'Security Pattern Analysis',
          description: 'Incident pattern matches previous security events. Recommend enhanced monitoring for 24 hours.',
          action: 'Enable Enhanced Monitoring',
          confidence: 92
        });
        break;
      case 'temperature':
        insights.push({
          type: 'environmental',
          icon: Activity,
          title: 'Environmental Control',
          description: 'Temperature anomaly detected. AI recommends checking HVAC system and nearby sensors.',
          action: 'Check HVAC Systems',
          confidence: 89
        });
        break;
    }

    // Location-based insights
    if (incident.location.includes('ASRS')) {
      insights.push({
        type: 'system',
        icon: Brain,
        title: 'ASRS System Analysis',
        description: 'Automated Storage system showing patterns consistent with crane calibration issues. Recommend preventive maintenance.',
        action: 'Schedule Calibration',
        confidence: 84
      });
    }

    // Time-based insights
    const hoursSinceCreated = (new Date().getTime() - incident.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreated > 2 && incident.status === 'new') {
      insights.push({
        type: 'workflow',
        icon: Clock,
        title: 'Response Time Alert',
        description: 'Incident has been open for over 2 hours. Consider escalation or reassignment to expedite resolution.',
        action: 'Escalate Priority',
        confidence: 91
      });
    }

    // Resolution suggestions
    if (incident.status === 'in-progress') {
      insights.push({
        type: 'resolution',
        icon: Target,
        title: 'Resolution Strategy',
        description: 'Based on similar incidents, average resolution time is 3.2 hours. Current progress is on track.',
        action: 'Continue Current Approach',
        confidence: 76
      });
    }

    return insights.slice(0, 3); // Limit to top 3 insights
  };

  const aiInsights = getAIInsights();

  const getInsightGradient = (type: string) => {
    switch (type) {
      case 'urgent': return 'from-red-500 to-orange-500';
      case 'security': return 'from-red-500 to-pink-500';
      case 'maintenance': return 'from-orange-500 to-yellow-500';
      case 'environmental': return 'from-blue-500 to-cyan-500';
      case 'system': return 'from-purple-500 to-pink-500';
      case 'workflow': return 'from-yellow-500 to-amber-500';
      case 'resolution': return 'from-emerald-500 to-green-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  return (
    <motion.div 
      className="glass-card p-6 hologram-effect"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl relative">
          <Brain className="w-5 h-5 text-white" />
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-purple-400/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">AI Insights</h3>
          <p className="text-sm text-purple-300/80">Intelligent recommendations</p>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Bot className="w-4 h-4 text-purple-400" />
          </motion.div>
          <span className="text-xs text-purple-300 font-mono">ANALYZING</span>
        </div>
      </div>

      <div className="space-y-4">
        {aiInsights.map((insight, index) => (
          <motion.div
            key={index}
            className="glass-card-hover p-4 border border-white/10 rounded-xl group cursor-pointer relative overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-start space-x-3">
              <motion.div 
                className={`p-2 rounded-lg bg-gradient-to-br ${getInsightGradient(insight.type)} flex-shrink-0`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <insight.icon className="w-4 h-4 text-white" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs font-mono text-teal-300">{insight.confidence}%</span>
                  </div>
                </div>
                
                <p className="text-xs text-slate-300 mb-3">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <motion.button 
                    className={`text-xs px-3 py-1 rounded-lg bg-gradient-to-r ${getInsightGradient(insight.type)} text-white font-medium`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {insight.action}
                  </motion.button>
                  
                  <div className="flex items-center space-x-1">
                    <Lightbulb className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-300 font-mono">AI SUGGESTION</span>
                  </div>
                </div>
                
                {/* Confidence bar */}
                <div className="mt-3">
                  <div className="w-full bg-slate-700 rounded-full h-1">
                    <motion.div 
                      className={`h-1 rounded-full bg-gradient-to-r ${getInsightGradient(insight.type)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${insight.confidence}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Engine Status */}
      <motion.div 
        className="mt-6 p-3 glass-card rounded-xl border border-purple-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-sm font-semibold text-white">AI Analysis Engine</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-mono">ACTIVE</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-400 font-mono">
          Processing incident patterns • Confidence: {Math.max(...aiInsights.map(i => i.confidence))}% • Last update: 2s ago
        </div>
      </motion.div>
    </motion.div>
  );
}