type NameParts = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
};

export function displayName(user: NameParts): string {
  const composed = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  if (composed) return composed;
  if (user.name?.trim()) return user.name.trim();
  return "Користувач";
}

export function splitGoogleName(fullName?: string | null): {
  firstName: string | null;
  lastName: string | null;
} {
  if (!fullName?.trim()) return { firstName: null, lastName: null };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}
