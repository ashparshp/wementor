import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#EADBCB]/60 bg-white/40 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <p className="font-black text-gray-900 text-lg">TvaNetra</p>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              1-on-1 mentorship for JEE, NEET, GSoC, placements, and more.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Students</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/book" className="text-gray-600 hover:text-[#F29440] transition-colors">Book a Session</Link>
              <Link href="/login" className="text-gray-600 hover:text-[#F29440] transition-colors">Sign In</Link>
              <Link href="/register" className="text-gray-600 hover:text-[#F29440] transition-colors">Create Account</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Mentors</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/become-mentor" className="text-gray-600 hover:text-[#F29440] transition-colors">Become a Mentor</Link>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-10 pt-6 border-t border-gray-100">
          © {new Date().getFullYear()} TvaNetra. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
