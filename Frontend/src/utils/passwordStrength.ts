export interface PasswordStrength {
  score: number; // 0-100
  percentage: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  length: number;
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return {
      score: 0,
      percentage: 0,
      level: 'weak',
      hasUppercase: false,
      hasLowercase: false,
      hasNumbers: false,
      hasSymbols: false,
      length: 0,
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);
  const length = password.length;

  let score = 0;

  // Length scoring (max 40 points)
  if (length >= 8) score += 20;
  if (length >= 12) score += 10;
  if (length >= 16) score += 10;

  // Character variety scoring (max 60 points)
  if (hasUppercase) score += 15;
  if (hasLowercase) score += 15;
  if (hasNumbers) score += 15;
  if (hasSymbols) score += 15;

  const percentage = Math.min(score, 100);

  let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (percentage >= 80) level = 'strong';
  else if (percentage >= 60) level = 'good';
  else if (percentage >= 40) level = 'fair';

  return {
    score,
    percentage,
    level,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSymbols,
    length,
  };
};
