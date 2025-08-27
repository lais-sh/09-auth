import type { Metadata } from 'next';
import css from './CreateNote.module.css';
import NoteForm from '@/components/NoteForm/NoteForm';

const SITE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const PAGE_PATH = '/notes/action/create';

export const metadata: Metadata = {
  title: 'Create a New Note - NoteHub',
  description: 'Add a new note to your collection.',
  openGraph: {
    type: 'website',
    siteName: 'NoteHub',
    title: 'Create a New Note - NoteHub',
    description: 'Fill the form to create your new note.',
    url: `${SITE_URL}${PAGE_PATH}`,
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        width: 1200,
        height: 630,
        alt: 'NoteHub Open Graph',
      },
    ],
  },
  alternates: {
    canonical: `${SITE_URL}${PAGE_PATH}`,
  },
};

export default function CreateNotePage() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>
        <NoteForm />
      </div>
    </main>
  );
}
