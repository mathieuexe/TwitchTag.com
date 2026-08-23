import LiveCounters from '@/components/stats/LiveCounters'
import PseudoGenerator from '@/components/generator/PseudoGenerator'

export default function Home() {
  return (
    <>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pt-8 sm:pt-16 pb-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <PseudoGenerator />
        </div>
      </div>

      {/* Live Counters Footer / Fixed Bottom or just above footer */}
      <div className="bg-bg-secondary border-t border-white/5 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LiveCounters />
        </div>
      </div>
    </>
  )
}
