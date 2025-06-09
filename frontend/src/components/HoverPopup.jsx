import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import './HoverPopup.css';

export default function HoverPopup({ hoveredObjectInfo }) {
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // Controls DOM presence
  const [popupPosition, setPopupPosition] = useState(null);
  const [isHoveringPopup, setIsHoveringPopup] = useState(false);
  const [isVisibleClass, setIsVisibleClass] = useState(false); // Controls CSS animation class
  
  const startHidingTimeoutRef = useRef(null); // For the "bridge" grace period
  const domRemoveTimeoutRef = useRef(null);   // For removing from DOM after animation
  const entryAnimationRequestId = useRef(null); // For entry animation sequencing (using rAF)
  const [currentObjectNameForContent, setCurrentObjectNameForContent] = useState(null);


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

  // Popup visibility, positioning, and animation logic
  useEffect(() => {
    // Clear all potentially pending timeouts/animation frames at the start of each effect run
    if (startHidingTimeoutRef.current) clearTimeout(startHidingTimeoutRef.current);
    if (domRemoveTimeoutRef.current) clearTimeout(domRemoveTimeoutRef.current);
    if (entryAnimationRequestId.current) cancelAnimationFrame(entryAnimationRequestId.current);

    const isPopupReferencedByObject = hoveredObjectInfo && hoveredObjectInfo.bounds;
    const shouldBeVisible = isPopupReferencedByObject || isHoveringPopup;

    if (shouldBeVisible) {
      if (isPopupReferencedByObject) {
        // Update position and content name only if object is hovered
        if (hoveredObjectInfo.name !== currentObjectNameForContent || !showPopup) {
            setCurrentObjectNameForContent(hoveredObjectInfo.name);
        }
        const { bounds } = hoveredObjectInfo;
        const popupWidth = 350;
        const popupHeight = 400;
        const headerHeight = 80;
        const topPageMargin = 20;
        const overlapAmount = 0; 

        let left = bounds.right + overlapAmount;
        let top = bounds.top + (bounds.height / 2) - (popupHeight / 2);

        if (left + popupWidth > window.innerWidth - topPageMargin) {
          left = bounds.left - popupWidth - overlapAmount;
        }

        if (left < topPageMargin) left = topPageMargin;
        if (left + popupWidth > window.innerWidth - topPageMargin) {
          left = window.innerWidth - popupWidth - topPageMargin;
        }
        if (top < headerHeight + topPageMargin) top = headerHeight + topPageMargin;
        if (top + popupHeight > window.innerHeight - topPageMargin) {
          top = window.innerHeight - popupHeight - topPageMargin;
        }
        setPopupPosition({ left, top });
      }
      
      // Handle becoming visible
      if (!showPopup) { // If not in DOM, add it and animate in
          setShowPopup(true);
          setIsVisibleClass(false); // Prepare for animation
          entryAnimationRequestId.current = requestAnimationFrame(() => {
            setIsVisibleClass(true); // Animate in
          });
      } else if (!isVisibleClass) { // Already in DOM, but was hidden (e.g. mouse re-entered quickly)
          setIsVisibleClass(true); // Make it visible (CSS transition will apply)
      }
      // If showPopup is true AND isVisibleClass is true, it's already stable and visible. No action needed for visibility.

    } else { // Neither 3D object nor popup is hovered: Start hiding procedure
      if (showPopup && isVisibleClass) { // Only hide if it's currently shown and visible
        startHidingTimeoutRef.current = setTimeout(() => {
          setIsVisibleClass(false); // Start CSS exit animation
          
          domRemoveTimeoutRef.current = setTimeout(() => {
            if (!hoveredObjectInfo && !isHoveringPopup) { 
                setShowPopup(false);
                setPopupPosition(null);
                // setCurrentObjectNameForContent(null); // Optionally clear after fully hidden
            }
          }, 200); // This MUST match your CSS transition duration
        }, 250); // Your current grace period for the "bridge".
      } else if (showPopup && !isVisibleClass) {
        // It's in the DOM but already animating out or hidden.
        // If domRemoveTimeoutRef isn't already running (e.g., from a previous cycle),
        // ensure it gets removed. This is a fallback.
        if (!domRemoveTimeoutRef.current) { // Check if a removal is already scheduled
            domRemoveTimeoutRef.current = setTimeout(() => {
                if (!hoveredObjectInfo && !isHoveringPopup) {
                    setShowPopup(false);
                    setPopupPosition(null);
                }
            }, 200); // CSS transition duration
        }
      }
    }

    return () => {
      if (startHidingTimeoutRef.current) clearTimeout(startHidingTimeoutRef.current);
      if (domRemoveTimeoutRef.current) clearTimeout(domRemoveTimeoutRef.current);
      if (entryAnimationRequestId.current) cancelAnimationFrame(entryAnimationRequestId.current);
    };
  // Primary drivers for visibility logic.
  // currentObjectNameForContent is for content, showPopup is managed internally by this effect.
  }, [hoveredObjectInfo, isHoveringPopup]); 

  const handlePopupMouseEnter = () => {
    if (startHidingTimeoutRef.current) clearTimeout(startHidingTimeoutRef.current);
    if (domRemoveTimeoutRef.current) clearTimeout(domRemoveTimeoutRef.current);
    
    setIsHoveringPopup(true);
    // The useEffect will handle making it visible if it was in the process of hiding.
  };

  const handlePopupMouseLeave = () => {
    setIsHoveringPopup(false);
    // The useEffect will now handle the hiding logic if hoveredObjectInfo is also null.
  };

  const getPopupContent = (objectName) => {
    if (!objectName) return null;
    const name = objectName.toLowerCase();
    
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
  
  // Use the state variable for content to prevent it from disappearing during exit animation
  const content = getPopupContent(currentObjectNameForContent);

  if (!showPopup || !popupPosition) return null; 

  return (
    <div 
      className={`hover-popup ${isVisibleClass ? 'visible' : ''}`}
      style={{
        position: 'fixed',
        left: `${popupPosition.left}px`,
        top: `${popupPosition.top}px`,
        pointerEvents: isVisibleClass ? 'auto' : 'none', 
      }}
      onMouseEnter={handlePopupMouseEnter}
      onMouseLeave={handlePopupMouseLeave}
    >
      {/* Render content only if available */}
      {content ? (
        <>
          <div className="popup-header">
            <h3 className="popup-title">{content.title}</h3>
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
        </>
      ) : null}
    </div>
  );
}
