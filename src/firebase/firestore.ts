import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { CourseCardPropsWithoutCode, CourseList, CoursesOnGrid, CoursesUsed, savedLayout } from "../types/types"
import { UniqueIdentifier } from "@dnd-kit/core";

// ========== HELPERS ==========

// Save generic data for a user (merge keeps other fields intact)
async function saveUserData(uid: string, key: string, value: unknown) {
  await setDoc(
    doc(db, "users", uid),
    { [key]: value },
    { merge: true }
  );
}

async function loadUserData<T>(uid: string, key: string, fallback: T): Promise<T> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return (snap.data()[key] as T) ?? fallback;
  }
  return fallback;
}

// Encode preq/coreq so nested arrays become strings (Firestore-safe)
function encodeCourseRequirements(req?: (string | string[])[]): string[] {
  if (!req) return [];
  return req.map(r => Array.isArray(r) ? JSON.stringify(r) : r);
}

// Decode preq/coreq from Firestore and restore nested arrays
function decodeCourseRequirements(req?: string[]): (string | string[])[] {
  if (!req) return [];
  return req.map(r => {
    try {
      const parsed = JSON.parse(r);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Not a JSON string, leave as-is
    }
    return r;
  });
}

// Serialize CourseList for Firestore
export function serializeCoursesForFirestore(courses: CourseList) {
  const serialized: Record<string, CourseCardPropsWithoutCode> = {};
  for (const [code, course] of Object.entries(courses)) {
    serialized[code] = {
      ...course,
      preq: encodeCourseRequirements(course.preq),
      coreq: encodeCourseRequirements(course.coreq),
    };
  }
  return serialized;
}

type SerializedCourseCard = Omit<CourseCardPropsWithoutCode, "preq" | "coreq"> & {
  preq?: string[];
  coreq?: string[];
};

type SerializedCourseList = Record<string, SerializedCourseCard>;

export function deserializeCoursesFromFirestore(data: SerializedCourseList): CourseList {
  const courses: CourseList = {};
  for (const [code, course] of Object.entries(data)) {
    courses[code] = {
      ...course,
      preq: decodeCourseRequirements(course.preq),
      coreq: decodeCourseRequirements(course.coreq),
    };
  }
  return courses;
}

// for maps and sets since Firestore doesn't support saving them
function serializeForFirestore(data: unknown): unknown {
  if (data instanceof Map) {
    // Convert Map to a plain object
    return Object.fromEntries(
      Array.from(data.entries(), ([key, value]) => [key, serializeForFirestore(value)])
    );
  } else if (Array.isArray(data)) {
    // Recursively handle nested arrays
    return data.map(serializeForFirestore);
  } else if (typeof data === "object" && data !== null) {
    // Recursively handle nested objects
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeForFirestore(value);
    }
    return result;
  }
  return data;
}

function deserializeFromFirestore(data: unknown): unknown {
  if (typeof data === "object" && data !== null) {
    if (!Array.isArray(data)) {
      // Optionally, turn certain objects back into Maps
      if (Object.values(data).every(v => typeof v === "object")) {
        return new Map(
          Object.entries(data).map(([k, v]) => [k, deserializeFromFirestore(v)])
        );
      }
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = deserializeFromFirestore(value);
      }
      return result;
    } else {
      return data.map(deserializeFromFirestore);
    }
  }
  return data;
}

export async function saveCourses(uid: string, courses: CourseList) {
  return saveUserData(uid, "courses", serializeCoursesForFirestore(courses));
}
export async function loadCourses(uid: string): Promise<CourseList> {
  const raw = await loadUserData<Record<string, SerializedCourseCard>>(uid, "courses", {});
  return deserializeCoursesFromFirestore(raw);
}

export async function saveCoursesUsed(uid: string, coursesUsed: CoursesUsed) {
  return saveUserData(uid, "coursesUsed", coursesUsed);
}
export async function loadCoursesUsed(uid: string) {
  return loadUserData<CoursesUsed>(uid, "coursesUsed", {});
}

export async function saveCoursesOnGrid(uid: string, grid: CoursesOnGrid) {
  return saveUserData(uid, "coursesOnGrid", grid);
}
export async function loadCoursesOnGrid(uid: string) {
  return loadUserData<CoursesOnGrid>(uid, "coursesOnGrid", {} as CoursesOnGrid);
}

export async function saveDependencies(
  uid: string,
  deps: Map<UniqueIdentifier, Set<UniqueIdentifier>>
) {
  return saveUserData(uid, "dependencies", serializeForFirestore(deps));
}
export async function loadDependencies(uid: string): Promise<Map<UniqueIdentifier, Set<UniqueIdentifier>>> {
  return deserializeFromFirestore(loadUserData<Map<UniqueIdentifier, Set<UniqueIdentifier>>>(uid, "dependencies", {} as Map<UniqueIdentifier, Set<UniqueIdentifier>>)) as Map<UniqueIdentifier, Set<UniqueIdentifier>>;
}

export async function saveLayouts(uid: string, layouts: savedLayout[]) {
  return saveUserData(uid, "savedLayouts", layouts);
}
export async function loadLayouts(uid: string) {
  return loadUserData<savedLayout[]>(uid, "savedLayouts", []);
}