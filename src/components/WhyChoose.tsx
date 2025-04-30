export default function WhyChoose() {
  return (
    <div className="py-15 px-5 sm:px-8 md:px-10 mb-6 md:mb-12 rounded-lg max-w-5xl mx-auto">
      <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 sm:mb-8 md:mb-10 text-center text-gray-800">
        Why Choose Mahindra?
      </h2>
      
      <div className="max-w-3xl mx-auto">
        <ul className="text-gray-700 space-y-4 sm:space-y-5 md:space-y-6 text-base sm:text-lg md:text-xl">
          <li className="flex items-start">
            <span className="text-xl sm:text-2xl mr-3 text-blue-600">💡</span>
            <span className="mt-0.5">
              <span className="font-semibold">Innovation-Driven Careers</span> – Work on cutting-edge, impactful, and innovative global projects.
            </span>
          </li>
          
          <li className="flex items-start">
            <span className="text-xl sm:text-2xl mr-3 text-blue-600">🌍</span>
            <span className="mt-0.5">
              <span className="font-semibold">Global Opportunities</span> – Be part of a dynamic multinational tech-driven ecosystem.
            </span>
          </li>
          
          <li className="flex items-start">
            <span className="text-xl sm:text-2xl mr-3 text-blue-600">📚</span>
            <span className="mt-0.5">
              <span className="font-semibold">Growth & Learning</span> – Develop your skills with top mentors and leaders.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}