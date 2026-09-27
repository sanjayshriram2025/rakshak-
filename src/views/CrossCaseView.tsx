import React from 'react';
import { GitCompare, Share2, ArrowRight } from 'lucide-react';
import { CrossCaseLink, CaseFile } from '../types';
import { CaseMatrix } from '../components/crosscase/CaseMatrix';

interface CrossCaseViewProps {
  cases: CaseFile[];
  links: CrossCaseLink[];
  onOpenNetworkForCases: (caseA: string, caseB: string) => void;
}

export const CrossCaseView: React.FC<CrossCaseViewProps> = ({
  cases,
  links,
  onOpenNetworkForCases
}) => {
  return (
    <div className="space-y-6">
      <CaseMatrix
        cases={cases}
        links={links}
        onOpenNetworkForCases={onOpenNetworkForCases}
      />
    </div>
  );
};
