import { fireEvent, render, screen } from '@testing-library/react';

import SelectWithActions from '../select-with-actions';

const items = [
  { id: '1', name: 'Ahmed' },
  { id: '2', name: 'Mahmoud' },
];

function renderOpen(extra: Partial<React.ComponentProps<typeof SelectWithActions>> = {}) {
  const setOpen = jest.fn();
  const handleSelect = jest.fn();
  const handleDelete = jest.fn();
  render(
    <SelectWithActions
      open
      setOpen={setOpen}
      items={items}
      handleSelect={handleSelect}
      handleDelete={handleDelete}
      handleLoadMore={() => {}}
      showSearch={false}
      {...extra}
    />,
  );
  return { setOpen, handleSelect, handleDelete };
}

beforeAll(() => {
  // cmdk and Radix need these browser APIs, which jsdom lacks.
  const Noop = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.ResizeObserver = Noop as unknown as typeof ResizeObserver;
  global.IntersectionObserver = Noop as unknown as typeof IntersectionObserver;
  Element.prototype.scrollIntoView = jest.fn();
});

describe('SelectWithActions', () => {
  it('closes the list after an item is picked', () => {
    const { setOpen, handleSelect } = renderOpen();
    fireEvent.click(screen.getByText('Mahmoud'));
    expect(handleSelect).toHaveBeenCalledWith('2');
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('deleting an item does not pick it', () => {
    const { setOpen, handleSelect, handleDelete } = renderOpen({ deletable: true });
    const option = screen.getByText('Ahmed').closest('[cmdk-item]') as HTMLElement;
    fireEvent.click(option.querySelector('button') as HTMLButtonElement);
    expect(handleDelete).toHaveBeenCalledWith('1');
    expect(handleSelect).not.toHaveBeenCalled();
    expect(setOpen).not.toHaveBeenCalledWith(false);
  });
});
