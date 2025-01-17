import { CourseList } from "../types/CourseTypes";

const courses: CourseList = {
    'AAA000': {
        name: 'placeholder',
        color: 'cccccc',
    },
    'CST000': {
        name: 'cs',
        isCS: true,
        color: '8faadc', // Light Blue for CS
    },
    'HSS000': {
        name: 'hss',
        isCS: true,
        isHSS: true,
        color: 'd4a5a5', // Light Red for HSS
    },
    'ECE318': {
        name: 'Fundamentals of Optics',
        streams: [1],
        color: 'ffcc99', // Peach for Stream 1
    },
    'ECE335': {
        name: 'Introduction to Electronic Devices',
        streams: [1],
        onlyF: true,
        color: 'ffcc99',
    },
    'ECE330': {
        name: 'Quantum and Semiconductor Physics',
        streams: [1],
        onlyS: true,
        color: 'ffcc99',
        isSciMath: true,
    },
    'ECE427': {
        name: 'Photonic Devices',
        streams: [1],
        onlyF: true,
        preq: [['ECE318', 'ECE320', 'ECE357']],
        color: 'ffcc99',
    },
    'ECE442': {
        name: 'Introduction to Micro- and Nano-Fabrication Technologies',
        streams: [1],
        onlyF: true,
        preq: [['ECE320', 'ECE357']],
        color: 'ffcc99',
    },
    'ECE469': {
        name: 'Optical Communications and Networks',
        streams: [1, 4, 5],
        onlyS: true,
        color: 'ffcc99',
    },
    'ECE314': {
        name: 'Fundamentals of Electrical Energy Systems',
        streams: [2],
        onlyF: true,
        color: '99ccff', // Light Blue for Stream 2
    },
    'ECE313': {
        name: 'Energy Systems and Distributed Generation',
        streams: [2],
        onlyS: true,
        color: '99ccff',
    },
    'ECE320': {
        name: 'Fields and Waves',
        streams: [2],
        onlyF: true,
        color: '99ccff',
    },
    'ECE424': {
        name: 'Microwave Circuits',
        streams: [2, 3],
        onlyF: true,
        color: '99ccff',
    },
    'ECE520': {
        name: 'Power Electronics',
        streams: [2],
        onlyF: true,
        preq: [['ECE314', 'ECE349', 'ECE359']],
        color: '99ccff',
    },
    'ECE526': {
        name: 'Power System Protection and Automation',
        streams: [2],
        onlyF: true,
        preq: [['ECE313', 'ECE314', 'ECE349']],
        color: '99ccff',
    },
    'ECE331': {
        name: 'Analog Electronics',
        streams: [3],
        onlyF: true,
        color: 'b3e6b3', // Light Green for Stream 3
    },
    'ECE334': {
        name: 'Digital Electronics',
        streams: [3],
        color: 'b3e6b3',
    },
    'ECE430': {
        name: 'Analog Integrated Circuits',
        streams: [3],
        onlyF: true,
        preq: [['ECE331', 'ECE354']],
        color: 'b3e6b3',
    },
    'ECE446': {
        name: 'Audio, Acoustics and Sensing',
        streams: [3, 4],
        onlyF: true,
        color: 'b3e6b3',
    },
    'ECE311': {
        name: 'Introduction to Control Systems',
        streams: [4],
        color: 'e6b3ff', // Light Purple for Stream 4
    },
    'ECE316': {
        name: 'Communication Systems',
        streams: [4],
        color: 'e6b3ff',
    },
    'ECE302': {
        name: 'Probability and Applications',
        streams: [4, 5],
        color: 'e6b3ff',
        isSciMath: true,
    },
    'ECE410': {
        name: 'Linear Control Systems',
        streams: [4],
        onlyF: true,
        preq: [['ECE311']],
        color: 'e6b3ff',
    },
    'ECE421': {
        name: 'Introduction to Machine Learning',
        streams: [4],
        preq: [['STA286', 'ECE302']],
        color: 'e6b3ff',
    },
    'ECE431': {
        name: 'Digital Signal Processing',
        streams: [4],
        onlyF: true,
        color: 'e6b3ff',
    },
    'ECE470': {
        name: 'Robot Modeling and Control',
        streams: [4],
        preq: [['ECE311', 'ECE356']],
        color: 'e6b3ff',
    },
    'ECE361': {
        name: 'Co-302 Computer Networks I',
        streams: [5],
        color: 'ffb3b3', // Light Red for Stream 5
    },
    'ECE342': {
        name: 'Computer Hardware',
        streams: [5],
        onlyS: true,
        color: 'ffb3b3',
    },
    'ECE461': {
        name: 'Internetworking',
        streams: [5],
        preq: [['ECE361']],
        onlyS: true,
        color: 'ffb3b3',
    },
    'ECE537': {
        name: 'Random Processes',
        streams: [5],
        onlyF: true,
        preq: [['ECE302']],
        color: 'ffb3b3',
        isSciMath: true,
    },
    'ECE552': {
        name: 'Computer Architecture',
        streams: [5],
        onlyF: true,
        color: 'ffb3b3',
    },
    'ECE568': {
        name: 'Computer Security',
        streams: [5, 6],
        preq: [['ECE344', 'ECE353']],
        color: 'ffb3b3',
    },
    'ECE344': {
        name: 'Operating Systems',
        streams: [6],
        color: 'ffd699', // Light Orange for Stream 6
    },
    'ECE345': {
        name: 'Algorithms & Data Structures',
        streams: [6],
        color: 'ffd699',
    },
    'APS360': {
        name: 'Applied Fundamentals of Deep Learning',
        streams: [6],
        color: 'ffd699',
    },
    'CSC343': {
        name: 'Introduction to Databases',
        streams: [6],
        preq: [['ESC190', 'ECE345']],
        color: 'ffd699',
    },
    'CSC384': {
        name: 'Introduction to Artificial Intelligence',
        streams: [6],
        preq: [['ECE345', 'ECE302']],
        color: 'ffd699',
    },
    'ECE419': {
        name: 'Distributed Systems',
        streams: [6],
        onlyS: true,
        preq: [['ECE344', 'ECE353']],
        color: 'ffd699',
    },
    'ECE472': {
        name: 'Engineering Economics',
    },
    'ECE496': {
        name: 'Design Project h1',
    },
    'ECE497': {
        name: 'Design Project h2 not a real course',
    },
    'APS490': {
        name: 'Multi-Disciplinary Capstone Design h1',
    },
    'APS491': {
        name: 'Multi-Disciplinary Capstone Design h2 not a real course',
    },
    'BME498': {
        name: 'Biomedical Engineering Capstone Design h1',
    },
    'BME499': {
        name: 'Biomedical Engineering Capstone Design h2 not a real course',
    },
    'JRE410': {
        name: 'Markets and Competitive Strategy',
        isCS: true,
        color: '8faadc',
    },
    'JRE420': {
        name: 'People Management and Organizational Behaviour',
        isCS: true,
        isHSS: true,
        color: 'd4a5a5',
    },
    'HPS120': {
        name: 'How to Think about Science',
        isCS: true,
        isHSS: true,
        isArtSci: true,
        color: 'd4a5a5',
    },
    'MIE369': {
        name: 'Introduction to Artificial Intelligence',
        onlyS: true,
        preq: [['MIE236', 'ECE286', 'ECE302']],
        color: 'ffc2e0',
    },
    'BME440': {
        name: 'Biomedical Engineering Technology and Investigation',
        onlyF: true,
        color: 'bdad04',
        isSciMath: true,
        preq: ['CHE353'],
    },
    'BME455': {
        name: 'Cellular and Molecular Bioengineering II',
        onlyF: true,
        color: 'bdad04',
        isSciMath: true,
        preq: [['CHE353', 'CHE354']],
    },
    'CHE353': {
        name: 'Engineering Biology',
        onlyF: true,
        color: 'bdad04',
        isSciMath: true,
    },
    'CIV220': {
        name: 'Urban Engineering Ecology',
        onlyF: true,
        color: 'bdad04',
        isSciMath: true,
        preq: ['CHE112H1'],
    },
    'CIV300': {
        name: 'Terrestrial Energy Systems',
        color: 'bdad04',
        isSciMath: true,
    },
    'ECE367': {
        name: 'Matrix Algebra and Optimization',
        onlyF: true,
        color: 'bdad04',
        isSciMath: true,
    },
    'ESC384': {
        name: 'Partial Differential Equations',
        onlyF: true,
        color: 'bdad04',
        isSciMath: true,
    },
    'BME331': {
        name: 'Physiological Control Systems',
        streams: [4],
        onlyS: true,
        color: 'e6b3ff',
        isSciMath: true,
    },
    'CHE354': {
        name: 'Cellular and Molecular Biology',
        onlyS: true,
        color: 'bdad04',
        isSciMath: true,
        preq: ['CHE353'],
    },
    'ECE368': {
        name: 'Probabilistic Reasoning',
        streams: [4],
        onlyS: true,
        color: 'e6b3ff',
        isSciMath: true,
        preq: [['STA286', 'ECE302']],
    },
    'ECE448': {
        name: 'Biocomputation',
        streams: [6],
        onlyS: true,
        color: 'ffd699',
        isSciMath: true,
    },
    'PHY358': {
        name: 'Atoms, Molecules and Solids',
        onlyS: true,
        color: 'bdad04',
        isSciMath: true,
        preq: ['PHY356'],
    },
    'PHY365': {
        name: 'Quantum Information',
        onlyS: true,
        color: 'bdad04',
        isSciMath: true,
        preq: [['PHY256', 'PHY294', 'CHM223', 'ECE330']],
    },
};

export default courses;
