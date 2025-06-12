import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import './HoverPopup.css';

export default function HoverPopup({ hoveredObjectInfo, onProjectHover }) {
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

  // Handler for mouse enter/leave on project row
  const handleProjectRowEnter = (project) => {
    // Use the first image URL if available
    const screenshotUrl =
      Array.isArray(project.images) && project.images.length > 0
        ? project.images[0].url
        : null; // If no image, send null to reset
    if (onProjectHover) onProjectHover(screenshotUrl);
  };
  const handleProjectRowLeave = () => {
    if (onProjectHover) onProjectHover(null);
  };

  const getPopupContent = (objectName) => {
    if (!objectName) return null;
    const name = objectName.toLowerCase();
    
    if (name.includes('projects')) {
      return {
        title: 'PROJECTS',
        projects: projects,
        type: 'projects'
      };
    }
    
    if (name.includes('experience')) {
      return {
        title: 'EXPERIENCE',
        subtitle: '', // Remove the count subtitle
        experiences: experiences,
        type: 'experiences'
      };
    }
    
    if (name.includes('about')) {
      return {
        title: 'ABOUT THIS PAGE',
        description: 'This GUI is built with React, Three.js, Blender, and CSS.',
        details: [
          '- UI Created with React and Three.js',
          '- 3D Models from Blender',
          '- API Integration with Node.js and Express',
          '- Interactive 3D elements and animations',
          '- Database-driven content management',
          '- Database: Prisma with PostgreSQL',
          '- Containerized with Docker',
          '- Fun project to test building with 3D elements and React!',
        ],
        type: 'about'
      };
    }
    
    return null;
  };
  
  // Use the state variable for content to prevent it from disappearing during exit animation
  const content = getPopupContent(currentObjectNameForContent);

  if (!showPopup || !popupPosition) return null; 

  // Determine popup type for rendering (for width/height)
  const renderType = content?.type;

  return (
    <div 
      className={`hover-popup ${isVisibleClass ? 'visible' : ''}${renderType === 'projects' ? ' popup-projects' : ''}`}
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
                    <div
                      key={project.id}
                      className="list-item"
                      onMouseEnter={() => handleProjectRowEnter(project)}
                      onMouseLeave={handleProjectRowLeave}
                    >
                      <div className="item-info">
                        <strong className="item-title">{project.title}</strong>
                        <span className="item-description">
                          {projectSummary.length > 120 ? projectSummary.substring(0, 100) + '... Open page to see more' : projectSummary}
                        </span>
                        {projectTech.length > 0 && (
                          <div className="item-tech">
                            <small>Tech: {projectTech.join(', ')}</small>
                          </div>
                        )}
                      </div>
                      {githubLink && (
                        <div className="item-github">
                          <a 
                            href={githubLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="github-link"
                            title="GitHub"
                          >
                            <img
                              src="/images/github_logo.png"
                              alt="GitHub"
                              style={{ width: 20, height: 20, verticalAlign: 'middle' }}
                            />
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
                {content.experiences.map((experience) => {
                  // Get first image if available
                  const firstImage =
                    Array.isArray(experience.images) && experience.images.length > 0
                      ? experience.images[0].url
                      : null;

                  // Handle JSON description
                  let header = '';
                  let text = '';
                  if (experience.description && typeof experience.description === 'object') {
                    header = experience.description.header || '';
                    text = experience.description.text || '';
                  } else if (typeof experience.description === 'string') {
                    text = experience.description;
                  }

                  // Format dates
                  const startYear = experience.startDate ? new Date(experience.startDate).getFullYear() : '';
                  const endYear = experience.endDate ? new Date(experience.endDate).getFullYear() : 'Present';

                  return (
                    <div key={experience.id} className="list-item experience-item">
                      <div className="experience-header">
                        <strong className="item-title">{experience.title}</strong>
                        {firstImage && (
                          <img
                            src={firstImage}
                            alt={experience.title + ' screenshot'}
                            className="experience-image"
                          />
                        )}
                      </div>
                      {header && (
                        <span className="experience-header-text">{header}</span>
                      )}
                      <span className="experience-dates">
                        {startYear}{startYear && endYear ? ' – ' : ''}{endYear}
                      </span>
                      {text && (
                        <span className="item-description">
                          {text.length > 400 ? text.substring(0, 200) + '...' : text}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Resume link section */}
              <div className="popup-resume-section">
                <a 
                  href="https://drive.google.com/file/d/1Wz76jZe_rYO4U02gY9HpvjIBqV09ma3j/view?usp=sharing" 
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
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <a
                  href="https://github.com/ga1312co/portfolio-project"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-link"
                  title="View source on GitHub"
                  style={{ display: 'inline-block' }}
                >
                  <img
                    src="/images/github_logo.png"
                    alt="GitHub"
                    style={{ width: 28, height: 28, verticalAlign: 'middle' }}
                  />
                </a>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
