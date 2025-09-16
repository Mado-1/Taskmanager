import { PriorityColorPipe } from './priority-color.pipe';

describe('PriorityColorPipe', () => {
  let pipe: PriorityColorPipe;

  beforeEach(() => {
    pipe = new PriorityColorPipe();
  });

  it('should return "red" for "High" priority', () => {
    expect(pipe.transform('High')).toBe('red');
  });

  it('should return "orange" for "Medium" priority', () => {
    expect(pipe.transform('Medium')).toBe('orange');
  });

  it('should return "green" for "Low" priority', () => {
    expect(pipe.transform('Low')).toBe('green');
  });

  it('should return "black" for unknown priority', () => {
    expect(pipe.transform('Other')).toBe('black');
  });

  it('should handle undefined gracefully', () => {
    expect(pipe.transform(undefined as any)).toBe('black');
  });
});
