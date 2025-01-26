import { render, screen, fireEvent } from '@testing-library/react';
import Maker from '../Maker';

const mockCourse = {
    code: 'ECe456',
    name: 'Test Course',
    preq: ['ECE345'],
    stream1: true,
    onlyF: true,
    isCS: true,
};

describe('Maker', () => {
    beforeEach(() => {
        // Render the Maker component before each test
        render(<Maker />);
    });

    it('adds custom courses to the course list', () => {
        // Simulate user input
        const codeInput = screen.getByTestId('code-input')
        fireEvent.change(codeInput, { target: { value: mockCourse.code } });

        const nameInput = screen.getByPlaceholderText('Course Name');
        fireEvent.change(nameInput, { target: { value: mockCourse.name } });

        const preqInput = screen.getByTestId('preq-input');
        fireEvent.change(preqInput, { target: { value: mockCourse.preq.join(',') } });

        const stream1Select = screen.getByTestId('stream-1');
        fireEvent.click(stream1Select);

        const onlyFSelect = screen.getByTestId('only-f');
        fireEvent.click(onlyFSelect);

        const csSelect = screen.getByTestId('cs');
        fireEvent.click(csSelect);

        // Submit the form
        const form = screen.getByTestId('course-form');
        fireEvent.submit(form);

        expect(screen.getByText(/ECE456/)).toBeInTheDocument();
        expect(screen.getByText(/Test Course/)).toBeInTheDocument();
        // expect(screen.getByText(/ECE345/)).toBeInTheDocument();
        // expect(screen.getByText(/\(F\)/)).toBeInTheDocument();
    });

    // implicitly tests that string input is parsed correctly
    it('evaluates computer engineering based on streams', () => {
        const stringInput = screen.getByTestId('string-input');
        fireEvent.change(stringInput, { target: { value: 'ECE345Algorithms & Data Structures%%6k#ffd699$$ECE344Operating Systems%%6k#ffd699$$ECE302Probability and Applications%%45m#e6b3ff$$ECE361Co-302 Computer Networks I%%5k#ffb3b3$$ECE335Introduction to Electronic Devices%%1kf#ffcc99@@ECE342Computer Hardware%%5ks#ffb3b3$$APS360Applied Fundamentals of Deep Learning%%6#ffd699@@ECE314Fundamentals of Electrical Energy Systems%%2kf#99ccff@@@@' } });
        const submitButton = screen.getByTestId('load-layout');
        fireEvent.click(submitButton);

        expect(screen.getByText(/CE 🖥/)).toBeInTheDocument();
    });
    
    it('evaluates electrical engineering based on streams', () => {
        const stringInput = screen.getByTestId('string-input');
        fireEvent.change(stringInput, { target: { value: 'AAA000placeholder%%#cccccc$$CST000cs%%c#8faadc$$HSS000hss%%h#d4a5a5$$ECE335Introduction to Electronic Devices%%1kf#ffcc99$$ECE318Fundamentals of Optics%%1k#ffcc99@@ECE342Computer Hardware%%5ks#ffb3b3$$ECE313Energy Systems and Distributed Generation%%2ks#99ccff$$ECE472Engineering Economics%%$$@@ECE427Photonic Devices%%1f#ffcc99pECE318|ECE320|ECE357$$ECE424Microwave Circuits%%23f#99ccff$$ECE526Power System Protection and Automation%%2f#99ccffpECE313|ECE314|ECE349$$BME498Biomedical Engineering Capstone Design h1%%$$@@ECE345Algorithms & Data Structures%%6k#ffd699$$ECE469Optical Communications and Networks%%145s#ffcc99$$BME499Biomedical Engineering Capstone Design h2 not a real course%%$$@@ECE419Distributed Systems%%6s#ffd699pECE344|ECE353$$' } });
        const submitButton = screen.getByTestId('load-layout');
        fireEvent.click(submitButton);
        
        expect(screen.getByText(/EE 🔌/)).toBeInTheDocument();
    });

    it('evaluates computer or electrical engineering based on streams', () => {
        const stringInput = screen.getByTestId('string-input');
        fireEvent.change(stringInput, { target: { value: 'ECE334Digital Electronics%%3k#b3e6b3$$ECE344Operating Systems%%6k#ffd699$$ECE345Algorithms & Data Structures%%6k#ffd699$$ECE552Computer Architecture%%5f#ffb3b3$$ECE302Probability and Applications%%45m#e6b3ff@@ECE472Engineering Economics%%#091f7d$$ECE342Computer Hardware%%5ks#ffb3b3$$ECE568Computer Security%%56#ffb3b3pECE344|ECE353$$APS511Inventions and Patents for Engineers%%sc#a89c64$$CSC384Introduction to Artificial Intelligence%%6#ffd699pECE345,ECE302@@ECE496Design Project h1 (capstone)%%#091f7d$$CSC343Introduction to Databases%%6#ffd699pESC190|ECE345$$ECE444Software Engineering%%6f#ffd699pECE297|ECE344|ECE353$$ECE335Introduction to Electronic Devices%%1kf#ffcc99$$JRE410Markets and Competitive Strategy%%c#a89c64@@ECE497Design Project h2 not a real course (capstone)%%#091f7d$$ECE330Quantum and Semiconductor Physics%%1sm#ffcc99$$ECE532Digital Systems Design%%35s#b3e6b3pECE342|ECE352$$ECE437VLSI Technology%%13s#ffcc99pECE331|ECE334|ECE354,ECE335|ECE350$$JRE420People Management and Organizational Behaviour%%h#d4a5a5@@TEP444Positive Psychology for Engineers%%fh#d4a5a5' } });
        const submitButton = screen.getByTestId('load-layout');
        fireEvent.click(submitButton);
        
        expect(screen.getByText(/CE or EE/)).toBeInTheDocument();
    });

    it('evaluates basic requirements', () => {
        const stringInput = screen.getByTestId('string-input');
        fireEvent.change(stringInput, { target: { value: 'AAA000placeholder%%#cccccc$$CST000cs%%c#8faadc$$HSS000hss%%h#d4a5a5$$ECE335Introduction to Electronic Devices%%1kf#ffcc99$$ECE318Fundamentals of Optics%%1k#ffcc99@@ECE342Computer Hardware%%5ks#ffb3b3$$ECE313Energy Systems and Distributed Generation%%2ks#99ccff$$ECE472Engineering Economics%%$$@@ECE427Photonic Devices%%1f#ffcc99pECE318|ECE320|ECE357$$ECE424Microwave Circuits%%23f#99ccff$$ECE526Power System Protection and Automation%%2f#99ccffpECE313|ECE314|ECE349$$BME498Biomedical Engineering Capstone Design h1%%$$@@ECE345Algorithms & Data Structures%%6k#ffd699$$ECE469Optical Communications and Networks%%145s#ffcc99$$BME499Biomedical Engineering Capstone Design h2 not a real course%%$$@@ECE419Distributed Systems%%6s#ffd699pECE344|ECE353$$' } });
        const submitButton = screen.getByTestId('load-layout');
        fireEvent.click(submitButton);
        
        expect(screen.getByText(/You are not graduating with this one/)).toBeInTheDocument();
        expect(screen.getByText(/CS: ❌/)).toBeInTheDocument();
        expect(screen.getByText(/Sci\/Math: ❌/)).toBeInTheDocument();
        expect(screen.getByText(/Capstone: ✅/)).toBeInTheDocument();
        expect(screen.getByText(/Economics: ✅/)).toBeInTheDocument();
    });
    
    it('evaluates successful graduation', () => {
        const stringInput = screen.getByTestId('string-input');
        fireEvent.change(stringInput, { target: { value: 'ECE331Analog Electronics%%3kf#b3e6b3$$ECE335Introduction to Electronic Devices%%1kf#ffcc99$$ECE302Probability and Applications%%45m#e6b3ff$$ECE361Co-302 Computer Networks I%%5k#ffb3b3$$CST000cs%%c#8faadc@@ECE469Optical Communications and Networks%%145s#ffcc99$$ECE344Operating Systems%%6k#ffd699$$ECE334Digital Electronics%%3k#b3e6b3$$ECE472Engineering Economics%%$$JRE410Markets and Competitive Strategy%%c#8faadc@@ECE446Audio, Acoustics and Sensing%%34f#b3e6b3$$ECE568Computer Security%%56#ffb3b3pECE344|ECE353$$ECE496Design Project h1%%$$HPS120How to Think about Science%%ha#d4a5a5$$@@ECE448Biocomputation%%6sm#ffd699$$ECE419Distributed Systems%%6s#ffd699pECE344|ECE353$$MIE369Introduction to Artificial Intelligence%%s#ffc2e0pMIE236|ECE286|ECE302$$ECE497Design Project h2 not a real course%%$$JRE420People Management and Organizational Behaviour%%h#d4a5a5@@' } });
        const submitButton = screen.getByTestId('load-layout');
        fireEvent.click(submitButton);
        expect(screen.getByText(/You graduate/)).toBeInTheDocument();
        expect(screen.getByText(/CE /)).toBeInTheDocument();
        expect(stringInput).toHaveValue('');
    });
    
    it('prevents invalid layouts from being loaded', () => {
        const stringInput = screen.getByTestId('string-input');
        fireEvent.change(stringInput, { target: { value: 'something@@' } });
        const submitButton = screen.getByPlaceholderText('Layout string');
        fireEvent.click(submitButton);
        expect(screen.getByText(/No courses in any stream yet/)).toBeInTheDocument();
        expect(stringInput).toHaveValue('something@@');
    });
});
