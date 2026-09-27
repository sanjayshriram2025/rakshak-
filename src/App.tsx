import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DemoWalkthroughBanner, DEMO_STEPS } from './components/layout/DemoWalkthroughBanner';
import { DelhiPoliceSplashScreen } from './components/layout/DelhiPoliceSplashScreen';
import { SearchModal } from './components/common/SearchModal';

import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { UploadView } from './views/UploadView';
import { AiAnalysisView } from './views/AiAnalysisView';
import { NetworkExplorerView } from './views/NetworkExplorerView';
import { DelhiMapView } from './views/DelhiMapView';
import { EntityProfileView } from './views/EntityProfileView';
import { CaseDetailsView } from './views/CaseDetailsView';
import { AlertsView } from './views/AlertsView';
import { CrossCaseView } from './views/CrossCaseView';
import { NetworkAnalyticsView } from './views/NetworkAnalyticsView';
import { InsightsView } from './views/InsightsView';
import { EvidenceView } from './views/EvidenceView';
import { AuditLogsView } from './views/AuditLogsView';
import { SettingsView } from './views/SettingsView';

import { apiService } from './services/api';
import { 
  Entity, 
  Relationship, 
  CaseFile, 
  AlertItem, 
  EvidenceItem, 
  AuditLog, 
  CrossCaseLink, 
  UserProfile, 
  AnalysisSummary,
  ThemeMode 
} from './types';
import { mockCurrentUser } from './data/mockData';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true); // Shows Delhi Police splash first!
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockCurrentUser);
  const [currentView, setCurrentView] = useState<string>('DASHBOARD');
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('GOVT_LIGHT'); // Clean Govt Light Mode by default!

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Core datasets state
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [cases, setCases] = useState<CaseFile[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [crossCaseLinks, setCrossCaseLinks] = useState<CrossCaseLink[]>([]);
  const [analysisSummary, setAnalysisSummary] = useState<AnalysisSummary | null>(null);

  // Selected state
  const [selectedEntityId, setSelectedEntityId] = useState<string>('ENT-PER-101');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CASE-1024');

  // Load initial data from apiService
  useEffect(() => {
    const loadInitialData = async () => {
      const [
        eData,
        cData,
        aData,
        evData,
        logData,
        ccData,
        gData,
        anData
      ] = await Promise.all([
        apiService.entities.getAllEntities(),
        apiService.cases.getAllCases(),
        apiService.alerts.getAlerts(),
        apiService.evidence.getEvidenceItems(),
        apiService.audit.getAuditLogs(),
        apiService.crossCase.getLinks(),
        apiService.network.getGraphData(),
        apiService.analysis.getAnalysisResults('FIR-42/2026')
      ]);

      setEntities(eData);
      setCases(cData);
      setAlerts(aData);
      setEvidence(evData);
      setAuditLogs(logData);
      setCrossCaseLinks(ccData);
      setRelationships(gData.edges);
      setAnalysisSummary(anData);
    };

    loadInitialData();
  }, []);

  // Keyboard shortcut for Ctrl+K global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const demoStepIndex = DEMO_STEPS.findIndex(s => s.view === currentView);

  const handleSelectEntityFromSearch = (entityId: string) => {
    setSelectedEntityId(entityId);
    setCurrentView('ENTITIES');
    apiService.audit.logAction('VIEW_ENTITY_DOSSIER', entityId, 'Selected entity from global search modal');
  };

  const handleSelectCaseFromSearch = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentView('CASE_DETAILS');
    apiService.audit.logAction('VIEW_CASE_RECORD', caseId, 'Selected case record from global search modal');
  };

  const handleUpdateAlertStatus = async (alertId: string, status: AlertItem['status']) => {
    const updated = await apiService.alerts.updateAlertStatus(alertId, status);
    setAlerts(prev => prev.map(a => a.id === alertId ? updated : a));
  };

  // Theme wrapper styling
  const getThemeClass = () => {
    switch (currentTheme) {
      case 'GOVT_LIGHT':
        return 'bg-slate-100 text-slate-900';
      case 'TACTICAL_AMBER':
        return 'bg-neutral-950 text-amber-100';
      case 'CYBER_CELL':
        return 'bg-slate-950 text-cyan-100';
      default:
        return 'bg-slate-950 text-slate-100';
    }
  };

  // 1. First load: Delhi Police Splash Loader Screen
  if (showSplash) {
    return (
      <DelhiPoliceSplashScreen
        onEnterPortal={() => setShowSplash(false)}
      />
    );
  }

  // 2. Authentication Login Screen
  if (!isLoggedIn) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
          setCurrentView('DASHBOARD');
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200 ${getThemeClass()}`}>
      
      {/* Top Demo Walkthrough Guidance Bar */}
      <DemoWalkthroughBanner
        currentStepIndex={demoStepIndex >= 0 ? demoStepIndex : 0}
        onSelectStep={(view) => setCurrentView(view)}
        onReset={() => setCurrentView('DASHBOARD')}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex relative">
        
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentUser={currentUser}
          onLogout={() => {
            setIsLoggedIn(false);
            setShowSplash(true);
          }}
          alertCount={alerts.filter(a => a.status === 'UNREVIEWED').length}
          currentTheme={currentTheme}
        />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Bar */}
          <Topbar
            currentView={currentView}
            onOpenSearch={() => setIsSearchOpen(true)}
            currentUser={currentUser}
            alerts={alerts}
            onNavigateToAlerts={() => setCurrentView('ALERTS')}
            sidebarCollapsed={sidebarCollapsed}
            currentTheme={currentTheme}
            onSelectTheme={(theme) => setCurrentTheme(theme)}
          />

          {/* View Container */}
          <main className={`flex-1 p-6 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}>
            {currentView === 'DASHBOARD' && (
              <DashboardView
                entities={entities}
                relationships={relationships}
                cases={cases}
                alerts={alerts}
                evidence={evidence}
                onNavigate={(view) => setCurrentView(view)}
                onSelectEntity={(id) => { setSelectedEntityId(id); setCurrentView('ENTITIES'); }}
                onSelectCase={(id) => { setSelectedCaseId(id); setCurrentView('CASE_DETAILS'); }}
              />
            )}

            {currentView === 'DELHI_MAP' && (
              <DelhiMapView
                entities={entities}
                onSelectEntity={(id) => { setSelectedEntityId(id); setCurrentView('ENTITIES'); }}
                onNavigateToGraph={() => setCurrentView('NETWORK_EXPLORER')}
              />
            )}

            {currentView === 'UPLOAD' && (
              <UploadView
                onAnalysisComplete={(summary) => {
                  setAnalysisSummary(summary);
                  setCurrentView('AI_ANALYSIS');
                }}
              />
            )}

            {currentView === 'AI_ANALYSIS' && analysisSummary && (
              <AiAnalysisView
                summary={analysisSummary}
                onNavigateToNetwork={() => setCurrentView('NETWORK_EXPLORER')}
                onNavigateToEvidence={() => setCurrentView('EVIDENCE')}
                onNavigateToXai={() => setCurrentView('ALERTS')}
              />
            )}

            {currentView === 'NETWORK_EXPLORER' && (
              <NetworkExplorerView
                entities={entities}
                relationships={relationships}
                selectedEntityId={selectedEntityId}
                onSelectEntity={(id) => setSelectedEntityId(id)}
                onNavigateToEntityProfile={(id) => { setSelectedEntityId(id); setCurrentView('ENTITIES'); }}
              />
            )}

            {currentView === 'ENTITIES' && (
              <EntityProfileView
                entityId={selectedEntityId}
                entities={entities}
                relationships={relationships}
                cases={cases}
                evidence={evidence}
                onBack={() => setCurrentView('NETWORK_EXPLORER')}
                onNavigateToNetwork={() => setCurrentView('NETWORK_EXPLORER')}
                onNavigateToEvidence={() => setCurrentView('EVIDENCE')}
              />
            )}

            {currentView === 'CASES' && (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="border-b border-slate-200 pb-4">
                  <h1 className="text-xl font-extrabold text-slate-900">Delhi Police Crime Branch FIR Files</h1>
                  <p className="text-xs text-slate-500 mt-1">Select any Special Cell or Crime Branch FIR file to inspect extracted entities and sub-graphs.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => { setSelectedCaseId(c.id); setCurrentView('CASE_DETAILS'); }}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 cursor-pointer transition-all shadow-sm hover:shadow-md space-y-3"
                    >
                      <div className="flex justify-between items-start font-mono text-xs">
                        <span className="font-bold text-blue-700">{c.firNumber}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          {c.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{c.title}</h3>
                      <p className="text-xs text-slate-600">{c.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentView === 'CASE_DETAILS' && (
              <CaseDetailsView
                caseId={selectedCaseId}
                cases={cases}
                entities={entities}
                onBack={() => setCurrentView('DASHBOARD')}
                onNavigateToNetwork={() => setCurrentView('NETWORK_EXPLORER')}
                onSelectEntity={(id) => { setSelectedEntityId(id); setCurrentView('ENTITIES'); }}
              />
            )}

            {currentView === 'ALERTS' && (
              <AlertsView
                alerts={alerts}
                onNavigateToNetwork={() => setCurrentView('NETWORK_EXPLORER')}
                onNavigateToEvidence={() => setCurrentView('EVIDENCE')}
                onUpdateStatus={handleUpdateAlertStatus}
              />
            )}

            {currentView === 'CROSS_CASE' && (
              <CrossCaseView
                cases={cases}
                links={crossCaseLinks}
                onOpenNetworkForCases={(cA, cB) => {
                  setCurrentView('NETWORK_EXPLORER');
                }}
              />
            )}

            {currentView === 'ANALYTICS' && (
              <NetworkAnalyticsView
                entities={entities}
                onSelectEntity={(id) => { setSelectedEntityId(id); setCurrentView('ENTITIES'); }}
              />
            )}

            {currentView === 'INSIGHTS' && analysisSummary && (
              <InsightsView summary={analysisSummary} />
            )}

            {currentView === 'EVIDENCE' && (
              <EvidenceView evidence={evidence} />
            )}

            {currentView === 'AUDIT_LOGS' && (
              <AuditLogsView logs={auditLogs} />
            )}

            {currentView === 'SETTINGS' && (
              <SettingsView user={currentUser} />
            )}
          </main>

        </div>

      </div>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        entities={entities}
        cases={cases}
        onSelectEntity={handleSelectEntityFromSearch}
        onSelectCase={handleSelectCaseFromSearch}
      />

    </div>
  );
}

export default App;
