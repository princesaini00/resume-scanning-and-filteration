"use client"
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import EmployeeNavbar from "./EmployeeNavbar";

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  data?: any; // For structured query results
};

type QueryResult = {
  response: string;
  structured_query: {
    collection: string;
    type: string;
    filters: any;
    projection?: any;
    sort?: any;
    limit?: number;
    additional_filters?: any;
  };
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

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

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: 'Hello! I can help you query job applications and job postings. Ask me anything like: "Show me applicants with Java and Spring experience".',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
  
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
  
    try {
      // First, process the query with Gemini to get MongoDB query
      const processorResponse = await fetch('/api/chat-processor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          conversation_history: conversationHistory,
        }),
      });
  
      if (!processorResponse.ok) {
        throw new Error('Failed to process query');
      }
  
      const queryResult: QueryResult = await processorResponse.json();
  
      // Then execute the query against MongoDB
      const executeResponse = await fetch('/api/execute-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryResult.structured_query),
      });
  
      if (!executeResponse.ok) {
        throw new Error('Failed to execute query');
      }
  
      const executeResult = await executeResponse.json();
  
      // Format the response based on the query type
      let botResponse = queryResult.response;
      let dataDisplay = null;
  
      if (executeResult.success) {
        if (queryResult.structured_query.type === 'count') {
          // Handle count queries specifically
          botResponse = botResponse.includes('{count}') 
            ? botResponse.replace('{count}', executeResult.data.toString())
            : `Found ${executeResult.data} results`;
        } else if (executeResult.data && executeResult.data.length > 0) {
          // Format the data for display
          dataDisplay = formatDataForDisplay(
            executeResult.data,
            queryResult.structured_query,
            isMobile
          );
        } else {
          botResponse = 'No results found matching your criteria.';
        }
      } else {
        botResponse = executeResult.message || 'Query failed to execute';
      }
  
      // Add bot response to chat
      const botMessage: Message = {
        id: Date.now().toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        data: dataDisplay,
      };
  
      setMessages((prev) => [...prev, botMessage]);
      setConversationHistory(
        (prev) => `${prev}\nUser: ${input}\nBot: ${botResponse}`
      );
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, something went wrong processing your query. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDataForDisplay = (data: any[], query: any, isMobile: boolean = false) => {
    if (!data || data.length === 0) return null;

    // Common styles with responsive adjustments
    const cardClass = isMobile ? 
      "bg-gray-50 p-3 rounded-lg shadow-sm mb-3" : 
      "bg-gray-50 p-4 rounded-lg shadow-sm";
    
    const skillTagClass = isMobile ?
      "bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded" :
      "bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded";
    
    const jobSkillTagClass = isMobile ?
      "bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded" :
      "bg-green-100 text-green-800 text-xs px-2 py-1 rounded";

    // Handle different query types and collections
    if (query.collection === 'applications') {
      return (
        <div className={`mt-4 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
          {data.map((item, index) => (
            <div key={index} className={cardClass}>
              <h3 className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : ''}`}>
                {item.name || 'Unnamed Applicant'}
              </h3>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>{item.email}</p>
              
              {item.resumeUrl && (
                <div className="mt-2">
                  <a 
                    href={item.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-blue-600 hover:underline ${isMobile ? 'text-xs' : 'text-sm'}`}
                  >
                    View Resume
                  </a>
                </div>
              )}
              
              {item.jobTitle && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
                  <span className="text-gray-500">Applied for:</span> {item.jobTitle}
                </p>
              )}
              
              {item.parsedData?.skills && (
                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-gray-500">SKILLS</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.parsedData.skills.map((skill: string, i: number) => (
                      <span key={i} className={skillTagClass}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {item.parsedData?.years_of_experience && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
                  <span className="text-gray-500">Experience:</span> {item.parsedData.years_of_experience.total_experience}
                </p>
              )}
              
              {item.parsedData?.education && (
                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-gray-500">EDUCATION</h4>
                  <ul className={`${isMobile ? 'text-xs' : 'text-sm'} space-y-1 mt-1`}>
                    {item.parsedData.education.map((edu: any, i: number) => (
                      <li key={i}>
                        {edu.institution} ({edu.year})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {item.parsedData?.experience && (
                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-gray-500">EXPERIENCE</h4>
                  <ul className={`${isMobile ? 'text-xs' : 'text-sm'} space-y-1 mt-1`}>
                    {item.parsedData.experience.map((exp: any, i: number) => (
                      <li key={i}>
                        {exp.title} at {exp.company} ({exp.period})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    } else if (query.collection === 'jobs') {
      return (
        <div className={`mt-4 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
          {data.map((item, index) => (
            <div key={index} className={cardClass}>
              <h3 className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : ''}`}>{item.title}</h3>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                {item.company} • {item.location}
              </p>
              
              {item.salary && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
                  <span className="text-gray-500">Salary:</span> {item.salary}
                </p>
              )}
              
              {item.skills && (
                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-gray-500">REQUIRED SKILLS</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.skills.map((skill: string, i: number) => (
                      <span key={i} className={jobSkillTagClass}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {item.shortDescription && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} mt-2`}>{item.shortDescription}</p>
              )}
              
              {item.deadline && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1 text-red-600`}>
                  <span className="text-gray-500">Application deadline:</span> {item.deadline}
                </p>
              )}
              
              {item.contactEmail && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
                  <span className="text-gray-500">Contact:</span> {item.contactEmail}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Fallback for other data types
    return (
      <div className={`mt-4 bg-gray-50 p-4 rounded-lg shadow-sm`}>
        <pre className={`${isMobile ? 'text-2xs' : 'text-xs'} overflow-x-auto`}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <>
    <div className="flex flex-col h-screen bg-white">
      <div className={isMobile ? "" : ""}>
        <EmployeeNavbar />
      </div>
      <main className={`flex-1 overflow-hidden ${isMobile ? 'w-full' : 'max-w-3xl w-full mx-auto'}`}>
        <div className="h-full flex flex-col">
          {/* Chat messages container */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-6'} space-y-6`}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`${isMobile ? 'max-w-[80%]' : 'max-w-sm'} rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{message.content}</p>
                  {message.data && (
                    <div className={`${isMobile ? 'mt-2' : 'mt-3'} rounded-lg overflow-hidden`}>
                      {message.data}
                    </div>
                  )}
                  <p className={`${isMobile ? 'text-xs' : 'text-xs'} mt-1 opacity-70 text-right`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 ${isMobile ? 'max-w-[80%]' : 'max-w-sm'} shadow-sm`}>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input form */}
          <div className={`${isMobile ? 'px-3 pb-4' : 'px-6 pb-6'}`}>
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your query here..."
                className={`w-full bg-gray-100 rounded-full ${isMobile ? 'px-4 py-3 pr-12 text-xs' : 'px-6 py-4 pr-16 text-sm'} focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white ${isMobile ? 'p-1.5' : 'p-2'} rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 shadow-sm`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 mt-2 text-center`}>
              Example: "Show me applicants with React and Node.js experience"
            </p>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}