export const CAUSES = [
  {
    key: "education",
    name: "Education for All",
    tagline: "Better Education, Brighter Future",
    description: "Books, school supplies and learning support so every child can keep learning.",
    goal: 500000,
    icon: "book",
  },
  {
    key: "healthcare",
    name: "Healthcare Support",
    tagline: "Health for a Healthier Tomorrow",
    description: "Medical help and essential care for families who cannot afford it.",
    goal: 600000,
    icon: "heart",
  },
  {
    key: "plantation",
    name: "Tree Plantation",
    tagline: "Greener Planet, Healthier Future",
    description: "Planting and caring for trees to build a greener neighbourhood.",
    goal: 300000,
    icon: "tree",
  },
  {
    key: "animals",
    name: "Animal Welfare",
    tagline: "For a Kinder World",
    description: "Food, shelter and care for animals that have nobody else.",
    goal: 250000,
    icon: "paw",
  },
];

export const CAUSE_NAMES = CAUSES.map((c) => c.name);

export const ASSISTANCE_TYPES = [
  "Educational Support",
  "Food Support",
  "Medical Assistance",
  "Learning Materials",
  "Essential Supplies",
  "Other",
];

export const PRIORITIES = ["High", "Medium", "Low"];
