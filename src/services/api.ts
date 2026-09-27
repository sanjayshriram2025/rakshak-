import axios from 'axios';
import { 
  Entity, 
  Relationship, 
  CaseFile, 
  AlertItem, 
  EvidenceItem, 
  AuditLog, 
  CrossCaseLink, 
  UserProfile, 
  AnalysisSummary 
} from '../types';
import { 
  mockCurrentUser, 
  mockEntities, 
  mockRelationships, 
  mockCases, 
  mockAlerts, 
  mockEvidenceItems, 
  mockAuditLogs, 
  mockCrossCaseLinks, 
  mockAnalysisSummary 
} from '../data/mockData';

// Set USE_MOCK_API to false so frontend queries live FastAPI backend via Axios!
export const USE_MOCK_API = false;
export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Create configured Axios Instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 5000
});

export const apiService = {
  // 1. AUTH & USER PROFILE
  auth: {
    login: async (officerId: string, password: string): Promise<{ token: string; user: UserProfile }> => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.post('/auth/login', { officerId, password });
          return res.data;
        } catch (err) {
          console.warn('Backend login failed, using fallback mock response', err);
        }
      }
      return {
        token: 'jwt_mock_rakshak_token_8849120491',
        user: { ...mockCurrentUser, name: officerId.includes('@') ? officerId.split('@')[0] : 'Officer ' + officerId }
      };
    },
    getCurrentUser: async (): Promise<UserProfile> => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.get('/auth/me');
          return res.data;
        } catch (err) {
          console.warn('Backend me query failed, using fallback mock', err);
        }
      }
      return mockCurrentUser;
    }
  },

  // 2. CASES & FIRS
  cases: {
    getAllCases: async (): Promise<CaseFile[]> => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.get('/cases');
          return res.data;
        } catch (err) {
          console.warn('Axios get cases failed, falling back to local data', err);
        }
      }
      return mockCases;
    },
    getCaseById: async (caseId: string): Promise<CaseFile | undefined> => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.get(`/cases/${caseId}`);
          return res.data;
        } catch (err) {
          console.warn('Axios get case by id failed, falling back', err);
        }
      }
      return mockCases.find(item => item.id === caseId || item.firNumber.includes(caseId));
    }
  },

  // 3. ENTITIES & DOSSIER
  entities: {
    getAllEntities: async (): Promise<Entity[]> => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.get('/entities');
          return res.data;
        } catch (err) {
          console.warn('Axios get entities failed, falling back', err);
        }
      }
      return mockEntities;
    },
    getEntityById: async (id: string): Promise<Entity | undefined> => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.get(`/entities/${id}`);
          return res.data;
        } catch (err) {
          console.warn('Axios get entity by id failed', err);
        }
      }
      return mockEntities.find(e => e.id === id);
    }
  },

  // 4. NETWORK & GRAPH ANALYTICS
  network: {
    getGraphData: async (filters?: { entityType?: string; caseId?: string; searchQuery?: string }) => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.get('/network/graph', { params: filters });
          return res.data;
        } catch (err) {
          console.warn('Axios graph query failed', err);
        }
      }
      let filteredEntities = [...mockEntities];
      if (filters?.entityType && filters.entityType !== 'ALL') {
        filteredEntities = filteredEntities.filter(e => e.type === filters.entityType);
      }
      const entityIds = new Set(filteredEntities.map(e => e.id));
      const filteredRelationships = mockRelationships.filter(
        r => entityIds.has(r.source) && entityIds.has(r.target)
      );

      return {
        nodes: filteredEntities,
        edges: filteredRelationships,
        stats: {
          totalNodes: filteredEntities.length,
          totalEdges: filteredRelationships.length,
          density: 0.42,
          communitiesCount: 2
        }
      };
    },
    getCentralityLeaderboard: async () => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.get('/network/centrality');
          return res.data;
        } catch (err) {
          console.warn('Axios centrality query failed', err);
        }
      }
      return [...mockEntities].sort((a, b) => b.centrality.betweennessCentrality - a.centrality.betweennessCentrality);
    }
  },

  // 5. DATA UPLOAD & ANALYSIS
  analysis: {
    uploadAndAnalyzeFir: async (file: File, caseId?: string): Promise<AnalysisSummary> => {
      if (!USE_MOCK_API) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          if (caseId) formData.append('case_id', caseId);
          const res = await apiClient.post('/analysis/analyze-fir', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          return res.data;
        } catch (err) {
          console.warn('Axios upload analyze failed', err);
        }
      }
      return {
        ...mockAnalysisSummary,
        fileUploaded: file.name,
        caseId: caseId || 'FIR-NEW-' + Math.floor(1000 + Math.random() * 9000)
      };
    },
    getAnalysisResults: async (caseId: string): Promise<AnalysisSummary> => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.get(`/analysis/${caseId}`);
          return res.data;
        } catch (err) {
          console.warn('Axios get analysis failed', err);
        }
      }
      return mockAnalysisSummary;
    }
  },

  // 6. ALERTS
  alerts: {
    getAlerts: async (): Promise<AlertItem[]> => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.get('/alerts');
          return res.data;
        } catch (err) {
          console.warn('Axios get alerts failed', err);
        }
      }
      return mockAlerts;
    },
    updateAlertStatus: async (alertId: string, status: AlertItem['status']): Promise<AlertItem> => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.patch(`/alerts/${alertId}/status`, { status });
          return res.data;
        } catch (err) {
          console.warn('Axios patch alert failed', err);
        }
      }
      const alert = mockAlerts.find(a => a.id === alertId);
      if (alert) alert.status = status;
      return alert || mockAlerts[0];
    }
  },

  // 7. CROSS-CASE INTELLIGENCE
  crossCase: {
    getLinks: async (): Promise<CrossCaseLink[]> => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.get('/cross-case');
          return res.data;
        } catch (err) {
          console.warn('Axios get cross-case failed', err);
        }
      }
      return mockCrossCaseLinks;
    }
  },

  // 8. EVIDENCE INTEGRITY & BLOCKCHAIN
  evidence: {
    getEvidenceItems: async (): Promise<EvidenceItem[]> => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.get('/evidence');
          return res.data;
        } catch (err) {
          console.warn('Axios get evidence failed', err);
        }
      }
      return mockEvidenceItems;
    },
    verifyHash: async (evidenceId: string, calculatedHash: string): Promise<{ isMatch: boolean; details: EvidenceItem }> => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.post('/evidence/verify', { evidenceId, calculatedHash });
          return res.data;
        } catch (err) {
          console.warn('Axios verify hash failed', err);
        }
      }
      const item = mockEvidenceItems.find(e => e.id === evidenceId) || mockEvidenceItems[0];
      const isMatch = item.hash.toLowerCase() === calculatedHash.toLowerCase();
      return { isMatch, details: item };
    }
  },

  // 9. AUDIT & SYSTEM LOGS
  audit: {
    getAuditLogs: async (): Promise<AuditLog[]> => {
      if (!USE_MOCK_API) {
        try {
          const res = await apiClient.get('/audit/logs');
          return res.data;
        } catch (err) {
          console.warn('Axios get audit logs failed', err);
        }
      }
      return mockAuditLogs;
    },
    logAction: async (action: string, target: string, details: string): Promise<AuditLog> => {
      const newLog: AuditLog = {
        id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        officerName: mockCurrentUser.name,
        officerBadge: mockCurrentUser.badgeNumber,
        action,
        target,
        ipAddress: '127.0.0.1 (Axios Client)',
        status: 'SUCCESS',
        details
      };
      mockAuditLogs.unshift(newLog);
      return newLog;
    }
  }
};
