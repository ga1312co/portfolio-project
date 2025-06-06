import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import './HoverPopup.css';

export default function HoverPopup({ hoveredObject, mousePosition }) {
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState(null);
  const [isHoveringPopup, setIsHoveringPopup] = useState(false);
  const hideTimeoutRef = useRef(null);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsData, experiencesData] = await Promise.all([
          apiService.getProjects(),
          apiService.getExperiences()
        ]);
        setProjects(projectsData);
        setExperiences(experiencesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set popup position ONLY when it first appears
  useEffect(() => {
    if (hoveredObject && mousePosition && !showPopup) {
      // Clear any hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      const offset = 0;
      const popupWidth = 350;
      const popupHeight = 400;
      const headerHeight = 80; // Account for header height
      const topMargin = 20; // Additional margin from top
      
      let left = mousePosition.x + offset;
      let top = mousePosition.y - popupHeight / 2;

      if (left + popupWidth > window.innerWidth) {
        left = mousePosition.x - popupWidth - offset;
      }
      
      // Ensure popup doesn't go behind header
      if (top < headerHeight + topMargin) {
        top = headerHeight + topMargin;
      }
      
      if (top + popupHeight > window.innerHeight - 20) {
        top = window.innerHeight - popupHeight - 20;
      }

      setPopupPosition({ left, top });
      setShowPopup(true);
    } else if (!hoveredObject && !isHoveringPopup) {
      // Hide with delay
      hideTimeoutRef.current = setTimeout(() => {
        setShowPopup(false);
        setPopupPosition(null);
      }, 300);
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [hoveredObject, showPopup, isHoveringPopup]);

  // Handle popup hover to keep it visible
  const handlePopupMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setIsHoveringPopup(true);
  };

  const handlePopupMouseLeave = () => {
    setIsHoveringPopup(false);
    hideTimeoutRef.current = setTimeout(() => {
      setShowPopup(false);
      setPopupPosition(null);
    }, 300);
  };

  const getPopupContent = (objectName) => {
    const name = objectName?.toLowerCase() || '';
    
    if (name.includes('projects')) {
      return {
        title: 'PROJECTS',
        description: 'Explore my latest projects including web applications, 3D visualizations, and full-stack development work.',
        projects: projects,
        type: 'projects'
      };
    }
    
    if (name.includes('experience')) {
      return {
        title: 'EXPERIENCE',
        subtitle: '', // Remove the count subtitle
        description: 'My work experience and the projects I\'ve contributed to in my career.',
        experiences: experiences,
        type: 'experiences'
      };
    }
    
    if (name.includes('about')) {
      return {
        title: 'ABOUT THIS PAGE',
        subtitle: 'How I Built This',
        description: 'This page is built with React, Three.js, and CSS.',
        details: [
          'Created with React and Three.js',
          'Responsive design for all devices',
          'Interactive 3D elements and animations',
          'Optimized for performance and accessibility'
        ],
        type: 'about'
      };
    }
    
    return null;
  };

  if (!showPopup || !popupPosition || !hoveredObject) return null;

  const content = getPopupContent(hoveredObject);
  if (!content) return null;

  return (
    <div 
      className="hover-popup"
      style={{
        position: 'fixed',
        left: `${popupPosition.left}px`,
        top: `${popupPosition.top}px`,
      }}
      onMouseEnter={handlePopupMouseEnter}
      onMouseLeave={handlePopupMouseLeave}
    >
      <div className="popup-header">
        <h3 className="popup-title">{content.title}</h3>
        {/* Only show subtitle if it exists and isn't empty */}
        {content.subtitle && (
          <p className="popup-subtitle">
            {loading ? 'Loading...' : content.subtitle}
          </p>
        )}
      </div>

      {content.description && (
        <p className="popup-description">{content.description}</p>
      )}

      {/* Projects - simplified */}
      {content.type === 'projects' && content.projects && (
        <div className="popup-section">
          <div className="scrollable-content">
            {content.projects.map((project) => {
              // Handle JSON description
              let projectSummary = 'No description available';
              let projectTech = [];
              let githubLink = null;
              
              if (project.description && typeof project.description === 'object') {
                projectSummary = project.description.summary || 'No summary available';
                projectTech = project.description.tech || [];
                githubLink = project.description.GitHubLink || project.description.githubLink;
              } else if (project.description && typeof project.description === 'string') {
                projectSummary = project.description.substring(0, 120) + '...';
              }

              return (
                <div key={project.id} className="list-item">
                  <strong className="item-title">{project.title}</strong>
                  <span className="item-description">
                    {projectSummary.length > 120 ? projectSummary.substring(0, 100) + '... Open page to see more' : projectSummary}
                  </span>
                  {projectTech.length > 0 && (
                    <div className="item-tech">
                      <small>Tech: {projectTech.join(', ')}</small>
                    </div>
                  )}
                  {githubLink && (
                    <div className="item-github">
                      <a 
                        href={githubLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="github-link"
                      >
                        🐱 GitHub
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Experiences - simplified */}
      {content.type === 'experiences' && content.experiences && (
        <div className="popup-section">
          <div className="scrollable-content">
            {content.experiences.map((experience) => (
              <div key={experience.id} className="list-item">
                <strong className="item-title">{experience.title}</strong>
                <span className="item-description">
                  {experience.description && typeof experience.description === 'string' 
                    ? experience.description.substring(0, 200) + '...' 
                    : `${experience.startDate ? new Date(experience.startDate).getFullYear() : ''} - ${experience.endDate ? new Date(experience.endDate).getFullYear() : 'Present'}`}
                </span>
              </div>
            ))}
          </div>
          
          {/* Resume link section */}
          <div className="popup-resume-section">
            <a 
              href="https://docs.google.com/document/d/18bghuxj7JjOlo-jk5cEUtm8xnTemwvY_/edit?usp=sharing&ouid=100468930364114033021&rtpof=true&sd=true" 
              target="_blank" 
              rel="noopener noreferrer"
              className="resume-link"
            >
              📄 View Full Resume
            </a>
          </div>
        </div>
      )}

      {/* About details */}
      {content.type === 'about' && content.details && (
        <div className="popup-section">
          {content.details.map((detail, index) => (
            <div key={index} className="detail-item">
              {detail}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
