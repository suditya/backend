export const validateCredentials = (email: string, password: string) => {
  let errors = "";
  if (!isValidEmail(email)) {
    errors += `Invalid email`;
  }
  errors += validatePassword(password);
  return errors;
};

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): string => {
  const minLength = 8; // Minimum password length
  const requirements: {
    uppercase: RegExp;
    lowercase: RegExp;
    digit: RegExp;
    symbol: RegExp;
    [key: string]: RegExp; // Add an index signature
  } = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    digit: /\d/,
    symbol: /[\W_]/,
  };

  // Check minimum length
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }

  // Check for at least three different character types
  let charTypeCount = 0;
  for (const type in requirements) {
    if (requirements[type].test(password)) {
      charTypeCount++;
      if (charTypeCount >= 3) {
        break; // Early exit if 3 types are found
      }
    }
  }

  if (charTypeCount < 3) {
    return "Password must contain at least three of the following: uppercase letters, lowercase letters, numbers, and symbols";
  }
  return ""; // Password is valid
};
