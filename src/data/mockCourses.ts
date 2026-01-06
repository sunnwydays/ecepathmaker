import { CourseList } from "../types/types";

const courses: CourseList = {
  // area 1
  ECE318: {
    name: "Fundamentals of Optics",
    streams: [1],
    kernel: true,
  },
  ECE335: {
    name: "Introduction to Electronic Devices",
    streams: [1],
    onlyF: true,
    kernel: true,
  },
  ECE427: {
    name: "Photonic Devices",
    streams: [1],
    onlyF: true,
    preq: [["ECE318", "ECE320"]],
  },
  ECE435: {
    name: "Quantum Computing Hardware",
    streams: [1, 3],
    onlyF: true,
    preq: [
      ["MIE286", "ECE302"],
      ["ECE335", "ECE350"],
      ["ECE231", "ECE360"],
      ["ECE320", "ECE357"],
    ],
  },
  ECE442: {
    name: "Introduction to Micro- and Nano-Fabrication Technologies",
    streams: [1],
    onlyF: true,
    preq: [["ECE320", "ECE357"]],
  },
  ECE330: {
    name: "Quantum and Semiconductor Physics",
    streams: [1],
    onlyS: true,
  },
  ECE437: {
    name: "VLSI Technology",
    streams: [1, 3],
    preq: [
      ["ECE331", "ECE334", "ECE354"],
      ["ECE335", "ECE350"],
    ],
    onlyS: true,
  },
  ECE469: {
    name: "Optical Communications and Networks",
    streams: [1, 4, 5],
    onlyS: true,
  },
  // area 2
  ECE314: {
    name: "Fundamentals of Electrical Energy Systems",
    streams: [2],
    onlyF: true,
    kernel: true,
  },
  ECE320: {
    name: "Fields and Waves",
    streams: [2],
    onlyF: true,
    kernel: true,
  },
  ECE313: {
    name: "Energy Systems and Distributed Generation",
    streams: [2],
    onlyS: true,
    kernel: true,
  },
  BME595: {
    name: "Medical Imaging",
    streams: [2, 4],
    onlyF: true,
  },
  ECE424: {
    name: "Microwave Circuits",
    streams: [2, 3],
    onlyF: true,
  },
  ECE520: {
    name: "Power Electronics",
    streams: [2],
    onlyF: true,
    preq: [["ECE314", "ECE315", "ECE349", "ECE359"]],
  },
  ECE526: {
    name: "Power System Protection and Automation",
    streams: [2],
    onlyF: true,
    preq: [["ECE313", "ECE314", "ECE349", "ECE359"]],
  },
  ECE422: {
    name: "Radio and Microwave Wireless Systems",
    streams: [2, 4],
    onlyS: true,
    preq: [["ECE320", "ECE357"]],
  },
  ECE463: {
    name: "Electric Drives",
    streams: [2],
    onlyS: true,
    preq: [["ECE314", "ECE315", "ECE349", "ECE359"]],
    coreq: [["ECE311", "ECE356", "AER372"]],
  },
  // area 3
  ECE331: {
    name: "Analog Electronics",
    streams: [3],
    onlyF: true,
    kernel: true,
  },
  ECE334: {
    name: "Digital Electronics",
    streams: [3],
    kernel: true,
  },
  ECE430: {
    name: "Analog Integrated Circuits",
    streams: [3],
    onlyF: true,
    preq: ["ECE331"],
  },
  ECE446: {
    name: "Audio, Acoustics and Sensing",
    streams: [3, 4],
    onlyF: true,
  },
  ECE532: {
    name: "Digital Systems Design",
    streams: [3, 5],
    onlyS: true,
    preq: [["ECE342", "ECE352"]],
  },
  // area 4
  ECE311: {
    name: "Introduction to Control Systems",
    streams: [4],
    kernel: true,
  },
  ECE316: {
    name: "Communication Systems",
    streams: [4],
    kernel: true,
  },
  BME445: {
    name: "Neural Bioelectricity",
    streams: [4],
    onlyF: true,
  },
  ECE302: {
    name: "Probability and Applications",
    streams: [4, 5],
    isSciMath: true,
  },
  ECE410: {
    name: "Linear Control Systems",
    streams: [4],
    onlyF: true,
    preq: ["ECE311"],
  },
  ECE417: {
    name: "Digital Communication",
    streams: [4],
    onlyF: true,
    preq: ["ECE302", "ECE316"],
  },
  ECE421: {
    name: "Introduction to Machine Learning",
    streams: [4],
    preq: ["ECE302"],
  },
  ECE431: {
    name: "Digital Signal Processing",
    streams: [4],
    onlyF: true,
  },
  ECE441: {
    name: "Interfacing & Modulating the Nervous System",
    streams: [4],
    onlyF: true,
    preq: ["BME331"],
  },
  ECE470: {
    name: "Robot Modeling and Control",
    streams: [4],
    preq: [["ECE311", "ECE356"]],
  },
  ECE537: {
    name: "Random Processes",
    streams: [4, 5],
    onlyF: true,
    preq: ["ECE302"],
    isSciMath: true,
  },
  BME331: {
    name: "Physiological Control Systems",
    streams: [4],
    onlyS: true,
    isSciMath: true,
  },
  ECE368: {
    name: "Probabilistic Reasoning",
    streams: [4],
    onlyS: true,
    isSciMath: true,
    preq: ["ECE302"],
  },
  ECE411: {
    name: "Adaptive Control and Reinforcement Learning",
    streams: [4],
    onlyS: true,
    preq: [["ECE311", "ECE356"]],
  },
  ECE462: {
    name: "Multimedia Systems",
    streams: [4, 5],
    onlyS: true,
  },
  ECE464: {
    name: "Wireless Communication",
    streams: [4, 5],
    onlyS: true,
    preq: ["ECE302", "ECE316", "ECE417"],
  },
  ECE516: {
    name: "Intelligent Image Processing",
    streams: [4],
    onlyS: true,
  },
  // area 5
  ECE361: {
    name: "Computer Networks I",
    streams: [5],
    kernel: true,
    coreq: ["ECE302"],
  },
  ECE342: {
    name: "Computer Hardware",
    streams: [5],
    onlyS: true,
    kernel: true,
  },
  ECE461: {
    name: "Internetworking",
    streams: [5, 6],
    preq: ["ECE361"],
    onlyS: true,
  },
  ECE552: {
    name: "Computer Architecture",
    streams: [5],
    onlyF: true,
  },
  ECE568: {
    name: "Computer Security",
    streams: [5, 6],
    preq: [["ECE344", "ECE353"]],
  },
  ECE466: {
    name: "Computer Networks II",
    streams: [5, 6],
    onlyS: true,
    preq: ["ECE361"],
  },
  // area 6
  ECE344: {
    name: "Operating Systems",
    streams: [6],
    kernel: true,
  },
  ECE345: {
    name: "Algorithms & Data Structures",
    streams: [6],
    kernel: true,
  },
  APS360: {
    name: "Applied Fundamentals of Deep Learning",
    streams: [6],
  },
  CSC317: {
    name: "Computer Graphics",
    streams: [6],
    onlyF: true,
  },
  CSC343: {
    name: "Introduction to Databases",
    streams: [6],
    preq: [["ESC190", "ECE345"]],
  },
  CSC384: {
    name: "Introduction to Artificial Intelligence",
    streams: [6],
    preq: ["ECE345", "ECE302"],
  },
  ECE326: {
    name: "Programming Languages",
    streams: [6],
    onlyF: true,
  },
  ECE444: {
    name: "Software Engineering",
    streams: [6],
    onlyF: true,
    preq: [["ECE297", "ECE344", "ECE353"]],
  },
  ECE454: {
    name: "Computer Systems Programming",
    streams: [6],
    onlyF: true,
  },
  ECE467: {
    name: "Compilers and Interpreters",
    streams: [6],
    onlyF: true,
  },
  ECE419: {
    name: "Distributed Systems",
    streams: [6],
    onlyS: true,
    preq: [["ECE344", "ECE353"]],
  },
  ECE448: {
    name: "Biocomputation",
    streams: [6],
    onlyS: true,
    isSciMath: true,
  },
  ECE484: {
    name: "Quantum Information Processing: Algorithms & Software",
    streams: [6],
    onlyS: true,
    preq: [["MIE286", "ECE302"]],
  },
  ECE472: {
    name: "Engineering Economics",
    color: "647FCA",
  },
  ECE496: {
    name: "Design Project h1 (capstone)",
    color: "647FCA",
  },
  ECE497: {
    name: "Design Project h2 not a real course (capstone)",
    color: "647FCA",
  },
  APS490: {
    name: "Multi-Disciplinary Capstone Design h1",
    color: "647FCA",
  },
  APS491: {
    name: "Multi-Disciplinary Capstone Design h2 not a real course",
    color: "647FCA",
  },
  BME498: {
    name: "Biomedical Engineering Capstone Design h1",
    color: "647FCA",
  },
  BME499: {
    name: "Biomedical Engineering Capstone Design h2 not a real course",
    color: "647FCA",
  },
  MIE369: {
    name: "Introduction to Artificial Intelligence",
    onlyS: true,
    preq: [["MIE236", "ECE302"]],
    color: "ffc2e0",
  },
  CSC413: {
    name: "Neural Networks and Deep Learning",
    preq: [["CSC311", "CSC411", "STA314", "ECE421", "ROB313"]],
    color: "ffc2e0",
  },
  JRE300: {
    name: "Fundamentals of Accounting and Finance",
    isCS: true,
  },
  JRE410: {
    name: "Markets and Competitive Strategy",
    isCS: true,
  },
  JRE420: {
    name: "People Management and Organizational Behaviour",
    isCS: true,
    isHSS: true,
  },
  TEP326: {
    name: "Special Topics in Creative Writing",
    isCS: true,
    isHSS: true,
  },
  TEP343: {
    name: "Engineering Leadership",
    isCS: true,
  },
  TEP442: {
    name: "Cognitive and Psychological Foundations of Effective Leadership",
    isCS: true,
    isHSS: true,
    onlyS: true,
  },
  TEP444: {
    name: "Positive Psychology for Engineers",
    isCS: true,
    isHSS: true,
    onlyF: true,
  },
  TEP445: {
    name: "The Power of Story: Discovering Your Leadership Narrative",
    isCS: true,
    isHSS: true,
  },
  ENT200: {
    name: "Introduction to Entrepreneurship",
    isCS: true,
    isArtSci: true,
  },
  ENV100: {
    name: "Introduction to Environmental Studies",
    isCS: true,
    isHSS: true,
    isArtSci: true,
  },
  HPS120: {
    name: "How to Think about Science",
    isCS: true,
    isHSS: true,
    isArtSci: true,
  },
  BME440: {
    name: "Biomedical Engineering Technology and Investigation",
    onlyF: true,
    isSciMath: true,
    preq: ["CHE353"],
  },
  BME455: {
    name: "Cellular and Molecular Bioengineering II",
    onlyF: true,
    isSciMath: true,
    preq: [["CHE353", "CHE354"]],
  },
  CHE353: {
    name: "Engineering Biology",
    onlyF: true,
    isSciMath: true,
  },
  CIV220: {
    name: "Urban Engineering Ecology",
    onlyF: true,
    isSciMath: true,
    preq: ["CHE112"],
  },
  CIV300: {
    name: "Terrestrial Energy Systems",
    isSciMath: true,
  },
  ECE367: {
    name: "Matrix Algebra and Optimization",
    onlyF: true,
    isSciMath: true,
  },
  ESC384: {
    name: "Partial Differential Equations",
    onlyF: true,
    isSciMath: true,
  },
  CHE354: {
    name: "Cellular and Molecular Biology",
    onlyS: true,
    isSciMath: true,
    preq: ["CHE353"],
  },
  PHY358: {
    name: "Atoms, Molecules and Solids",
    onlyS: true,
    isSciMath: true,
    preq: ["PHY356"],
  },
  PHY365: {
    name: "Quantum Information",
    onlyS: true,
    isSciMath: true,
    preq: [["PHY256", "PHY294", "CHM223", "ECE330"]],
  },
  AAA000: {
    name: "placeholder",
    color: "cccccc",
  },
  CST000: {
    name: "cs",
    isCS: true,
  },
  HSS000: {
    name: "hss",
    isCS: true,
    isHSS: true,
  },
};

export default courses;
