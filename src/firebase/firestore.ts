import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { CourseList, CoursesOnGrid, CoursesUsed, savedLayout } from "../types/types"
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

export async function saveCourses(uid: string, courses: CourseList) {
  return saveUserData(uid, "courses", courses);
}
export async function loadCourses(uid: string) {
  return loadUserData(uid, "courses", []);
}

export async function saveCoursesUsed(uid: string, coursesUsed: CoursesUsed) {
  return saveUserData(uid, "coursesUsed", coursesUsed);
}
export async function loadCoursesUsed(uid: string) {
  return loadUserData(uid, "coursesUsed", {});
}

export async function saveCoursesOnGrid(uid: string, grid: CoursesOnGrid) {
  return saveUserData(uid, "coursesOnGrid", grid);
}
export async function loadCoursesOnGrid(uid: string) {
  return loadUserData(uid, "coursesOnGrid", []);
}

export async function saveDependencies(uid: string, deps: Map<UniqueIdentifier, Set<UniqueIdentifier>>) {
  return saveUserData(uid, "dependencies", deps);
}
export async function loadDependencies(uid: string) {
  return loadUserData(uid, "dependencies", []);
}

export async function saveLayouts(uid: string, layouts: savedLayout[]) {
  return saveUserData(uid, "savedLayouts", layouts);
}
export async function loadLayouts(uid: string) {
  return loadUserData(uid, "savedLayouts", []);
}
