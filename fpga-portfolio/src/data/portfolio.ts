export const modules = ['Projects', 'Experience', 'Research', 'About', 'Skills', 'Contact', 'Lab', 'Diagnostics'] as const;
export type Module = typeof modules[number] | 'Home';
export const profile = {
  name: 'Rigved Koli', education: 'B.Tech Electrical Engineering · IIT Kanpur · CPI 9.1/10',
  description: 'Final-year electrical engineering student building reliable systems across software, machine learning, RF, FPGA, and interactive tools.',
  links: {
    github: 'https://github.com/kolirigved',
    resume: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/Rigved-Koli-Resume.md`,
    email: 'mailto:brigved23@iitk.ac.in',
    linkedin: 'https://www.linkedin.com/in/rigved-koli-58080329b/',
  },
};
export const projects = [
  { slug: 'scribo', title: 'Scribo', category: 'SOFTWARE / MACHINE LEARNING', subtitle: 'Multimodal knowledge retrieval', description: 'A retrieval system that turns video, audio, PDFs, and web content into grounded answers.', technologies: ['Next.js', 'FastAPI', 'Whisper', 'ChromaDB', 'BM25', 'RAG'], approach: 'Combine media extraction, reciprocal-rank fusion, query rewriting, and FlashRank reranking for retrieval-augmented generation.', architecture: ['Media input', 'FFmpeg / Whisper / pypdf', 'ChromaDB + BM25', 'Reranking', 'Grounded response'] },
  { slug: 'travelly', title: 'Travelly', category: 'FULL-STACK APPLICATION', subtitle: 'Collaborative trip planning', description: 'A mobile group-travel app with shared planning, invitations, photo vaults, routes, and notifications.', technologies: ['Flutter', 'Node.js', 'PostgreSQL', 'Prisma', 'Firebase'], approach: 'Pair a Flutter client with a REST API and relational data model for shared itineraries and group coordination.', architecture: ['Flutter app', 'Express REST API', 'Prisma', 'PostgreSQL', 'Firebase / FCM'] },
  { slug: 'camcraft', title: 'CamCraft', category: 'INTERACTIVE SYSTEMS', subtitle: 'Gestures become interaction', description: 'A gesture-controlled Unity experience connecting computer vision with real-time interaction.', technologies: ['Unity', 'MediaPipe', 'Python'], approach: 'Use MediaPipe to interpret gestures and send interaction signals from Python to Unity.', architecture: ['Camera', 'MediaPipe', 'Python–Unity communication', 'Unity experience'] },
  { slug: 'parallel-computing', title: 'Parallel Computing', category: 'DISTRIBUTED COMPUTING', subtitle: 'Numerical work, distributed', description: 'MPI-based distributed numerical computing using domain decomposition and halo exchange.', technologies: ['MPI', 'Domain decomposition', 'Halo exchange'], approach: 'Partition a numerical domain across processes and exchange boundary information between neighboring partitions.', architecture: ['Domain', 'Process partitions', 'Halo exchange', 'Numerical update'] },
  { slug: 'electronics', title: 'Electronics & Hardware', category: 'CIRCUITS / DIGITAL DESIGN', subtitle: 'From signals to systems', description: 'Work spanning a biosignal ECG amplifier, gate-bias-compensated RF predistortion, and Verilog/FPGA implementation.', technologies: ['Analog electronics', 'RF', 'Verilog', 'FPGA'], approach: 'Connect physical signals and analog front ends with adaptive digital processing and programmable hardware.', architecture: ['Signals', 'Analog front end', 'Digital processing', 'Output'] },
];
export function summary(module: Module, item: number) {
  if (module === 'Projects') return { title: projects[item % projects.length].title, subtitle: projects[item % projects.length].subtitle, detail: projects[item % projects.length].technologies.slice(0, 3).join(' · ') };
  const content: Record<Exclude<Module, 'Projects'>, { title: string; subtitle: string; detail: string }> = {
    Home: { title: 'Rigved Koli', subtitle: 'Electrical engineer · IIT Kanpur', detail: 'SELECT A MODULE TO EXPLORE' },
    Experience: { title: 'Google India', subtitle: 'Cloud Compute & Infrastructure · SWE Intern', detail: 'OBSERVABILITY · SLOS · AI DIAGNOSTICS' },
    Research: { title: '6G positioning', subtitle: 'Hybrid CNN–Transformer direction finding', detail: '5.86° RMSE · WIRELESS · ML' },
    About: { title: 'Across disciplines.', subtitle: 'B.Tech EE · IIT Kanpur · CPI 9.1/10', detail: 'SOFTWARE · ML · RF · FPGA' },
    Skills: { title: 'A connected toolkit.', subtitle: 'C/C++ · Python · TypeScript · Verilog', detail: 'FASTAPI · FLUTTER · PYTORCH · MPI' },
    Contact: { title: 'Rigved Koli', subtitle: 'brigved23@iitk.ac.in', detail: 'GITHUB · LINKEDIN · RESUME' },
    Lab: { title: 'RF predistortion', subtitle: 'Gate-bias compensation for carrier trapping', detail: 'SIMULINK · VERILOG · FPGA' },
    Diagnostics: { title: 'RBK-FPGA', subtitle: 'Personal development system · Rev 01', detail: '16 TOP GRADES · 1400 CF · READY' },
  };
  return content[module];
}
