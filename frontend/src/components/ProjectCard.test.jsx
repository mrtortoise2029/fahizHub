import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectCard from './ProjectCard';
test('shows project information and detail link',()=>{const project={title:'CityMind',slug:'citymind',subtitle:'Urban planning',description:'A useful platform',category:'AI',technologies:['React']};render(<MemoryRouter><ProjectCard project={project}/></MemoryRouter>);expect(screen.getByRole('heading',{name:'CityMind'})).toBeInTheDocument();expect(screen.getByRole('link',{name:/view details/i})).toHaveAttribute('href','/projects/citymind')});

