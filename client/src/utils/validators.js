export function isEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email || !isEmail(email)) errors.email = "Enter a valid email.";
  if (!password || password.length < 6) errors.password = "Password must be at least 6 characters.";
  return errors;
}

export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = validateLogin({ email, password });
  if (!name || name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
  if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export function validateTask({ title }) {
  const errors = {};
  if (!title || title.trim().length < 2) errors.title = "Title must be at least 2 characters.";
  return errors;
}
