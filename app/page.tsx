import Link from 'next/link';
import { Heart, Calendar, Users, DollarSign, CheckCircle, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-pink-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">WeddingPlanner</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-pink-600 text-white hover:bg-pink-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
          Plan Your Dream Wedding
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
          A comprehensive platform for couples, professional planners, and vendors to
          collaboratively manage every aspect of your special day.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/register"
            className="bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition"
          >
            Start Planning Free
          </Link>
          <Link
            href="#features"
            className="bg-white text-pink-600 border-2 border-pink-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-50 transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Plan Your Perfect Day
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Calendar className="h-10 w-10 text-pink-600" />}
            title="Event Management"
            description="Create and manage all your wedding events with detailed timelines and schedules."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-pink-600" />}
            title="Guest List & RSVPs"
            description="Manage your guest list, track RSVPs, and handle dietary restrictions effortlessly."
          />
          <FeatureCard
            icon={<DollarSign className="h-10 w-10 text-pink-600" />}
            title="Budget Planner"
            description="Track expenses, manage payments, and stay within your budget with ease."
          />
          <FeatureCard
            icon={<CheckCircle className="h-10 w-10 text-pink-600" />}
            title="Task Management"
            description="Stay organized with customizable checklists and task assignments."
          />
          <FeatureCard
            icon={<Globe className="h-10 w-10 text-pink-600" />}
            title="Wedding Website"
            description="Create a beautiful wedding website for your guests with custom themes."
          />
          <FeatureCard
            icon={<Heart className="h-10 w-10 text-pink-600" />}
            title="Vendor Directory"
            description="Discover and book trusted vendors for photography, catering, venues, and more."
          />
        </div>
      </section>

      {/* User Roles Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Built for Everyone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RoleCard
              title="Couples"
              description="DIY your wedding planning with powerful tools to manage every detail from engagement to the big day."
              features={['Personal dashboard', 'Budget tracking', 'Guest management', 'Wedding website']}
            />
            <RoleCard
              title="Wedding Planners"
              description="Manage multiple events, collaborate with clients, and streamline your planning process."
              features={['Multi-event management', 'Client collaboration', 'Vendor network', 'Professional tools']}
            />
            <RoleCard
              title="Vendors"
              description="Showcase your services, manage bookings, and grow your wedding business."
              features={['Business profile', 'Booking management', 'Review system', 'Portfolio showcase']}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Ready to Start Planning?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of couples, planners, and vendors who trust us with their special day.
        </p>
        <Link
          href="/register"
          className="bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition inline-block"
        >
          Create Your Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-6 w-6 text-pink-600" />
            <span className="ml-2 text-xl font-bold">WeddingPlanner</span>
          </div>
          <p className="text-gray-400">
            © 2024 WeddingPlanner SaaS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function RoleCard({ title, description, features }: { title: string; description: string; features: string[] }) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-700">
            <CheckCircle className="h-5 w-5 text-pink-600 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
