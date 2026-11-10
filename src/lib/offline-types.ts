export interface OfflineResource {
  url: string;
  bytes: number;
  sha256: string;
}
export interface OfflineSummary {
  slug: string;
  title: string;
  courseId: string;
  courseTitle: string;
  number: number;
  href: string;
  courseHref: string;
  revision: string;
  bytes: number;
  resourceCount: number;
  packageUrl: string;
}
export interface OfflinePackage extends OfflineSummary {
  version: 1;
  resources: OfflineResource[];
}
export interface SavedLesson extends OfflinePackage {
  savedAt: number;
  cacheName: string;
}
