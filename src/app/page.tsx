import { ChronoNote } from '@/components/ChronoNote';

export default function Home({ searchParams }: { searchParams?: { notes?: string } }) {
  return (
    <main className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8">
      <ChronoNote initialNotesData={searchParams?.notes} />
    </main>
  );
}
