import type { YearScorecard } from '../types';

export function createBlankScorecards(appYear: number): YearScorecard[] {
  return [
    {
      year: 0,
      label: 'Identity Verification',
      targetPoints: 150,
      currentPoints: 0,
      isComplete: false,
      documents: [],
    },
    {
      year: appYear,
      label: `Year 5 (${appYear})`,
      targetPoints: 150,
      currentPoints: 0,
      isComplete: false,
      hasTypeA: false,
      hasTypeB: false,
      documents: [],
    },
    {
      year: appYear - 1,
      label: `Year 4 (${appYear - 1})`,
      targetPoints: 150,
      currentPoints: 0,
      isComplete: false,
      hasTypeA: false,
      hasTypeB: false,
      documents: [],
    },
    {
      year: appYear - 2,
      label: `Year 3 (${appYear - 2})`,
      targetPoints: 150,
      currentPoints: 0,
      isComplete: false,
      hasTypeA: false,
      hasTypeB: false,
      documents: [],
    },
    {
      year: appYear - 3,
      label: `Year 2 (${appYear - 3})`,
      targetPoints: 150,
      currentPoints: 0,
      isComplete: false,
      hasTypeA: false,
      hasTypeB: false,
      documents: [],
    },
    {
      year: appYear - 4,
      label: `Year 1 (${appYear - 4})`,
      targetPoints: 150,
      currentPoints: 0,
      isComplete: false,
      hasTypeA: false,
      hasTypeB: false,
      documents: [],
    },
  ];
}
