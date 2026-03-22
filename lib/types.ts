export interface SearchFormData {
  name: string;
  email: string;
  role: string;
  industry: string;
  level: 'junior' | 'regular' | 'senior' | 'lead' | 'head' | 'director' | 'c-level';
  referenceLinkedin?: string;
}

export interface Candidate {
  name: string;
  linkedinUrl: string;
  currentRole: string;
  currentCompany: string;
  previousCompanies: string[];
  whyMatch: string;
}
