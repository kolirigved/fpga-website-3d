import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Rigved Koli — Nexys 4 DDR Workbench', description: 'An interactive 3D recreation of the Digilent Nexys 4 DDR: physical switches, buttons, LEDs, and an eight-digit seven-segment display.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
