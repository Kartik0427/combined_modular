import React from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Define an interface for the props the component will receive
interface HeroProps {
  onAuthClick: () => void;
}

const Hero = ({ onAuthClick }: HeroProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate("/catalogue");
    } else {
      onAuthClick();
    }
  };

  return (
    <section id="home" className="bg-dark-blue pt-16 pb-32">
      <div className="container mx-auto px-4 grid md:grid-cols-2 items-center gap-8">
        {/* Left: Text Content */}
        <div className="text-white">
          <h1 className="text-5xl font-bold leading-tight mb-4">
            Get Expert Legal Advice Anytime, Anywhere
          </h1>
          <p className="text-gray-300 mb-8 max-w-lg">
            Connect with trusted lawyers instantly via chat, call, or video.
          </p>
          {/* Use the onAuthClick prop for the button's onClick event */}
          <button
            onClick={handleGetStarted}
            className="bg-gold text-dark-blue font-bold px-8 py-4 rounded-lg text-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            {user ? "Find Lawyers" : "Get Started"} <ArrowRight size={20} />
          </button>
        </div>

        {/* Right: Image */}
        <div className="hidden md:block relative h-full">
          <img
            src="/lady-justice.png"
            alt="Lady Justice"
            className="absolute bottom-[-8rem] right-0 max-w-md"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
