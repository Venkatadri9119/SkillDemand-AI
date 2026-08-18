import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { ReadinessData, SkillGapData, TargetJob } from '../types';

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGapData | null>(null);
  const [targetJobs, setTargetJobs] = useState<TargetJob[]>([]);
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [lastSynced, setLastSynced] = useState<string>('Just now');
  const [promptLoading, setPromptLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      setError(null);
      const [readinessRes, gapRes, jobsRes, historyRes] = await Promise.all([
        api.getReadiness(),
        api.getSkillGap(),
        api.getTargetJobs(),
        api.getTestHistory(),
      ]);
      setReadiness(readinessRes);
      setSkillGap(gapRes);
      setTargetJobs(jobsRes);
      setTestHistory(historyRes || []);
      if (readinessRes?.last_synced) {
        setLastSynced(readinessRes.last_synced);
      } else {
        setLastSynced(new Date().toLocaleTimeString() + ' UTC');
      }
    } catch (err: any) {
      console.error('Error in useDashboardData:', err);
      setError(err.message || 'Failed to load real-time career metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    // Real-time synchronization polling interval (every 8 seconds)
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const switchTargetJob = async (jobTitle: string) => {
    setLoading(true);
    try {
      await api.setPrimaryTargetJob(jobTitle);
      await fetchAllData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitDataPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;
    setPromptLoading(true);
    try {
      const updatedReadiness = await api.submitDataPrompt(promptText);
      setReadiness(updatedReadiness);
      await fetchAllData();
    } catch (err: any) {
      setError('Data Prompt failed: ' + err.message);
    } finally {
      setPromptLoading(false);
    }
  };

  return {
    loading,
    error,
    readiness,
    skillGap,
    targetJobs,
    testHistory,
    lastSynced,
    promptLoading,
    refetch: fetchAllData,
    switchTargetJob,
    submitDataPrompt,
  };
}
