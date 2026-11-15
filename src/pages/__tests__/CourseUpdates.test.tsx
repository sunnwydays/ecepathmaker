import { render, screen, within } from '@testing-library/react';
import { Maker } from '../../utils/pageImports';
import { Layout } from '../../utils/componentImports';
import mockCourses from '../../data/mockCourses';
import { COURSE_DATA_VERSION } from '../../data/courseUpdates';

const renderMaker = () =>
    render(
        <Layout>
            <Maker />
        </Layout>
    );

const seedWithoutECE381 = (version?: number) => {
    const { ECE381: _removed, ...rest } = mockCourses;
    void _removed;
    localStorage.setItem('courses', JSON.stringify(rest));
    if (version !== undefined) localStorage.setItem('coursesVersion', String(version));
};

describe('course list updates', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('adds missing default courses for a user with no stored version', () => {
        seedWithoutECE381();
        renderMaker();
        const bucket = screen.getByTestId('bucket');
        expect(within(bucket).getByText(/ECE381/)).toBeInTheDocument();
        expect(localStorage.getItem('coursesVersion')).toBe(String(COURSE_DATA_VERSION));
    });

    it('does not bring back a deleted course for an up to date user', () => {
        seedWithoutECE381(COURSE_DATA_VERSION);
        renderMaker();
        const bucket = screen.getByTestId('bucket');
        expect(within(bucket).queryByText(/ECE381/)).not.toBeInTheDocument();
    });

    it('writes the current version on first run', () => {
        renderMaker();
        expect(localStorage.getItem('coursesVersion')).toBe(String(COURSE_DATA_VERSION));
    });
});
