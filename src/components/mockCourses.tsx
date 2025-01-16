import { CourseList } from "../types/CourseTypes";

const courses: CourseList = {
    'AAA000': {
        name: 'placeholder',
    },
    'CST000': {
        name: 'cs',
        isCS: true,
    },
    'HSS000': {
        name: 'hss',
        isCS: true,
        isHSS: true,
    },
    'ECE318': {
        name: 'Fundamentals of Optics',
        streams: [1],
    },
    'ECE335': {
        name: 'Introduction to Electronic Devices',
        streams: [1],
        onlyF: true,
    },
    'ECE330': {
        name: 'Quantum and Semiconductor Physics',
        streams: [1],
        onlyS: true,
    },
    'ECE427': {
        name: 'Photonic Devices',
        streams: [1],
        onlyF: true,
        preq: [['ECE318', 'ECE320', 'ECE357']],
    },
    'ECE442': {
        name: 'Introduction to Micro- and Nano-Fabrication Technologies',
        streams: [1],
        onlyF: true,
        preq: [['ECE320', 'ECE357']],
    },
    'ECE469': {
        name: 'Optical Communications and Networks',
        streams: [1, 4, 5],
        onlyS: true,
    },
    'ECE314': {
        name: 'Fundamentals of Electrical Energy Systems',
        streams: [2],
        onlyF: true,
    },
    'ECE313': {
        name: 'Energy Systems and Distributed Generation',
        streams: [2],
        onlyS: true,
    },
    'ECE320': {
        name: 'Fields and Waves',
        streams: [2],
        onlyF: true,
    },
    'ECE424': {
        name: 'Microwave Circuits',
        streams: [2, 3],
        onlyF: true,
    },
    'ECE520': {
        name: 'Power Electronics',
        streams: [2],
        onlyF: true,
        preq: [['ECE314', 'ECE349', 'ECE359']],
    },
    'ECE526': {
        name: 'Power System Protection and Automation',
        streams: [2],
        onlyF: true,
        preq: [['ECE313', 'ECE314', 'ECE349']],
    },
    'ECE331': {
        name: 'Analog Electronics',
        streams: [3],
        onlyF: true,
    },
    'ECE334': {
        name: 'Digital Electronics',
        streams: [3],   
    },
    'ECE430': {
        name: 'Analog Integrated Circuits',
        streams: [3],
        onlyF: true,
        preq: [['ECE331', 'ECE354']],
    },
    'ECE446': {
        name: 'Audio, Acoustics and Sensing',
        streams: [3,4],
        onlyF: true,
    },
    'ECE311': {
        name: 'Introduction to Control Systems',
        streams: [4],
    },
    'ECE316': {
        name: 'Communication Systems',
        streams: [4],
    },
    'ECE302': {
        name: 'Probability and Applications',
        streams: [4,5],
    },
    'ECE410': {
        name: 'Linear Control Systems',
        streams: [4],
        onlyF: true,
        preq: [['ECE311']],
    },
    'ECE421': {
        name: 'Introduction to Machine Learning',
        streams: [4],
        preq: [['STA286', 'ECE302']],
    },
    'ECE431': {
        name: 'Digital Signal Processing',
        streams: [4],
        onlyF: true,
    },
    'ECE470': {
        name: 'Robot Modeling and Control',
        streams: [4],
        preq: [['ECE311', 'ECE356']],
    },
    'ECE361': {
        name: 'Co-302 Computer Networks I',
        streams: [5],
    },
    //ECE342H1S: Computer Hardware
    'ECE342': {
        name: 'Computer Hardware',
        streams: [5],
        onlyS: true,
    },
    'ECE461': {
        name: 'Internetworking',
        streams: [5],
        preq: [['ECE361']],
        onlyS: true,
    },
    'ECE537': {
        name: 'Random Processes',
        streams: [5],
        onlyF: true,
        preq: [['ECE302']],
    },
    'ECE552': {
        name: 'Computer Architecture',
        streams: [5],
        onlyF: true,
    },
    'ECE568': {
        name: 'Computer Security',
        streams: [5, 6],
        preq: [['ECE344', 'ECE353']],
    },
    'ECE344': {
        name: 'Operating Systems',
        streams: [6],
    },
    'ECE345': {
        name: 'Algorithms & Data Structures',
        streams: [6],
    },
    'APS360': {
        name: 'Applied Fundamentals of Deep Learning',
        streams: [6],
    },
    'CSC343': {
        name: 'Introduction to Databases',
        streams: [6],
        preq: [['ESC190', 'ECE345']],
    },
    'CSC384': {
        name: 'Introduction to Artificial Intelligence',
        streams: [6],
        preq: [['ECE345', 'ECE302']],
    },
    'ECE419': {
        name: 'Distributed Systems',
        streams: [6],
        onlyS: true,
        preq: [['ECE344', 'ECE353']],
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
    },
    'JRE420': {
        name: 'People Management and Organizational Behaviour',
        isCS: true,
        isHSS: true,
    },
    //MIE369H1 S Introduction to Artificial Intelligence
    'MIE369': {
        name: 'Introduction to Artificial Intelligence',
        isCS: true,
        onlyS: true,
        //MIE250H1/ECE244H1/ECE345H1/CSC263H1/CSC265H1, MIE236H1/ECE286H1/ECE302H1
        preq: [['MIE236', 'ECE286', 'ECE302']],
    },
};

export default courses;