import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarChartTaskComponent } from './bar-chart-task.component';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';

// Mock services
const mockTaskService = {
  fetchTasks: jasmine.createSpy('fetchTasks'),
  tasks: () => [],
};
const mockProjectService = {
  fetchProjects: jasmine.createSpy('fetchProjects'),
  projects: () => [],
};

describe('BarChartTaskComponent', () => {
  let component: BarChartTaskComponent;
  let fixture: ComponentFixture<BarChartTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarChartTaskComponent],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: ProjectService, useValue: mockProjectService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BarChartTaskComponent);
    component = fixture.componentInstance;
    component.selectedUserId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should call ngOnDestroy without error', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
