import { useEffect, useMemo, useState } from 'react';

/*
 * Shared profile store, used by BOTH the Profile page and the Navbar so that
 * saving your profile updates the navbar avatar, greeting and the
 * "profile completion" card instantly.
 *
 * Save this file as:  src/utils/profilePhoto.js
 *
 * How it works:
 *  - Photo and profile details are kept in localStorage per user (keyed by
 *    email), with an in-memory fallback if localStorage is full or blocked.
 *  - Saving fires a `hc:profile-photo` event; every component using
 *    useProfilePhoto() / useProfileData() re-renders with the new values.
 *  - Photo values:  null = nothing stored locally (fall back to the API photo),
 *    '' = user removed their photo,  string = photo (data URL).
 */

const EVENT_NAME = 'hc:profile-photo';
const photoMemory = {};
const detailsMemory = {};

const emailOf = (user) => (user?.email || 'guest').toLowerCase();
const photoKey = (user) => `hc_profile_photo_${emailOf(user)}`;
const detailsKey = (user) => `hc_profile_details_${emailOf(user)}`;

/* ───────────── Photo ───────────── */

export function getStoredPhoto(user) {
  const key = photoKey(user);
  try {
    const value = localStorage.getItem(key);
    if (value !== null) return value;
  } catch {
    /* localStorage unavailable — fall through to memory */
  }
  return key in photoMemory ? photoMemory[key] : null;
}

export function storePhoto(user, dataUrl) {
  const key = photoKey(user);
  photoMemory[key] = dataUrl || '';
  try {
    localStorage.setItem(key, dataUrl || '');
  } catch {
    /* quota exceeded or blocked — memory copy still works for this session */
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useProfilePhoto(user) {
  const resolve = () => {
    const local = getStoredPhoto(user);
    return local !== null ? local : user?.profilePicture || '';
  };

  const [photo, setPhoto] = useState(resolve);

  useEffect(() => {
    const update = () => setPhoto(resolve());
    update();
    window.addEventListener(EVENT_NAME, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(EVENT_NAME, update);
      window.removeEventListener('storage', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.profilePicture]);

  return photo;
}

/* ───────────── Profile details (name, phone, dob, address …) ───────────── */

export function getStoredDetails(user) {
  const key = detailsKey(user);
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore — fall through to memory */
  }
  return detailsMemory[key] || null;
}

export function storeDetails(user, details) {
  const rest = { ...details };
  delete rest.profilePicture; // the photo is stored separately
  const key = detailsKey(user);
  const merged = { ...(getStoredDetails(user) || {}), ...rest };
  detailsMemory[key] = merged;
  try {
    localStorage.setItem(key, JSON.stringify(merged));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

/* The signed-in user merged with anything saved locally, plus the current photo. */
export function useProfileData(user) {
  const photo = useProfilePhoto(user);
  const [stored, setStored] = useState(() => getStoredDetails(user));

  useEffect(() => {
    const update = () => setStored(getStoredDetails(user));
    update();
    window.addEventListener(EVENT_NAME, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(EVENT_NAME, update);
      window.removeEventListener('storage', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  return useMemo(
    () => ({ ...(user || {}), ...(stored || {}), profilePicture: photo }),
    [user, stored, photo]
  );
}

/* ───────────── Load from the server ───────────── */

const syncedFor = new Set();

/*
 * Pulls the saved profile from the API (GET /donor/me) into the local store, so the
 * navbar and Profile page show the latest details on any device.
 * Runs once per signed-in user per page load. Only non-empty server values are used,
 * so details that only exist locally (older saves) are not wiped.
 *
 *   syncProfileFromServer(user, donorService.getMyProfile)
 */
export async function syncProfileFromServer(user, fetchProfile, { force = false } = {}) {
  if (!user?.email) return;
  const key = emailOf(user);
  if (!force && syncedFor.has(key)) return;
  syncedFor.add(key);

  try {
    const p = await fetchProfile();
    if (!p) return;

    const details = {};
    ['name', 'phone', 'gender', 'address', 'city', 'state', 'pincode', 'memberSince'].forEach((k) => {
      if (p[k]) details[k] = p[k];
    });
    if (p.dob) details.dob = String(p.dob).slice(0, 10);

    if (Object.keys(details).length) storeDetails(user, details);
    if (p.profilePicture) storePhoto(user, p.profilePicture);
  } catch {
    syncedFor.delete(key); // allow a retry on the next page
  }
}

/* ───────────── Profile completion ───────────── */

const COMPLETION_FIELDS = [
  ['name', 'Full name'],
  ['email', 'Email'],
  ['phone', 'Phone number'],
  ['dob', 'Date of birth'],
  ['gender', 'Gender'],
  ['address', 'Address'],
  ['city', 'City'],
  ['state', 'State'],
  ['pincode', 'Pincode'],
  ['profilePicture', 'Profile photo'],
];

/*
 * Returns { percent, missing: [labels], level }
 *   level 'empty'    → under 40%  (red warning: "Your profile is empty!")
 *   level 'partial'  → 40–99%     (amber: "Your profile is X% complete")
 *   level 'complete' → 100%       (green)
 */
export function getProfileCompletion(profile) {
  const missing = COMPLETION_FIELDS
    .filter(([key]) => !String(profile?.[key] ?? '').trim())
    .map(([, label]) => label);
  const filled = COMPLETION_FIELDS.length - missing.length;
  const percent = Math.round((filled / COMPLETION_FIELDS.length) * 100);
  const level = percent >= 100 ? 'complete' : percent < 40 ? 'empty' : 'partial';
  return { percent, missing, level };
}