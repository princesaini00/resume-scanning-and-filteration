"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define the type for filter categories
type FilterCategory = "position" | "skills" | "experience" | "location";

// Define the type for the selected filters state
type SelectedFilters = {
  position: string[];
  skills: string[];
  experience: string[];
  location: string[];
};

export default function Filters() {
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    position: [],
    skills: [],
    experience: [],
    location: [],
  });

  const [dynamicOptions, setDynamicOptions] = useState<{
    positions: string[];
    locations: string[];
  }>({ positions: [], locations: [] });

  const [isMobile, setIsMobile] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const router = useRouter();

  // Check if viewport width is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    checkIfMobile();
    
    // Add event listener
    window.addEventListener("resize", checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fetch dynamic options for job titles and locations
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch("/api/filter-options");
        const data = await res.json();
        setDynamicOptions({
          positions: data.positions || [],
          locations: data.locations || [],
        });
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };
    fetchOptions();
  }, []);

  const handleFilterClick = (category: FilterCategory, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  const handleSearch = () => {
    const query = new URLSearchParams();
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        query.append(key, values.join(","));
      }
    });
    router.push(`/resume-results?${query.toString()}`);
  };

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <div className={`${isMobile ? 'p-4 h-full overflow-y-auto pb-20' : 'sticky left-0 h-screen p-5 bg-gray-50 overflow-y-auto border-r border-gray-200'}`}>
      <h2 className="text-lg font-bold mb-4 text-gray-800">Apply Filters</h2>
      <hr className="mb-4 border-gray-300" />
      <div className="space-y-6">
        {/* Collapsible sections for mobile */}
        {isMobile ? (
          <>
            <div className="border border-gray-200 rounded-lg mb-2">
              <button
                onClick={() => toggleSection('position')}
                className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-t-lg"
              >
                <h3 className="font-semibold">Position Experience</h3>
                <span>{expandedSection === 'position' ? '−' : '+'}</span>
              </button>
              {expandedSection === 'position' && (
                <div className="p-3">
                  <FilterSectionContent
                    category="position"
                    options={dynamicOptions.positions}
                    selectedFilters={selectedFilters}
                    handleFilterClick={handleFilterClick}
                  />
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg mb-2">
              <button
                onClick={() => toggleSection('skills')}
                className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-t-lg"
              >
                <h3 className="font-semibold">Skills</h3>
                <span>{expandedSection === 'skills' ? '−' : '+'}</span>
              </button>
              {expandedSection === 'skills' && (
                <div className="p-3">
                  <FilterSectionContent
                    category="skills"
                    options={[
                      "C", "C++", "C#",
                      "React", "JavaScript", "TypeScript",
                      "Node.js", "Express", "Next.js",
                      "HTML", "CSS", "Tailwind CSS",
                      "Java", "Spring Boot",
                      "Python", "Django", "Flask",
                      "MongoDB", "MySQL", "PostgreSQL",
                      "Git", "GitHub",
                      "AWS", "Docker",
                      "REST API", "GraphQL",
                    ]}
                    selectedFilters={selectedFilters}
                    handleFilterClick={handleFilterClick}
                  />
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg mb-2">
              <button
                onClick={() => toggleSection('experience')}
                className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-t-lg"
              >
                <h3 className="font-semibold">Experience</h3>
                <span>{expandedSection === 'experience' ? '−' : '+'}</span>
              </button>
              {expandedSection === 'experience' && (
                <div className="p-3">
                  <FilterSectionContent
                    category="experience"
                    options={["1 year", "2 years", "3 years", "4 years", "5+ years"]}
                    selectedFilters={selectedFilters}
                    handleFilterClick={handleFilterClick}
                  />
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg mb-2">
              <button
                onClick={() => toggleSection('location')}
                className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-t-lg"
              >
                <h3 className="font-semibold">Location</h3>
                <span>{expandedSection === 'location' ? '−' : '+'}</span>
              </button>
              {expandedSection === 'location' && (
                <div className="p-3">
                  <FilterSectionContent
                    category="location"
                    options={dynamicOptions.locations}
                    selectedFilters={selectedFilters}
                    handleFilterClick={handleFilterClick}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          // Desktop view remains unchanged
          <>
            <FilterSection
              title="Position Experience"
              category="position"
              options={dynamicOptions.positions}
              selectedFilters={selectedFilters}
              handleFilterClick={handleFilterClick}
            />

            <FilterSection
              title="Skills"
              category="skills"
              options={[
                "C", "C++", "C#",
                "React", "JavaScript", "TypeScript",
                "Node.js", "Express", "Next.js",
                "HTML", "CSS", "Tailwind CSS",
                "Java", "Spring Boot",
                "Python", "Django", "Flask",
                "MongoDB", "MySQL", "PostgreSQL",
                "Git", "GitHub",
                "AWS", "Docker",
                "REST API", "GraphQL",
              ]}
              selectedFilters={selectedFilters}
              handleFilterClick={handleFilterClick}
            />

            <FilterSection
              title="Experience"
              category="experience"
              options={["1 year", "2 years", "3 years", "4 years", "5+ years"]}
              selectedFilters={selectedFilters}
              handleFilterClick={handleFilterClick}
            />

            <FilterSection
              title="Location"
              category="location"
              options={dynamicOptions.locations}
              selectedFilters={selectedFilters}
              handleFilterClick={handleFilterClick}
            />
          </>
        )}

        <div className="text-center mt-6">
          <button
            className="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
            onClick={handleSearch}
          >
            Search Resume
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Filter Section Component for Desktop
type FilterSectionProps = {
  title: string;
  category: FilterCategory;
  options: string[];
  selectedFilters: SelectedFilters;
  handleFilterClick: (category: FilterCategory, value: string) => void;
};

const FilterSection = ({
  title,
  category,
  options,
  selectedFilters,
  handleFilterClick,
}: FilterSectionProps) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleFilterClick(category, option)}
            className={`flex items-center px-2.5 py-1 text-sm ${
              selectedFilters[category].includes(option)
                ? "bg-gray-500 text-white"
                : "bg-white text-gray-700"
            } border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm`}
          >
            <span className="mr-1">
              {selectedFilters[category].includes(option) ? "✓" : "+"}
            </span>{" "}
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

// Component for filter section content (used in mobile accordion)
type FilterSectionContentProps = {
  category: FilterCategory;
  options: string[];
  selectedFilters: SelectedFilters;
  handleFilterClick: (category: FilterCategory, value: string) => void;
};

const FilterSectionContent = ({
  category,
  options,
  selectedFilters,
  handleFilterClick,
}: FilterSectionContentProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleFilterClick(category, option)}
          className={`flex items-center px-2.5 py-1 text-sm ${
            selectedFilters[category].includes(option)
              ? "bg-gray-500 text-white"
              : "bg-white text-gray-700"
          } border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm`}
        >
          <span className="mr-1">
            {selectedFilters[category].includes(option) ? "✓" : "+"}
          </span>{" "}
          {option}
        </button>
      ))}
    </div>
  );
};
