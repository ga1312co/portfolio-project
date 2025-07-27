export const apiService = {
  // Projects
  async getProjects() {
    try {
      const response = await fetch('/projects.json');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return await response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  // Experiences
  async getExperiences() {
    try {
      const response = await fetch('/experiences.json');
      if (!response.ok) throw new Error('Failed to fetch experiences');
      return await response.json();
    } catch (error) {
      console.error('Error fetching experiences:', error);
      return [];
    }
  }
};
