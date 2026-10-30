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
  // 案例页「行动」里的配图：缩略图显示在对应那条行动的右侧，点击放大并可在同一条行动的配图间切换。
  // 不写 action 时，第 N 张图对应第 N 条行动；写了 action（从 0 开始的行动序号），同一条行动可以挂多张图。
  images?: ProjectImage[];
  // 行动旁边的外链（比如已上线的网站）：显示在对应那条行动的文字末尾，在大图预览里也会带上。
  links?: ProjectLink[];
  system?: string;
  result: string;
  metrics?: ProjectMetric[];
  whatILearned: string;
}

export interface ProjectLink {
  action: number;
  href: string;
  label: string;
}

export interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
  action?: number;
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
  companyEn?: string;
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
  /** 学位/专业，暂时没有就留空，页面上不显示这一项。 */
  degree?: string;
  period: string;
  institutionZh?: string;
  gpa?: string;
  honors?: string[];
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
