export type AppMode = 'home' | 'work' | 'life';

export type TransitionStage = 
  | 'idle' 
  | 'prepare-work' 
  | 'walking-work' 
  | 'arrived-work' 
  | 'prepare-life' 
  | 'walking-life' 
  | 'swing-life';

// 单个项目最关键的一个数字（例如准时履约率、节省的成本），在项目详情里以大字号展示
export interface ProjectMetric {
  value: string;
  label: string;
  note?: string;
}

export interface ProjectCaseStudy {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  period: string;
  tags: string[];
  context: string;
  problem: string;
  myRole: string;
  whatIDid: string[];
  system?: string;
  result: string;
  metrics?: ProjectMetric[];
  whatILearned: string;
}

export interface CapabilityItem {
  key: string;
  name: string;
  tagline: string;
  details: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  location: string;
  title: string;
  period: string;
  description: string;
  keyProjects: string[];
  skills: string[];
}

export interface EducationItem {
  institution: string;
  location: string;
  degree: string;
  period: string;
  honors?: string;
}

export interface ValueItem {
  id: string;
  title: string;
  summary: string;
  reflection: string;
}

export interface PhotoSeries {
  id: string;
  title: string;
  subject: string;
  focalLength: string;
  aperture: string;
  iso: string;
  lightingNote: string;
  story: string;
  aspectRatio: string;
  /** 真实照片路径（放在 public/photos/ 下）。留空时前台显示占位块。 */
  src?: string;
}

export interface TravelDestination {
  id: string;
  city: string;
  country: string;
  year: string;
  airportCode: string;
  tagline: string;
  memory: string;
  highlight: string;
}

export interface TinkeringItem {
  id: string;
  title: string;
  category: string;
  status: string;
  description: string;
  insight: string;
  link?: string;
}
