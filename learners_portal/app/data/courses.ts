import type { courseData } from "../components/courses/types";

export const COURSES: courseData[] = [
  {
    id: 101,
    title: "Space Exploration",
    description:
      "Deep dive into the world of space exploration. Get to know the history, missions, and cutting-edge technology…",
    images: ["/assets/images/img.jpg"],
    category: ["Astronomy", "Exploration"],
    level: "Beginner",
  },
  {
    id: 102,
    title: "Planetary Science",
    description:
      "Discover how planets form, evolve, and what we’ve learned from interplanetary missions across our solar system.",
    images: ["/assets/images/learning.png"],
    category: ["Astronomy", "Science"],
    level: "Beginner",
  },
  {
    id: 103,
    title: "Satellite Engineering",
    description:
      "Design, build, and operate satellites: subsystems, orbits, payloads, comms, and mission operations.",
    images: ["/assets/images/imgg.jpg"],
    category: ["Engineering"],
    level: "Intermediate",
  },
  {
    id: 104,
    title: "Space Missions",
    description:
      "From Apollo to Artemis—mission design, launch, navigation, and surface ops that push humanity further.",
    images: ["/assets/images/img.jpg"],
    category: ["Exploration"],
    level: "Intermediate",
  },

  {
    id: 105,
    title: "Space Exploration",
    description:
      "Learn how we explore space with telescopes, probes, and human missions, past to present.",
    images: ["/assets/images/imgg.jpg"],
    category: ["Astronomy", "Exploration"],
    level: "Beginner",
  },
  {
    id: 106,
    title: "Planetary Science",
    description:
      "Mars, Venus, and icy moons—study geology, atmospheres, and the search for habitability.",
    images: ["/assets/images/learning.png"],
    category: ["Astronomy", "Science"],
    level: "Intermediate",
  },
  {
    id: 107,
    title: "Satellite Engineering",
    description:
      "Buses, ADCS, power, thermal, downlink—build robust satellites for LEO, MEO, and GEO.",
    images: ["/assets/images/img.jpg"],
    category: ["Engineering"],
    level: "Advanced",
  },
  {
    id: 108,
    title: "Space Missions",
    description:
      "Mission architectures, constraints, and timelines—from concept to de-orbit.",
    images: ["/assets/images/imgg.jpg"],
    category: ["Exploration"],
    level: "Advanced",
  },

  {
    id: 109,
    title: "Cosmology",
    description:
      "Understand the universe at the largest scales—dark matter, dark energy, and the cosmic web.",
    images: ["/assets/images/learning.png"],
    category: ["Astronomy"],
    level: "Advanced",
  },
  {
    id: 110,
    title: "Space Engineering",
    description:
      "A practical overview of systems engineering for space projects: requirements, design, and verification.",
    images: ["/assets/images/img.jpg"],
    category: ["Engineering"],
    level: "Intermediate",
  },
  {
    id: 111,
    title: "Astronomical Imaging",
    description:
      "Capture and process deep-sky images: sensors, optics, calibration, stacking, and processing workflows.",
    images: ["/assets/images/imgg.jpg"],
    category: ["Astronomy"],
    level: "Beginner",
  },
  {
    id: 112,
    title: "Human Spaceflight",
    description:
      "Life support, EVA, crew health, and spacecraft systems that enable humans to live and work in space.",
    images: ["/assets/images/learning.png"],
    category: ["Exploration"],
    level: "Intermediate",
  },
];
