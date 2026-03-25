export interface SearchFormData {
  role: string;
  industry: string;
  level: 'junior' | 'mid' | 'senior' | 'executive';
  referenceLinkedin?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface Candidate {
  name: string;
  linkedinUrl: string;
  currentRole: string;
  currentCompany: string;
  previousCompanies: string[];
  whyMatch: string;
}

export interface LeadCaptureData {
  email: string;
  searchRole?: string;
  searchIndustry?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
