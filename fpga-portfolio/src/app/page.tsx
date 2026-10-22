'use client';
import dynamic from 'next/dynamic';

const Portfolio = dynamic(() => import('@/components/Portfolio'), { ssr: false });

export default function Page() {
  return <Portfolio />;
}

