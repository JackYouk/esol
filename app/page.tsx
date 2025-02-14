import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Book, Users, Mic, PenTool, Brain } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="w-full py-20 flex flex-col items-center justify-center">
        {/* <h1 className="text-5xl font-bold text-center mb-6">ESOL AI</h1> */}
        <Logo className="text-5xl" iconClassName="w-10 h-10" />
        <p className="text-xl text-gray-600 text-center max-w-2xl mb-8">
          An AI-powered platform revolutionizing how ESL students interact with classroom materials
        </p>
        <div className="flex gap-4">
          <Link href="/workspaces">
            <Button className="text-lg px-6 py-6">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/research">
            <Button variant="outline" className="text-lg px-6 py-6">
              Read Research
              <Book className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Brain className="h-8 w-8 text-blue-500" />}
            title="AI-Powered Learning"
            description="Instant vocabulary explanations, grammar assistance, and spelling corrections tailored to ESL students"
          />
          <FeatureCard
            icon={<Mic className="h-8 w-8 text-blue-500" />}
            title="Pronunciation Guide"
            description="Interactive pronunciation tools with audio examples and practice exercises"
          />
          <FeatureCard
            icon={<PenTool className="h-8 w-8 text-blue-500" />}
            title="Smart Note-Taking"
            description="Classroom-compatible note-taking system with real-time language support"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-blue-500" />}
            title="Collaborative Workspaces"
            description="Teachers can create and assign workspaces to students or students can manage their own"
          />
        </div>
      </div>

      {/* Demo Section */}
      {/* <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">See How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img
                src="/api/placeholder/600/400"
                alt="ESOL AI Demo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img
                src="/api/placeholder/600/400"
                alt="ESOL AI Tutorial"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div> */}

      {/* Support Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Support Our Mission</h2>
          <p className="text-lg text-gray-600 mb-8">
            Help us make quality English language education accessible to everyone through technology
          </p>
          <Link href="/crowdfunding">
            <Button size="lg" className="text-lg px-8">
              Support the Project
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Feature Card Component
function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}