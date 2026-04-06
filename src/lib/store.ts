import { z } from "zod";

export type UserRole = "patient" | "caregiver" | "volunteer" | "moderator";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
}

export interface HealthEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  createdBy: string;
  registeredUsers: string[];
}

export interface DonationCamp {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  createdBy: string;
  registeredUsers: string[];
}

// Validation schemas
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  role: z.enum(["patient", "caregiver", "volunteer", "moderator"]),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const messageSchema = z.object({
  text: z.string().trim().min(1, "Message cannot be empty").max(1000),
});

export const eventSchema = z.object({
  title: z.string().trim().min(2, "Title required").max(200),
  description: z.string().trim().min(2, "Description required").max(1000),
  date: z.string().min(1, "Date required"),
  location: z.string().trim().min(2, "Location required").max(200),
});

export const donationCampSchema = z.object({
  title: z.string().trim().min(2, "Title required").max(200),
  description: z.string().trim().min(2, "Description required").max(1000),
  date: z.string().min(1, "Date required"),
  location: z.string().trim().min(2, "Location required").max(200),
  type: z.string().trim().min(1, "Type required").max(100),
});

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Users
export function getUsers(): User[] {
  return getItem<User[]>("hc_users", []);
}

export function registerUser(data: z.infer<typeof registerSchema>): User {
  const users = getUsers();
  if (users.find((u) => u.email === data.email)) {
    throw new Error("Email already registered");
  }
  const user: User = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  setItem("hc_users", users);
  return user;
}

export function loginUser(data: z.infer<typeof loginSchema>): User {
  const users = getUsers();
  const user = users.find((u) => u.email === data.email && u.password === data.password);
  if (!user) throw new Error("Invalid email or password");
  return user;
}

export function setCurrentUser(user: User | null) {
  if (user) setItem("hc_current_user", user);
  else localStorage.removeItem("hc_current_user");
}

export function getCurrentUser(): User | null {
  return getItem<User | null>("hc_current_user", null);
}

// Messages
export function getMessages(): Message[] {
  return getItem<Message[]>("hc_messages", []);
}

export function addMessage(user: User, text: string): Message {
  const messages = getMessages();
  const msg: Message = {
    id: crypto.randomUUID(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    text,
    createdAt: new Date().toISOString(),
  };
  messages.push(msg);
  setItem("hc_messages", messages);
  return msg;
}

export function deleteMessage(id: string) {
  const messages = getMessages().filter((m) => m.id !== id);
  setItem("hc_messages", messages);
}

// Events
export function getEvents(): HealthEvent[] {
  return getItem<HealthEvent[]>("hc_events", []);
}

export function addEvent(data: z.infer<typeof eventSchema>, createdBy: string): HealthEvent {
  const events = getEvents();
  const ev: HealthEvent = {
    id: crypto.randomUUID(),
    ...data,
    createdBy,
    registeredUsers: [],
  };
  events.push(ev);
  setItem("hc_events", events);
  return ev;
}

export function deleteEvent(id: string) {
  setItem("hc_events", getEvents().filter((e) => e.id !== id));
}

export function toggleEventRegistration(eventId: string, userId: string) {
  const events = getEvents().map((e) => {
    if (e.id === eventId) {
      const idx = e.registeredUsers.indexOf(userId);
      if (idx >= 0) e.registeredUsers.splice(idx, 1);
      else e.registeredUsers.push(userId);
    }
    return e;
  });
  setItem("hc_events", events);
}

// Donation Camps
export function getDonationCamps(): DonationCamp[] {
  return getItem<DonationCamp[]>("hc_donation_camps", []);
}

export function addDonationCamp(data: z.infer<typeof donationCampSchema>, createdBy: string): DonationCamp {
  const camps = getDonationCamps();
  const camp: DonationCamp = {
    id: crypto.randomUUID(),
    ...data,
    createdBy,
    registeredUsers: [],
  };
  camps.push(camp);
  setItem("hc_donation_camps", camps);
  return camp;
}

export function deleteDonationCamp(id: string) {
  setItem("hc_donation_camps", getDonationCamps().filter((c) => c.id !== id));
}

export function toggleCampRegistration(campId: string, userId: string) {
  const camps = getDonationCamps().map((c) => {
    if (c.id === campId) {
      const idx = c.registeredUsers.indexOf(userId);
      if (idx >= 0) c.registeredUsers.splice(idx, 1);
      else c.registeredUsers.push(userId);
    }
    return c;
  });
  setItem("hc_donation_camps", camps);
}
