export interface Project {
  title: string;
  description: string;
  tags: string[];
  url: string;
  status: 'live' | 'beta' | 'in-progress';
}

export const PROJECTS: Project[] = [
  {
    title: 'Cephalometric Analysis',
    description: 'AI-assisted cephalometric tracing and landmark analysis for orthodontic diagnosis.',
    tags: ['dentistry', 'ai', 'programming'],
    url: '#',
    status: 'in-progress',
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
