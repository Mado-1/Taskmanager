import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarChartByProjectComponent } from './project.component';
import { ProjectService } from '../../../core/services/project.service';
import { of } from 'rxjs';

// Mock ProjectService
const mockProjectService = {
  fetchProjects: jasmine.createSpy('fetchProjects'),
  projects: () => [],
};

describe('BarChartByProjectComponent', () => {
  let component: BarChartByProjectComponent;
  let fixture: ComponentFixture<BarChartByProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarChartByProjectComponent],
      providers: [{ provide: ProjectService, useValue: mockProjectService }],
    }).compileComponents();

    fixture = TestBed.createComponent(BarChartByProjectComponent);
    component = fixture.componentInstance;
    component.selectedUserId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadProjects without error', () => {
    // chart måste mockas för att undvika undefined
    component.chart = {
      data: {
        labels: [],
        datasets: [{ data: [] }, { data: [] }],
      },
      update: () => {},
    } as any;
    expect(() => component.loadProjects()).not.toThrow();
  });
});
