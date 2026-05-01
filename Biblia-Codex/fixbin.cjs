const fs = require('fs');
const path = require('path');

const rPath = path.join(__dirname, 'src/features/Bible/Reader.tsx');
let content = fs.readFileSync(rPath, 'utf8');

// Fix 1: Add console.log after imports
const search1 = "import { CrossReferencesBottomSheet } from '../study/CrossReferencesBottomSheet';\n\ninterface ReaderProps";
const replace1 = "import { CrossReferencesBottomSheet } from '../study/CrossReferencesBottomSheet';\n\nconsole.log('[Reader] Module loaded, verses count:' + verses?.length);\n\ninterface ReaderProps";
content = content.replace(search1, replace1);

// Fix 2: Add onBottomChange to ReaderProps
const search2 = "onShare: (verses: { verse: number, text: string }[], reference: string) => void;\n}\n\nconst VerseItem";
const replace2 = "onShare: (verses: { verse: number, text: string }[], reference: string) => void;\n onBottomChange?: (isAtBottom: boolean) => void;\n}\n\nconst VerseItem";
content = content.replace(search2, replace2);

// Fix 3: Add ReaderTooltip component and export
const endMarker = ");\n\n(End of file";
const tooltipCode = ");\n\nconst ReaderTooltip = ({ label, children }: { label?: string; children: React.ReNode }) => (\n <div className=\"premium-tooltip relative group\">\n  <div className=\"absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--surface-2)] border border-[var(--border- bible)] rounded px-2 py-1 text-xs whitespace-nowrap z-50 pointer-events-none>\n   {label}\n  </div>\n  {children}\n </div>\n);\nexport { ReaderTooltip };\n\n(End of file";
content = content.replace(endMarker, tooltipCode);

fs.writeFileSync(rPath, content);
console.log('Reader.tsx fixes applied');
