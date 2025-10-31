export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    suggestions?: string[];
}

export interface ValidationPort {
    validateSyntax(content: string, language: string): Promise<ValidationResult>;
    validateSecurity(content: string): Promise<ValidationResult>;
    requestHumanApproval(filePath: string): Promise<boolean>;
}