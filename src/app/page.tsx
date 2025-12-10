import { ChronoNote } from '@/components/ChronoNote';

export default function Home({ searchParams }: { searchParams?: { notes?: string } }) {
  return (
    <main className="min-h-screen w-full bg-background">
      <ChronoNote initialNotesData={searchParams?.notes} />
    </main>
  );
}
