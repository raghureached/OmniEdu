import React, { useState, useEffect } from 'react';
import './HelpCenter.css';
import { 
  Badge,
  Search,
  User,
  BookOpen,
  FileBadge,
  List,
  Mail,
  MessageSquare,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFaqs, setExpandedFaqs] = useState([]);
  
  // Toggle FAQ expansion
  const toggleFaq = (id) => {
    if (expandedFaqs.includes(id)) {
      setExpandedFaqs(expandedFaqs.filter(faqId => faqId !== id));
    } else {
      setExpandedFaqs([...expandedFaqs, id]);
    }
  };
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Mock data for FAQs
  const faqs = [
    { 
      id: 1, 
      question: 'How do I reset my password?', 
      answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page and following the instructions sent to your email.',
      category: 'Account'
    },
    { 
      id: 2, 
      question: 'How do I enroll in a course?', 
      answer: 'To enroll in a course, navigate to the Catalog page, find the course you want to take, and click the "Enroll" button.',
      category: 'Courses'
    },
    { 
      id: 3, 
      question: 'How do I download my certificate?', 
      answer: 'After completing a course, go to your Activity History page. Find the completed course and click on "Download Certificate".',
      category: 'Certificates'
    },
    { 
      id: 4, 
      question: 'How can I track my progress?', 
      answer: 'Your progress is automatically tracked in the Learning Hub. You can see your progress for each enrolled course there.',
      category: 'Courses'
    },
    { 
      id: 5, 
      question: 'How do I update my profile information?', 
      answer: 'You can update your profile information by navigating to the My Profile page and clicking on the "Edit Profile" button.',
      category: 'Account'
    },
    { 
      id: 6, 
      question: 'Can I download course materials for offline use?', 
      answer: 'Yes, most courses offer downloadable materials. Look for the download icon next to the course content in the Learning Hub.',
      category: 'Courses'
    }
  ];
  
  // Categories for filter with icons
  const categories = [
    { id: 'all', name: 'All Categories', icon: <List size={18} /> },
    { id: 'Account', name: 'Account', icon: <User size={18} /> },
    { id: 'Courses', name: 'Courses', icon: <BookOpen size={18} /> },
    { id: 'Certificates', name: 'LeaderBoard', icon: <FileBadge size={18} /> }
  ];
  
  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="help-center-skeleton">
      <div className="help-skeleton-search"></div>
      <div className="help-skeleton-categories">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="help-skeleton-category-btn"></div>
        ))}
      </div>
      <div className="help-skeleton-faq-list">
        {[1, 2, 3].map(i => (
          <div key={i} className="help-skeleton-faq-item">
            <div className="help-skeleton-question"></div>
            <div className="help-skeleton-answer"></div>
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="help-center-container">
      <div className="help-center-header">
        <h2>We're here to help!</h2>
        <p className="help-intro-text">
          Find instant answers to common questions, explore helpful resources, or contact our 
          support team directly. Everything you need to make the most of your experience is right here.
        </p>

      </div>
      
      {isLoading ? (
        renderSkeleton()
      ) : (
        <>
          <div className="help-search-section">
            <h3 className="help-search-title">How can we help you today?</h3>
            <div className="help-search-box">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="button">
                <Search size={18} />
              </button>
            </div>
          </div>
          
          <div className="help-categories-section">
            <h3 className="help-categories-title">Browse by Category</h3>
            <div className="help-category-buttons">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`help-category-btn ${selectedCategory === category.id ? 'help-active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="help-category-icon">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="help-faq-section">
            <h3 className="help-faq-title">
              Frequently Asked Questions
              {selectedCategory !== 'all' && (
                <span className="help-selected-category"> - {categories.find(c => c.id === selectedCategory)?.name}</span>
              )}
            </h3>
            
            <div className="help-faq-list">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map(faq => (
                  <div 
                    key={faq.id} 
                    className={`help-faq-item ${expandedFaqs.includes(faq.id) ? 'help-expanded' : ''}`}
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <div className="help-faq-question">
                      <h4>{faq.question}</h4>
                      <div className="help-faq-question-right">
                        <span className="help-faq-category-tag">
                          <Badge size={14} /> {faq.category}
                        </span>
                        <ChevronDown 
                          size={18} 
                          className={`help-faq-chevron ${expandedFaqs.includes(faq.id) ? 'help-expanded' : ''}`} 
                        />
                      </div>
                    </div>
                    {expandedFaqs.includes(faq.id) && (
                      <div className="help-faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="help-no-results">
                  <HelpCircle size={24} />
                  <p>No FAQs match your search criteria. Please try a different search term or category.</p>
                  <button 
                    className="help-btn-outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="help-contact-section">
            <div className="help-contact-card">
              <h3>Still Need Help?</h3>
              <p>Our support team is here to assist you with any questions or issues you may have.</p>
              <div className="help-contact-options">
                <button className="help-btn-primary">
                  <Mail size={18} /> Email Support
                </button>
                {/* <button className="help-btn-outline">
                  <MessageSquare size={18} /> Live Chat
                </button> */}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HelpCenter;