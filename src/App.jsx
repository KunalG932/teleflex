import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import docs from './docs.js';

function App() {
  const [activeSection, setActiveSection] = useState('');

  // Extract headings from markdown for navigation
  const headings = docs.match(/^#{1,2} (.+)$/gm)?.map(heading => {
    const level = heading.match(/^#{1,2}/)[0].length;
    const text = heading.replace(/^#{1,2} /, '');
    return { level, text };
  }) || [];

  const handleNavClick = (heading) => {
    const element = document.getElementById(heading.toLowerCase().replace(/\s+/g, '-'));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(heading);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  className="h-8 w-auto"
                  src="https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=50" 
                  alt="Teleflex" 
                />
                <span className="ml-2 text-xl font-semibold text-gray-900">Teleflex</span>
              </div>
            </div>
            <div className="flex items-center">
              <a
                href="https://github.com/kunalg932/teleflex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="py-8 grid grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="col-span-3">
            <div className="sticky top-20 space-y-4">
              <nav className="space-y-1">
                {headings.map((heading, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavClick(heading.text)}
                    className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeSection === heading.text
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } ${heading.level === 2 ? 'pl-6' : ''}`}
                  >
                    {heading.text}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <main className="col-span-9 prose prose-blue max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {docs}
            </ReactMarkdown>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;