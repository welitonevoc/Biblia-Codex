const fs = require('fs');
const path = require('path');

const notesPath = path.join(__dirname, 'src/features/notes/Notes.tsx');
let notesContent = fs.readFileSync(notesPath, 'utf8');

notesContent = notesContent.replace(
  `import { useAppContext } from '../AppContext';`,
  `import { useAppContext } from '../AppContext';\nimport { getThemePreset } from '../theme/presets';`
);

notesContent = notesContent.replace(
  `export const Notes: React.FC = () => {`,
  `interface NotesProps { isActive?: boolean; }\nexport const Notes: React.FC<NotesProps> = ({ isActive = true }) => {`
);

notesContent = notesContent.replace(
  `const { user } = useAppContext();`,
  `const { user, config } = useAppContext();`
);

notesContent = notesContent.replace(
  `setGoogleDocsError(error.message || 'Erro ao exportar para Google Docs');\n      setGoogleDocsState('error');`,
  `const msg = error.message || 'Erro ao exportar para Google Docs';\n      setGoogleDocsError(msg);\n      setGoogleDocsState('error');\n      alert(\`Falha na exportação para o Google Drive:\\n\\n\${msg}\\n\\n(Verifique se o Firebase está configurado)\`);`
);

notesContent = notesContent.replace(
  `return (\n    <div className="h-full overflow-hidden">`,
  `return (\n    <>\n      <div className={cn("h-full overflow-hidden", !isActive && "hidden")}>`
);

notesContent = notesContent.replace(
  `<RichTextEditor\n                    title={draftNote.title}`,
  `<RichTextEditor\n                    theme={(config?.mode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) || (config?.mode !== 'system' && getThemePreset(config?.mode || 'default').family === 'dark') ? 'dark' : 'light'}\n                    title={draftNote.title}`
);

notesContent = notesContent.replace(
  `        </section>\n      </div>\n\n      {/* Note Editor Modal */}`,
  `        </section>\n      </div>\n      </div>\n\n      {/* Note Editor Modal */}`
);

notesContent = notesContent.replace(
  `      />\n    </div>\n  );\n};`,
  `      />\n    </>\n  );\n};`
);

fs.writeFileSync(notesPath, notesContent);

const appPath = path.join(__dirname, 'src/app/App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

const appSearch = `{activeTab === 'notes' && (
              <motion.div key="notes" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <NotesPage />
                </Suspense>
              </motion.div>
            )}`;

const appReplace = `<div className={activeTab === 'notes' ? "h-full" : "h-0 overflow-hidden"}>
              <Suspense fallback={<PageLoader />}>
                <NotesPage isActive={activeTab === 'notes'} />
              </Suspense>
            </div>`;

appContent = appContent.replace(appSearch, appReplace);

fs.writeFileSync(appPath, appContent);
console.log('Script completed');
