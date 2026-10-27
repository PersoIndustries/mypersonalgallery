export type Condition = "Mint" | "Excellent" | "Good" | "Fair" | "Restoration project";

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  joined: string;
}

export type FeatureKey =
  | "description"
  | "curator"
  | "tags"
  | "condition"
  | "specs"
  | "history"
  | "model3d"
  | "documents"
  | "links"
  | "price";

export type FeatureFlags = Record<FeatureKey, boolean>;

export const FEATURES: { key: FeatureKey; label: string; hint: string; museumOnly?: boolean }[] = [
  { key: "description", label: "Description", hint: "Museum and object descriptions" },
  { key: "curator", label: "Curator", hint: "Your name and profile link", museumOnly: true },
  { key: "tags", label: "Tags", hint: "Keyword chips on each object" },
  { key: "condition", label: "Condition", hint: "Conservation state" },
  { key: "specs", label: "Specifications", hint: "Technical data table" },
  { key: "history", label: "Provenance", hint: "History and origin" },
  { key: "model3d", label: "3D model", hint: "Scan / 3D viewer" },
  { key: "documents", label: "Documentation", hint: "Manuals, schematics, PDFs" },
  { key: "links", label: "Links", hint: "External references" },
  { key: "price", label: "Approx. price", hint: "Estimated market value" },
];

export const DEFAULT_FEATURES: FeatureFlags = {
  description: true,
  curator: true,
  tags: true,
  condition: true,
  specs: true,
  history: true,
  model3d: true,
  documents: true,
  links: true,
  price: false,
};

export interface Museum {
  id: string;
  slug: string;
  ownerId: string;
  title: string;
  description: string;
  cover: string;
  category: string;
  isPublic: boolean;
  createdAt: string;
  features?: Partial<FeatureFlags>;
}

export interface SpecPair {
  key: string;
  value: string;
}

export interface ObjectLink {
  label: string;
  url: string;
}

export interface MuseumDocument {
  id: string;
  name: string;
  type: "PDF" | "Manual" | "Schematic" | "Photo scan" | "Datasheet";
  size: string;
  url: string;
}

export interface CollectionObject {
  id: string;
  museumId: string;
  title: string;
  description: string;
  year: string;
  manufacturer: string;
  model: string;
  category: string;
  tags: string[];
  specs: SpecPair[];
  history: string;
  images: string[];
  modelUrl: string | null;
  documents: MuseumDocument[];
  condition: Condition;
  featured?: boolean;
  createdAt: string;
  isVisible?: boolean;
  price?: string;
  links?: ObjectLink[];
  hiddenFeatures?: FeatureKey[];
}

export const museumFeatures = (m: Museum | undefined): FeatureFlags => ({
  ...DEFAULT_FEATURES,
  ...(m?.features ?? {}),
});

/** A feature is shown when the museum enables it and the object doesn't hide it. */
export const showFeature = (
  m: Museum | undefined,
  o: CollectionObject | undefined,
  key: FeatureKey,
) => museumFeatures(m)[key] && !(o?.hiddenFeatures ?? []).includes(key);

export const CATEGORIES = [
  "Radios",
  "Aircraft Avionics",
  "Military Gear",
  "Watches",
  "Cameras",
  "Cars",
  "Vinyl Records",
  "Fossils",
  "Other",
] as const;

export const CONDITIONS: Condition[] = [
  "Mint",
  "Excellent",
  "Good",
  "Fair",
  "Restoration project",
];
