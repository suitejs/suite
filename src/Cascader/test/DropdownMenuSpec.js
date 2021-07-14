import React from 'react';
import ReactTestUtils, { act } from 'react-dom/test-utils';

import { getDOMNode, getInstance } from '@test/testUtils';
import DropdownMenu from '../DropdownMenu';
import Dropdown from '../Cascader';

const items = [
  {
    value: 'abc',
    label: 'abc'
  },
  {
    value: 'abcd',
    label: 'abcd'
  },
  {
    value: 'abcde',
    label: 'abcde',
    children: [
      {
        value: 'vv-abc',
        label: 'vv-abc'
      },
      {
        value: 'vv-abcd',
        label: 'vv-abcd'
      }
    ]
  }
];

describe('Cascader -  DropdownMenu', () => {
  it('Should output a `cascader-menu-items` ', () => {
    const instance = getDOMNode(<DropdownMenu classPrefix="rs-picker-cascader-menu" />);

    assert.ok(instance.className.match(/\bcascader-menu-items\b/));
  });

  it('Should output 3 `menu-item` ', () => {
    const instance = getInstance(<Dropdown defaultOpen data={items} />);
    assert.equal(instance.overlay.querySelectorAll('li').length, 3);
  });

  it('Should have a menuWidth', () => {
    const instance = getInstance(<Dropdown defaultOpen data={items} menuWidth={100} />);

    const menuContainer = instance.overlay.querySelector('.rs-picker-cascader-menu-column');
    assert.ok(menuContainer.style.width, '100px');
  });

  it('Should output 3 `menu-item` ', () => {
    const data = [
      {
        myValue: 'abc',
        myLabel: 'abc'
      },
      {
        myValue: 'abcd',
        myLabel: 'abcd'
      },
      {
        myLabel: 'vvv',
        items: [
          {
            myValue: 'vv-abc',
            myLabel: 'vv-abc'
          },
          {
            myValue: 'vv-abcd',
            myLabel: 'vv-abcd'
          }
        ]
      }
    ];

    const instance = getInstance(
      <Dropdown defaultOpen labelKey="myLabel" valueKey="myValue" childrenKey="items" data={data} />
    );

    assert.equal(instance.overlay.querySelectorAll('li').length, 3);
  });

  it('Should call onSelect callback ', done => {
    const doneOp = node => {
      if (node.value === 'abcd') {
        done();
      }
    };

    const instance = getInstance(<Dropdown defaultOpen data={items} onSelect={doneOp} />);

    ReactTestUtils.Simulate.click(
      instance.overlay.querySelectorAll('.rs-picker-cascader-menu-item')[1]
    );
  });

  it('Should call onSelect callback 2 count', () => {
    const onSelectSpy = sinon.spy();
    const instance = getInstance(
      <Dropdown defaultOpen data={items} disabledItemValues={['abcd']} onSelect={onSelectSpy} />
    );

    act(() => {
      ReactTestUtils.Simulate.click(
        instance.overlay.querySelectorAll('.rs-picker-cascader-menu-item')[0]
      );
    });
    act(() => {
      ReactTestUtils.Simulate.click(
        instance.overlay.querySelectorAll('.rs-picker-cascader-menu-item')[2]
      );
    });
    assert.equal(onSelectSpy.callCount, 2);
  });

  it('Should not call onSelect callback on disabled item', () => {
    const onSelectSpy = sinon.spy();
    const instance = getInstance(
      <Dropdown defaultOpen data={items} disabledItemValues={['abcd']} onSelect={onSelectSpy} />
    );

    ReactTestUtils.Simulate.click(
      instance.overlay.querySelectorAll('.rs-picker-cascader-menu-item')[1]
    );
    assert.ok(onSelectSpy.notCalled);
  });

  it('Should call renderMenuItem callback ', () => {
    const instance = getInstance(
      <Dropdown defaultOpen data={items} renderMenuItem={item => <i>{item}</i>} />
    );

    assert.equal(
      instance.overlay.querySelectorAll(`${'.rs-picker-cascader-menu-item'} i`).length,
      3
    );
  });

  it('Should be disabled item ', () => {
    const instance = getInstance(
      <Dropdown defaultOpen data={items} disabledItemValues={['abcd', 'abcde']} />
    );

    assert.ok(
      instance.overlay
        .querySelectorAll('.rs-picker-cascader-menu-item')[1]
        .className.match(/\bdisabled\b/)
    );
    assert.ok(
      instance.overlay
        .querySelectorAll('.rs-picker-cascader-menu-item')[2]
        .className.match(/\bdisabled\b/)
    );
  });

  it('Should have a custom className', () => {
    const instance = getDOMNode(<DropdownMenu classPrefix="cascader" className="custom" />);
    assert.ok(instance.className.match(/\bcustom\b/));
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = getDOMNode(<DropdownMenu classPrefix="cascader" style={{ fontSize }} />);
    assert.equal(instance.style.fontSize, fontSize);
  });

  it('Should have a custom className prefix', () => {
    const instance = getDOMNode(<DropdownMenu classPrefix="custom-prefix" />);
    assert.ok(instance.className.match(/\bcustom-prefix\b/));
  });
});
