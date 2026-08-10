
export const isValidUsername = (username) => {
  const trimmed = username.trim();
  if (!trimmed) return "User Name is required.";
  if (/\s/.test(trimmed)) return "User Name cannot contain spaces.";

  const specialCharPattern = /[<>'"\/;()&]/g; 
  if (specialCharPattern.test(trimmed)) {
    return "User Name contains invalid characters.";
  }
  return null;
};

export const isValidEmail = (email) => {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required.";
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(trimmed)) return "Invalid email format.";
  return null;
};

export const isValidPassword = (password) => {
  const trimmed = password.trim();
  if (!trimmed) return "Password is required.";
  if (/\s/.test(trimmed)) return "Password cannot contain spaces.";

  const specialCharPattern = /[<>'"\/;()&]/g;
  if (specialCharPattern.test(trimmed)) {
    return "Password contains invalid characters.";
  }

  return null;
};

export const isValidMobile = (number) => {
  const trimmed = number.trim();
  if (!trimmed) return "Mobile number is required.";
  if (!/^\d{10}$/.test(trimmed)) return "Mobile number must be 10 digits.";
  return null;
};

export const limitToCharacters = (input) => input.slice(0, 50);

export const validateRequiredField = (value, key) => {
  if (!value || typeof value === "string" && value.trim() === "") {
    return `${key} is required.`;
  }
  return null;
};

export const validateRequiredSelect = (selected, key) => {
  if (!selected || typeof selected === "string" && selected.trim() === "") {
    return `${key} is not selected.`;
  }
  return null;
};

export const validateRequiredImage = (image, key = "Image") => {
  if (!image) {
    return `${key} is required.`;
  }
  return null;
};

export const isValidUrl = (url) => {
  const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w]{2,}(\/\S*)?$/;
  if (!urlPattern.test(url)) return "Enter a valid URL (e.g. https://example.com)";
  return null;
};

export const isOnlyDigits = (value, fieldName = "Field") => {
  const trimmed = value.trim?.() ?? "";

  if (!/^\d+$/.test(trimmed)) {
    return `${fieldName} must contain only numbers.`;
  }
  return null;
};

export const isOnlyLetters = (value, fieldName = "Field") => {
  const trimmed = value?.toString().trim() ?? "";
  if (!/^[A-Za-z\s]+$/.test(trimmed)) {
    return `${fieldName} must contain only letters.`;
  }
  return null;
};
