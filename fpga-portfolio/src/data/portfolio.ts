export const modules = ['Projects', 'Experience', 'Research', 'About', 'Skills', 'Contact', 'Lab', 'Diagnostics'] as const;
export type Module = typeof modules[number] | 'Home';
export const profile = {
  name: 'Rigved Koli', education: 'Electrical Engineering · IIT Kanpur',
  description: 'Multidisciplinary engineer building across software, machine learning, electronics, graphics, and interactive systems.',
  links: { github: '', resume: '', email: '', linkedin: '' },
};
export const projects = [
  { slug: 'scribo', title: 'Scribo', category: 'SOFTWARE / MACHINE LEARNING', subtitle: 'Multimodal knowledge retrieval', description: 'A platform for extracting knowledge from different media and retrieving relevant information.', technologies: ['Next.js', 'FastAPI', 'Whisper', 'Hybrid retrieval', 'Reranking', 'RAG'], approach: 'Connect transcription and content extraction with hybrid retrieval and reranking to support retrieval-augmented generation.', architecture: ['Media input', 'Extraction & transcription', 'Hybrid retrieval', 'Reranking', 'Grounded response'] },
  { slug: 'travelly', title: 'Travelly', category: 'FULL-STACK APPLICATION', subtitle: 'Travel together. Plan together.', description: 'A group trip management application for collaborative planning and shared expenses.', technologies: ['Flutter', 'Node.js', 'PostgreSQL', 'Prisma'], approach: 'Bring collaborative trip planning and expense splitting into a shared application backed by a relational data model.', architecture: ['Flutter app', 'Node.js API', 'Prisma', 'PostgreSQL'] },
  { slug: 'camcraft', title: 'CamCraft', category: 'INTERACTIVE SYSTEMS', subtitle: 'Gestures become interaction', description: 'A gesture-controlled Unity experience connecting computer vision with real-time interaction.', technologies: ['Unity', 'MediaPipe', 'Python'], approach: 'Use MediaPipe to interpret gestures and send interaction signals from Python to Unity.', architecture: ['Camera', 'MediaPipe', 'Python–Unity communication', 'Unity experience'] },
  { slug: 'parallel-computing', title: 'Parallel Computing', category: 'DISTRIBUTED COMPUTING', subtitle: 'Numerical work, distributed', description: 'MPI-based distributed numerical computing using domain decomposition and halo exchange.', technologies: ['MPI', 'Domain decomposition', 'Halo exchange'], approach: 'Partition a numerical domain across processes and exchange boundary information between neighboring partitions.', architecture: ['Domain', 'Process partitions', 'Halo exchange', 'Numerical update'] },
  { slug: 'electronics', title: 'Electronics & Hardware', category: 'CIRCUITS / DIGITAL DESIGN', subtitle: 'From signals to systems', description: 'Work spanning an ECG biosignal amplifier, RF/digital predistortion research, and Verilog/FPGA projects.', technologies: ['Analog electronics', 'RF', 'Verilog', 'FPGA'], approach: 'Explore the connection between physical signals, analog front ends, and programmable digital systems.', architecture: ['Signals', 'Analog front end', 'Digital processing', 'Output'] },
];
export function summary(module: Module, item: number) {
  if (module === 'Projects') return { title: projects[item % projects.length].title, subtitle: projects[item % projects.length].subtitle, detail: projects[item % projects.length].technologies.slice(0, 3).join(' · ') };
  const content: Record<Exclude<Module, 'Projects'>, { title: string; subtitle: string; detail: string }> = {
    Home: { title: 'Rigved Koli', subtitle: 'Electrical engineer. Software builder.', detail: 'SELECT A MODULE TO EXPLORE' },
    Experience: { title: 'Google Cloud', subtitle: 'Software engineering internship', detail: 'EXPERIENCE / PUBLIC OVERVIEW' },
    Research: { title: '6G positioning', subtitle: 'Learning where signals come from.', detail: 'CNN · TRANSFORMER · WIRELESS' },
    About: { title: 'Across disciplines.', subtitle: 'Electrical Engineering · IIT Kanpur', detail: 'SOFTWARE / ELECTRONICS / INTERACTION' },
    Skills: { title: 'A connected toolkit.', subtitle: 'From circuits to software.', detail: 'EXPLORE THE TOOLKIT' },
    Contact: { title: 'Start a conversation.', subtitle: 'Good ideas begin with a connection.', detail: 'CONTACT & PROFESSIONAL PROFILES' },
    Lab: { title: 'Under construction.', subtitle: 'A space for future experiments.', detail: 'LAB / PHASE 1 PROTOTYPE' },
    Diagnostics: { title: 'RBK-FPGA', subtitle: 'Development system · Revision 1.0', detail: 'VIRTUAL BOARD / SYSTEM READY' },
  };
  return content[module];
}
