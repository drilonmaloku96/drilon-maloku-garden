export interface Project {
  title: string;
  description: string;
  tags: string[];
  url: string;
  status: 'live' | 'beta' | 'in-progress';
  thumbnail?: string;
}

export const PROJECTS: Project[] = [
  {
    title: 'Cephalyzer',
    description: 'Professional cephalometric analysis that runs entirely in the browser. Advanced orthodontic X-ray landmark tracing — your images never leave your device.',
    tags: ['dentistry', 'ai', 'programming'],
    url: 'https://cephalyzer.com',
    status: 'live',
    thumbnail: '/drilon-maloku-garden/assets/cephalyzer-thumb.png',
  },
  {
    title: 'Slides to PDF',
    description: 'Convert presentation slides to clean, print-ready PDFs in one click.',
    tags: ['programming', 'tools'],
    url: '#',
    status: 'live',
  },
  {
    title: 'Patient Management',
    description: 'Lightweight patient record system built for small dental practices.',
    tags: ['dentistry', 'programming'],
    url: '#',
    status: 'in-progress',
  },
];
