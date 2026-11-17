import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import { Maker, Courses } from '../../utils/pageImports';
import { Layout } from '../../utils/componentImports';
import { getRow } from '../../test-utils/getRow';
import { MemoryRouter } from 'react-router-dom';

// Same strings as in Maker.test.tsx (pre-2026 layouts that carry their own streams)
const preLayouts = {
    CE: 'ECE345Algorithms & Data Structures%%6k#ffd699$$ECE344Operating Systems%%6k#ffd699$$ECE302Probability and Applications%%45m#e6b3ff$$ECE361Co-302 Computer Networks I%%5k#ffb3b3$$ECE335Introduction to Electronic Devices%%1kf#ffcc99@@ECE342Computer Hardware%%5ks#ffb3b3$$APS360Applied Fundamentals of Deep Learning%%6#ffd699@@ECE314Fundamentals of Electrical Energy Systems%%2kf#99ccff@@@@',
    EE: 'AAA000placeholder%%#cccccc$$CST000cs%%c#8faadc$$HSS000hss%%h#d4a5a5$$ECE335Introduction to Electronic Devices%%1kf#ffcc99$$ECE318Fundamentals of Optics%%1k#ffcc99@@ECE342Computer Hardware%%5ks#ffb3b3$$ECE313Energy Systems and Distributed Generation%%2ks#99ccff$$ECE472Engineering Economics%%$$@@ECE427Photonic Devices%%1f#ffcc99pECE318|ECE320|ECE357$$ECE424Microwave Circuits%%23f#99ccff$$ECE526Power System Protection and Automation%%2f#99ccffpECE313|ECE314|ECE349$$BME498Biomedical Engineering Capstone Design h1%%$$@@ECE345Algorithms & Data Structures%%6k#ffd699$$ECE469Optical Communications and Networks%%145s#ffcc99$$BME499Biomedical Engineering Capstone Design h2 not a real course%%$$@@ECE419Distributed Systems%%6s#ffd699pECE344|ECE353$$',
};

// A complete Electrical plan under the 2026 rules, 19 of the 20 slots in 3F-4S.
// Group membership comes from the curriculum by course code, so the courses
// only carry names and flags (f/s term, m sci/math, c CS, h HSS).
//   Breadth: ECE314, ECE331, ECE313 (A kernels) + ECE311 (B kernel)
//   Depth:   ECE330, ECE422 (A) + ECE410, ECE421 (B)
//   Tech electives: ECE334, ECE326, ECE342 (group C)
//   Sci/Math: ECE367. Economics: ECE472. Capstone: ECE496 (4F) + ECE497 (4S).
//   CS: CST000, CST001, HSS000, HSS001 (2 of them HSS)
const elePlan = [
    // 3F
    'ECE314Fundamentals of Electrical Energy Systems%%f',
    'ECE331Analog Electronics%%f',
    'ECE410Linear Control Systems%%f',
    'ECE367Matrix Algebra and Optimization%%fm',
    'CST000Complementary Study%%c',
].join('$$') + '@@' + [
    // 3S
    'ECE313Energy Systems and Distributed Generation%%s',
    'ECE330Quantum and Semiconductor Physics%%s',
    'ECE311Introduction to Control Systems%%',
    'ECE342Computer Hardware%%s',
    'HSS000Humanities%%h',
].join('$$') + '@@' + [
    // 4F
    'ECE326Programming Languages%%f',
    'ECE421Introduction to Machine Learning%%',
    'ECE334Digital Electronics%%',
    'ECE472Engineering Economics%%',
    'ECE496Design Project h1%%',
].join('$$') + '@@' + [
    // 4S
    'ECE422Radio and Microwave Wireless Systems%%s',
    'CST001Complementary Study 2%%c',
    'HSS001Humanities 2%%h',
    'ECE497Design Project h2%%',
].join('$$');

const renderMaker = () =>
    render(
        <MemoryRouter><Layout>
            <Maker />
        </Layout></MemoryRouter>
    );

const pick = (id: string) =>
    fireEvent.change(screen.getByTestId('curriculum-picker'), { target: { value: id } });

const loadString = (str: string) => {
    fireEvent.change(screen.getByPlaceholderText('Layout string'), { target: { value: str } });
    fireEvent.click(screen.getByTestId('load-layout'));
};

describe('Curriculum picker on the Maker page', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('defaults to the pre-2026 curriculum with the six streams', () => {
        renderMaker();
        expect(screen.getByTestId('curriculum-picker')).toHaveValue('ece-pre2026');
        [1, 2, 3, 4, 5, 6].forEach((n) => {
            expect(screen.getByTestId(`filter-stream-${n}`)).toBeInTheDocument();
        });
        expect(getRow(/^CE\/EE:/)).toBeInTheDocument();
        expect(screen.queryByLabelText(/^Program:/)).not.toBeInTheDocument();
    });

    it('lists every curriculum as an option', () => {
        renderMaker();
        const options = within(screen.getByTestId('curriculum-picker')).getAllByRole('option');
        expect(options.map((o) => o.textContent)).toEqual([
            'Admitted before Fall 2026 (6 areas)',
            'Admitted Fall 2026+ · Electrical',
            'Admitted Fall 2026+ · Computer',
        ]);
    });

    it('switches filters and program, saves the choice, and restores it on a fresh render', () => {
        renderMaker();
        pick('ele-2026');

        ['A', 'B', 'C'].forEach((id) => {
            expect(screen.getByTestId(`filter-stream-${id}`)).toBeInTheDocument();
        });
        [1, 2, 3, 4, 5, 6].forEach((n) => {
            expect(screen.queryByTestId(`filter-stream-${n}`)).not.toBeInTheDocument();
        });
        expect(getRow(/^Program: EE 🔌$/)).toBeInTheDocument();
        expect(screen.queryByText(/CE\/EE:/)).not.toBeInTheDocument();
        expect(localStorage.getItem('curriculum')).toBe('ele-2026');

        cleanup();
        renderMaker();
        expect(screen.getByTestId('curriculum-picker')).toHaveValue('ele-2026');
        expect(screen.getByTestId('filter-stream-A')).toBeInTheDocument();

        pick('cpe-2026');
        expect(getRow(/^Program: CE 🖥$/)).toBeInTheDocument();
        expect(localStorage.getItem('curriculum')).toBe('cpe-2026');
    });

    it('falls back to the default curriculum for an invalid stored value', () => {
        localStorage.setItem('curriculum', 'not-a-curriculum');
        renderMaker();
        expect(screen.getByTestId('curriculum-picker')).toHaveValue('ece-pre2026');
        expect(screen.getByTestId('filter-stream-1')).toBeInTheDocument();
        expect(localStorage.getItem('curriculum')).toBe('ece-pre2026');
    });

    it('clears the stream filters when the curriculum changes', () => {
        renderMaker();
        fireEvent.click(screen.getByTestId('filter-stream-5'));
        expect(screen.getByTestId('filter-stream-5')).toBeChecked();

        pick('ele-2026');
        fireEvent.click(screen.getByTestId('filter-stream-B'));
        expect(screen.getByTestId('filter-stream-B')).toBeChecked();
        pick('ece-pre2026');
        expect(screen.getByTestId('filter-stream-5')).not.toBeChecked();
        pick('ele-2026');
        expect(screen.getByTestId('filter-stream-B')).not.toBeChecked();
    });

    it('graduates a complete Electrical plan under ele-2026 but not under cpe-2026', () => {
        renderMaker();
        pick('ele-2026');
        loadString(elePlan);

        expect(screen.getByText(/You graduate/)).toBeInTheDocument();
        expect(getRow(/Breadth: ✅ \(4\/4\)/)).toBeInTheDocument();
        expect(getRow(/Depth: ✅ \(4\/4\)/)).toBeInTheDocument();
        expect(getRow(/Technical electives: ✅ \(3\/3\)/)).toBeInTheDocument();
        expect(getRow(/Sci\/Math: ✅/)).toBeInTheDocument();

        pick('cpe-2026');
        expect(screen.getByText(/You are not graduating with this one/)).toBeInTheDocument();
        expect(getRow(/Breadth: ❌ \(3\/4\)/)).toBeInTheDocument();
        expect(getRow(/Depth: ❌/)).toBeInTheDocument();
    });

    it('shows the 2026 known-concerns text and group chart under a 2026 curriculum', () => {
        renderMaker();
        pick('ele-2026');
        loadString(elePlan);
        expect(screen.getByText(/Custom courses placed in a group are not checked against the calendar's lists$/)).toBeInTheDocument();
        expect(screen.queryByText(/A course in multiple streams/)).not.toBeInTheDocument();
        expect(screen.queryByText(/No courses in any stream yet/)).not.toBeInTheDocument();
    });

    it('keeps the pre-2026 CE and EE results after switching away and back', () => {
        renderMaker();
        loadString(preLayouts.CE);
        expect(screen.getByText(/CE 🖥/)).toBeInTheDocument();

        pick('ele-2026');
        expect(screen.queryByText(/CE\/EE:/)).not.toBeInTheDocument();
        pick('ece-pre2026');
        expect(screen.getByText(/CE 🖥/)).toBeInTheDocument();

        loadString(preLayouts.EE);
        pick('cpe-2026');
        pick('ece-pre2026');
        expect(screen.getByText(/EE 🔌/)).toBeInTheDocument();
    });

    it('labels and colours cards by group under a 2026 curriculum', () => {
        renderMaker();
        const bucket = screen.getByTestId('bucket');
        const card335 = () => within(bucket).getByText('ECE335').closest('article') as HTMLElement;

        // Pre-2026: area 1 kernel
        expect(within(card335()).getByText('Stream: 1 (k)')).toBeInTheDocument();
        expect(card335()).toHaveStyle({ backgroundColor: '#fa7274' });

        pick('ele-2026');
        expect(within(card335()).getByText('Stream: A (k)')).toBeInTheDocument();
        expect(card335()).toHaveStyle({ backgroundColor: '#fa7274' });

        // Group B and C colours
        const card302 = within(bucket).getByText('ECE302').closest('article') as HTMLElement;
        expect(within(card302).getByText('Stream: B (k)')).toBeInTheDocument();
        expect(card302).toHaveStyle({ backgroundColor: '#79d675' });
        const card334 = within(bucket).getByText('ECE334').closest('article') as HTMLElement;
        expect(card334).toHaveStyle({ backgroundColor: '#ffdd46' });
    });

    it('filters the bucket by group', () => {
        renderMaker();
        pick('ele-2026');
        fireEvent.click(screen.getByTestId('filter-stream-A'));
        const bucket = screen.getByTestId('bucket');
        expect(within(bucket).getByText('ECE335')).toBeInTheDocument();
        expect(within(bucket).queryByText('ECE302')).not.toBeInTheDocument();
    });

    it('hides the stream checkboxes in the course form under a 2026 curriculum', () => {
        renderMaker();
        expect(screen.getByTestId('stream-1')).toBeInTheDocument();
        pick('cpe-2026');
        expect(screen.queryByTestId('stream-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('group-A')).toBeInTheDocument();
        expect(screen.getByTestId('group-none')).toBeChecked();
    });
});

describe('Custom courses with a group', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    const addCustom = (code: string, groupTestId?: string) => {
        fireEvent.change(screen.getByTestId('code-input'), { target: { value: code } });
        fireEvent.change(screen.getByPlaceholderText('Course Name'), { target: { value: 'Custom thing' } });
        if (groupTestId) fireEvent.click(screen.getByTestId(groupTestId));
        fireEvent.click(screen.getByText('Add/Update Course'));
    };

    it('adds a Group B course through the form, labelled, coloured and filterable', () => {
        renderMaker();
        pick('ele-2026');
        addCustom('XYZ123', 'group-B');

        const bucket = screen.getByTestId('bucket');
        const card = () => within(bucket).getByText('XYZ123').closest('article') as HTMLElement;
        expect(within(card()).getByText('Stream: B')).toBeInTheDocument();
        expect(card()).toHaveStyle({ backgroundColor: '#79d675' });

        fireEvent.click(screen.getByTestId('filter-stream-B'));
        expect(within(bucket).getByText('XYZ123')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('filter-stream-B'));
        fireEvent.click(screen.getByTestId('filter-stream-A'));
        expect(within(bucket).queryByText('XYZ123')).not.toBeInTheDocument();
    });

    it('a course with no group chosen has no label', () => {
        renderMaker();
        pick('ele-2026');
        addCustom('XYZ124');
        const card = within(screen.getByTestId('bucket')).getByText('XYZ124').closest('article') as HTMLElement;
        expect(within(card).queryByText(/Stream:/)).not.toBeInTheDocument();
    });

    it('a placed custom course counts toward the technical electives', () => {
        renderMaker();
        pick('ele-2026');
        // elePlan with ECE342 (a technical elective) replaced by a custom Group B course
        loadString(elePlan.replace('ECE342Computer Hardware%%s', 'XYZ123Custom%%sB'));
        expect(getRow(/Technical electives: ✅ \(3\/3\)/)).toBeInTheDocument();

        // Without the group the same course no longer counts
        loadString(elePlan.replace('ECE342Computer Hardware%%s', 'XYZ123Custom%%s'));
        expect(getRow(/Technical electives: ❌ \(2\/3\)/)).toBeInTheDocument();
    });

    it('streams come back after switching to the pre-2026 curriculum, and the group is ignored', () => {
        renderMaker();
        pick('ele-2026');
        addCustom('XYZ123', 'group-B');
        pick('ece-pre2026');
        expect(screen.getByTestId('stream-1')).toBeInTheDocument();
        expect(screen.queryByTestId('group-B')).not.toBeInTheDocument();
        const card = within(screen.getByTestId('bucket')).getByText('XYZ123').closest('article') as HTMLElement;
        expect(within(card).queryByText(/Stream:/)).not.toBeInTheDocument();
    });

    it('shows the calendar group read-only for an official course code', () => {
        renderMaker();
        pick('ele-2026');
        fireEvent.change(screen.getByTestId('code-input'), { target: { value: 'ECE335' } });
        expect(screen.getByText('Group A (set by the calendar)')).toBeInTheDocument();
        expect(screen.queryByTestId('group-B')).not.toBeInTheDocument();
    });
});

describe('Curriculum picker on the Courses page', () => {
    beforeEach(() => {
        localStorage.clear();
        render(
            <MemoryRouter>
                <Layout>
                    <Courses />
                </Layout>
            </MemoryRouter>
        );
    });

    it('switches the curriculum and filters by group B', () => {
        expect(screen.getByTestId('curriculum-picker')).toHaveValue('ece-pre2026');
        pick('ele-2026');
        expect(screen.getByTestId('filter-stream-A')).toBeInTheDocument();
        expect(screen.queryByTestId('filter-stream-1')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('filter-stream-B'));
        const codes = screen.getAllByTestId('course-row').map((el) => el.getAttribute('data-code'));
        expect(codes).toContain('ECE302');
        expect(codes).toContain('ECE381');
        expect(codes).not.toContain('ECE335');
        expect(codes).not.toContain('ECE334');

        // Rows show the group label, and the stream filter is cleared on switching back
        expect(screen.getAllByText('B (k)').length).toBeGreaterThan(0);
        pick('ece-pre2026');
        expect(screen.queryByTestId('filter-stream-B')).not.toBeInTheDocument();
        [1, 2, 3, 4, 5, 6].forEach((n) => {
            expect(screen.getByTestId(`filter-stream-${n}`)).not.toBeChecked();
        });
        expect(screen.getAllByTestId('course-row').map((el) => el.getAttribute('data-code'))).toContain('ECE335');
    });
});
