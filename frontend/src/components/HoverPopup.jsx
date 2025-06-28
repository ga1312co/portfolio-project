import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import '../styles/HoverPopup.css';

export default function HoverPopup({ hoveredObjectInfo, onProjectHover }) {
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState(null);
  const [isHoveringPopup, setIsHoveringPopup] = useState(false);
  const [isVisibleClass, setIsVisibleClass] = useState(false);
  const startHidingTimeoutRef = useRef(null);
  const domRemoveTimeoutRef = useRef(null);
  const entryAnimationRequestId = useRef(null);
  const [currentObjectNameForContent, setCurrentObjectNameForContent] = useState(null);
  const [lastProjectImageUrl, setLastProjectImageUrl] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    fetchProjectsAndExperiences();
  }, []);

  async function fetchProjectsAndExperiences() {
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
  }

  // --- Popup Visibility, Positioning, and Animation ---
  useEffect(() => {
    clearAllTimeoutsAndAnimationFrames();

    const isPopupReferencedByObject = hoveredObjectInfo && hoveredObjectInfo.bounds;
    const shouldBeVisible = isPopupReferencedByObject || isHoveringPopup;

    if (shouldBeVisible) {
      if (isPopupReferencedByObject) {
        updatePopupContentAndPosition(hoveredObjectInfo);
      }
      handlePopupBecomingVisible(isPopupReferencedByObject);
    } else {
      handlePopupHiding();
    }

    return () => {
      clearAllTimeoutsAndAnimationFrames();
    };
  }, [hoveredObjectInfo, isHoveringPopup]);

  function clearAllTimeoutsAndAnimationFrames() {
    if (startHidingTimeoutRef.current) clearTimeout(startHidingTimeoutRef.current);
    if (domRemoveTimeoutRef.current) clearTimeout(domRemoveTimeoutRef.current);
    if (entryAnimationRequestId.current) cancelAnimationFrame(entryAnimationRequestId.current);
  }

  function updatePopupContentAndPosition(objectInfo) {
    if (objectInfo.name !== currentObjectNameForContent || !showPopup) {
      setCurrentObjectNameForContent(objectInfo.name);
    }
    setPopupPosition(calculatePopupPosition(objectInfo.bounds));
  }

  function calculatePopupPosition(bounds) {
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
    return { left, top };
  }

  function handlePopupBecomingVisible(isPopupReferencedByObject) {
    if (!showPopup) {
      setShowPopup(true);
      setIsVisibleClass(false);
      entryAnimationRequestId.current = requestAnimationFrame(() => {
        setIsVisibleClass(true);
      });
    } else if (!isVisibleClass) {
      setIsVisibleClass(true);
    }
  }

  function handlePopupHiding() {
    if (showPopup && isVisibleClass) {
      startHidingTimeoutRef.current = setTimeout(() => {
        setIsVisibleClass(false);
        domRemoveTimeoutRef.current = setTimeout(() => {
          if (!hoveredObjectInfo && !isHoveringPopup) {
            setShowPopup(false);
            setPopupPosition(null);
          }
        }, 200);
      }, 250);
    } else if (showPopup && !isVisibleClass) {
      if (!domRemoveTimeoutRef.current) {
        domRemoveTimeoutRef.current = setTimeout(() => {
          if (!hoveredObjectInfo && !isHoveringPopup) {
            setShowPopup(false);
            setPopupPosition(null);
          }
        }, 200);
      }
    }
  }

  // --- Mouse Handlers ---
  function handlePopupMouseEnter() {
    clearAllTimeoutsAndAnimationFrames();
    setIsHoveringPopup(true);
  }

  function handlePopupMouseLeave() {
    setIsHoveringPopup(false);
  }

  function handleProjectRowEnter(project) {
    const screenshotUrl =
      Array.isArray(project.images) && project.images.length > 0
        ? project.images[0].url
        : null;
    setLastProjectImageUrl(screenshotUrl);
    if (onProjectHover) onProjectHover(screenshotUrl);
  }

  function handleProjectRowLeave() {
    // Do not reset the image here; keep showing the last hovered project image
    // If you want to reset only when popup closes, handle it in useEffect below
  }

  // Reset the image only when popup is fully closed
  useEffect(() => {
    if (!showPopup) {
      setLastProjectImageUrl(null);
      if (onProjectHover) onProjectHover(null);
    }
  }, [showPopup, onProjectHover]);

  // --- Content Builders ---
  function getPopupContent(objectName) {
    if (!objectName) return null;
    const name = objectName.toLowerCase();

    if (name.includes('projects')) {
      return buildProjectsContent();
    }
    if (name.includes('experience')) {
      return buildExperiencesContent();
    }
    if (name.includes('about')) {
      return buildAboutContent();
    }
    return null;
  }

  function buildProjectsContent() {
    return {
      title: 'PROJECTS',
      projects: projects,
      type: 'projects'
    };
  }

  function buildExperiencesContent() {
    return {
      title: 'EXPERIENCE',
      subtitle: '',
      experiences: experiences,
      type: 'experiences'
    };
  }

  function buildAboutContent() {
    return {
      title: 'ABOUT THIS PAGE',
      details: [
        '- UI Created with React and Three.js',
        '- 3D Models from Blender',
        '- API Integration with Node.js and Express',
        '- Database(Postgre & Prisma)-driven content management',
        '- Containerized with Docker',
        ' ',
        'FIRST DEPLOYMENT IN AWS:',
        'Frontend: hosted on S3 with CloudFront as CDN', 
        'Backend: Docker container on ECS Fargate behind an Application Load Balancer.', 
        'PostgreSQL database on AWS RDS.',
        'Did this to learn AWS services - but expensive to run 💸💸💸',
        ' ',
        'SECOND DEPLOYMENT IN NETLIFY:',
        'Hosted on Netlify with automatic deploys from GitHub',
        'EASY TO MAINTAIN AND FREE TO HOST 😎😎',
      ],
      type: 'about'
    };
  }

  // --- Render Helpers ---
  function renderProjectsSection(content) {
    return (
      <div className="popup-section">
        <div className="scrollable-content">
          {content.projects.map((project) => {
            const { projectSummary, projectTech, githubLink } = getProjectDisplayInfo(project);
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
    );
  }

  function getProjectDisplayInfo(project) {
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
    return { projectSummary, projectTech, githubLink };
  }

  function renderExperiencesSection(content) {
    return (
      <div className="popup-section">
        <div className="scrollable-content">
          {content.experiences.map((experience) => {
            const { firstImage, header, text, startYear, endYear } = getExperienceDisplayInfo(experience);
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
    );
  }

  function getExperienceDisplayInfo(experience) {
    const firstImage =
      Array.isArray(experience.images) && experience.images.length > 0
        ? experience.images[0].url
        : null;

    let header = '';
    let text = '';
    if (experience.description && typeof experience.description === 'object') {
      header = experience.description.header || '';
      text = experience.description.text || '';
    } else if (typeof experience.description === 'string') {
      text = experience.description;
    }

    const startYear = experience.startDate ? new Date(experience.startDate).getFullYear() : '';
    const endYear = experience.endDate ? new Date(experience.endDate).getFullYear() : 'Present';

    return { firstImage, header, text, startYear, endYear };
  }

  function renderAboutSection(content) {
    return (
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
    );
  }

  // --- Main Render ---
  const content = getPopupContent(currentObjectNameForContent);

  if (!showPopup || !popupPosition) return null;

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
          {content.type === 'projects' && content.projects && renderProjectsSection(content)}
          {content.type === 'experiences' && content.experiences && renderExperiencesSection(content)}
          {content.type === 'about' && content.details && renderAboutSection(content)}
        </>
      ) : null}
    </div>
  );
}
