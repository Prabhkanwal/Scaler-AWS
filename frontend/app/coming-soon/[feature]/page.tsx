import Link from 'next/link';
import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';

interface ComingSoonPageProps {
  params: Promise<{ feature: string }>;
}

function formatFeature(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function ComingSoonPage({ params }: ComingSoonPageProps) {
  const { feature } = await params;
  const title = formatFeature(decodeURIComponent(feature));

  return (
    <div className="min-h-screen bg-[#161d27] flex flex-col font-sans">
      <TopNav />
      <div className="h-10 border-b border-[#2c384a] flex items-center px-4 text-[13px]">
        <Link href="/" className="text-[#3ea1fc] hover:underline font-bold">Route 53</Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-400">{title}</span>
      </div>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <section className="max-w-3xl rounded-lg border border-[#2c384a] bg-[#161d27] p-8">
            <p className="text-[#ff9900] text-[12px] font-bold uppercase">Route 53</p>
            <h1 className="mt-2 text-white text-[24px] font-bold">{title}</h1>
            <p className="mt-3 text-gray-300 text-[14px]">This console section is a placeholder in this Route 53 clone.</p>
            <Link href="/get-started" className="mt-6 inline-flex text-[#3ea1fc] font-bold hover:underline">Return to Get started</Link>
          </section>
        </main>
      </div>
    </div>
  );
}
