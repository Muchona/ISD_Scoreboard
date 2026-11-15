import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { IsdCitation } from './IsdCitation';
import { OFFICIAL_ISD_RULES, OFFICIAL_ISD_DOCUMENTS, ISD_OFFICIAL_URLS } from '../data/isdPointsTable';

const getClassificationLabel = (type: string) => {
  switch (type) {
    case 'IDENTITY_PRIMARY':
      return 'Primary ID (150 pts)';
    case 'IDENTITY_SECONDARY':
      return 'Alternative ID';
    case 'TYPE_A':
      return 'Type A (100 pts)';
    case 'TYPE_B':
      return 'Type B (50 pts)';
    default:
      return type.replace('_', ' ');
  }
};

export const RequirementsHub: React.FC = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="chip chip-emerald">
              Official Department of Justice Citations
            </span>
            <IsdCitation
              title="Official ISD Proofs of Identity & Residence"
              url={ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence}
              tag="ISD Portal"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Official Guidelines & Requirements Hub
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Every score, stamp rule, and point value on CitizenScore.ie is transparently calibrated to official Immigration Service Delivery directives.
          </p>
        </div>
      </div>

      {/* Core Rules Deep-Link Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {OFFICIAL_ISD_RULES.map((rule, idx) => (
          <div
            key={idx}
            className="card p-5 flex flex-col justify-between transition-colors space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="chip chip-emerald font-mono font-bold uppercase text-[11px] h-6 px-2.5">
                  {rule.tag}
                </span>
                <IsdCitation
                  title="Source ↗"
                  url={rule.officialLink}
                />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {rule.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                {rule.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Calibrated into calculator and scorecard algorithms</span>
            </div>
          </div>
        ))}
      </div>

      {/* Official Form 8 Document Points Reference Table */}
      <div className="card p-6 space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Official ISD Naturalisation Document Scoring Schedule
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-normal">
              Department of Justice point schedule: Identity (150 pts proven once) & Residency (1 Type A + 1 Type B = 150 pts/year)
            </p>
          </div>
          <IsdCitation
            title="Official ISD Proofs Page"
            url={ISD_OFFICIAL_URLS.proofsOfIdentityAndResidence}
            tag="Official ISD"
          />
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 uppercase font-mono text-[11px] h-10 font-bold bg-slate-100/70 dark:bg-white/[0.02]">
                <th className="py-2.5 px-4 font-bold min-w-[280px]">Document Title</th>
                <th className="py-2.5 px-4 font-bold w-28 text-center">Category</th>
                <th className="py-2.5 px-4 font-bold w-48 text-center">Classification</th>
                <th className="py-2.5 px-4 font-bold w-48">Issuing Body</th>
                <th className="py-2.5 px-4 text-right font-bold w-24">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
              {OFFICIAL_ISD_DOCUMENTS.map((doc, idx) => (
                <tr
                  key={idx}
                  className="h-16 hover:bg-slate-100/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-4 align-middle font-medium text-slate-950 dark:text-slate-100">
                    <div className="font-bold text-slate-950 dark:text-slate-100 leading-snug">
                      {doc.name}
                    </div>
                    {doc.notes && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-normal mt-0.5 leading-snug">
                        {doc.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 align-middle text-center whitespace-nowrap">
                    <span className="chip chip-slate h-7 px-2.5 inline-flex justify-center text-[11px] font-semibold">
                      {doc.category === 'IDENTITY' ? 'Identity' : 'Residency'}
                    </span>
                  </td>
                  <td className="py-3 px-4 align-middle text-center whitespace-nowrap">
                    <span
                      className={`chip h-7 px-3 inline-flex justify-center text-[11px] font-semibold ${
                        doc.type === 'TYPE_A' || doc.type === 'IDENTITY_PRIMARY'
                          ? 'chip-emerald'
                          : 'chip-blue'
                      }`}
                    >
                      {getClassificationLabel(doc.type)}
                    </span>
                  </td>
                  <td className="py-3 px-4 align-middle text-slate-700 dark:text-slate-300 text-xs font-medium">
                    {doc.issuer}
                  </td>
                  <td className="py-3 px-4 align-middle text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap text-sm">
                    +{doc.points} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
