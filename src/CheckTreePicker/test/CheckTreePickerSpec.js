import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { getDOMNode, getInstance } from '@test/testUtils';
import CheckTreePicker from '../CheckTreePicker';
import { KEY_VALUES } from '../../utils';
import { assert } from 'chai';

const itemFocusClassName = '.rs-check-tree-node-focus';
const itemExpandedClassName = '.rs-check-tree-node-expanded';

const data = [
  {
    label: 'Master',
    value: 'Master',
    children: [
      {
        label: 'tester0',
        value: 'tester0'
      },
      {
        label: 'tester1',
        value: 'tester1',
        children: [
          {
            label: 'tester2',
            value: 'tester2'
          }
        ]
      }
    ]
  },
  {
    label: 'Disabled node',
    value: 'disabled'
  }
];

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

describe('CheckTreePicker', () => {
  it('Should render default value', () => {
    const instance = getDOMNode(<CheckTreePicker defaultOpen data={data} value={['Master']} />);
    expect(
      instance.querySelector('.rs-picker-toggle-value .rs-picker-value-item').innerText
    ).to.equal('Master (All)');
  });

  it('Should clean selected value', () => {
    const instance = getDOMNode(
      <CheckTreePicker defaultOpen data={data} defaultValue={['Master']} />
    );

    ReactTestUtils.Simulate.click(instance.querySelector('.rs-picker-toggle-clean'));
    expect(instance.querySelector('.rs-picker-toggle').innerText).to.equal('Select');
  });

  it('Should output a clean button', () => {
    const instance = getDOMNode(
      <CheckTreePicker defaultOpen data={data} defaultValue={['Master']} />
    );
    assert.ok(instance.querySelector('.rs-picker-toggle-clean'));
  });

  it('Should render CheckTreePicker Menu', () => {
    const instance = getInstance(<CheckTreePicker defaultOpen data={data} />);

    expect(instance.overlay.classList.contains('.rs-picker-check-tree-menu'));
  });

  it('Should output a button', () => {
    const instance = getDOMNode(<CheckTreePicker toggleAs="button" data={[]} />);
    assert.ok(instance.querySelector('button'));
  });

  it('Should be disabled', () => {
    const instance = getDOMNode(<CheckTreePicker disabled data={[]} />);

    assert.ok(instance.className.match(/\bdisabled\b/));
  });

  it('Should be block', () => {
    const instance = getDOMNode(<CheckTreePicker block data={[]} />);

    assert.ok(instance.className.match(/\bblock\b/));
  });

  it('Should active 4 node by `value` when cascade is true', () => {
    const instance = getInstance(<CheckTreePicker open data={data} value={['Master']} />);
    assert.equal(instance.overlay.querySelectorAll('.rs-checkbox-checked').length, 4);
  });

  it('Should active 1 node by `value` when cascade is false', () => {
    const instance = getInstance(
      <CheckTreePicker open cascade={false} data={data} value={['Master']} />
    );
    assert.equal(instance.overlay.querySelectorAll('.rs-checkbox-checked').length, 1);
  });

  it('Should expand children nodes', () => {
    const instance = getInstance(
      <CheckTreePicker open cascade={false} data={data} value={['Master']} />
    );

    ReactTestUtils.Simulate.click(
      instance.overlay.querySelector('div[data-ref="0-0"]  > .rs-check-tree-node-expand-icon')
    );
    assert.equal(instance.overlay.querySelectorAll('.rs-check-tree-open').length, 1);
  });

  it('Should have a placeholder', () => {
    const instance = getDOMNode(<CheckTreePicker data={data} placeholder="test" />);

    assert.equal(instance.querySelector('.rs-picker-toggle-placeholder').innerText, 'test');
  });

  it('Should output a value by renderValue()', () => {
    const placeholder = 'value';

    // Valid value
    const instance = getDOMNode(
      <CheckTreePicker
        data={[
          { value: 1, label: '1' },
          { value: 2, label: '2' }
        ]}
        value={[1, 2]}
        renderValue={value => value.join(',')}
      />
    );

    // Invalid value
    const instance2 = getDOMNode(
      <CheckTreePicker
        placeholder={placeholder}
        renderValue={v => [v, placeholder]}
        data={[]}
        value={[2]}
      />
    );

    // Invalid value
    const instance3 = getDOMNode(
      <CheckTreePicker
        placeholder={placeholder}
        renderValue={v => [v, placeholder]}
        data={[]}
        value={[]}
      />
    );

    assert.equal(instance.querySelector('.rs-picker-toggle-value').innerText, '1,2');
    assert.equal(instance2.querySelector('.rs-picker-toggle-value').innerText, `2${placeholder}`);
    assert.equal(instance3.querySelector('.rs-picker-toggle-placeholder').innerText, placeholder);
  });

  it('Should call renderValue', () => {
    const instance1 = getDOMNode(<CheckTreePicker value={['test']} renderValue={() => '1'} />);
    const instance2 = getDOMNode(<CheckTreePicker value={['test']} renderValue={() => null} />);
    const instance3 = getDOMNode(
      <CheckTreePicker value={['test']} renderValue={() => undefined} />
    );

    assert.equal(instance1.querySelector('.rs-picker-toggle-value').innerText, '1');
    assert.equal(instance2.querySelector('.rs-picker-toggle-placeholder').innerText, 'Select');
    assert.equal(instance3.querySelector('.rs-picker-toggle-placeholder').innerText, 'Select');
  });

  it('Should not be call renderValue()', () => {
    const instance = getDOMNode(<CheckTreePicker data={[]} renderValue={() => 'value'} />);
    assert.equal(instance.querySelector('.rs-picker-toggle-placeholder').innerText, 'Select');
  });

  it('Should render a placeholder when value error', () => {
    const instance = getDOMNode(<CheckTreePicker placeholder="test" data={data} value={['4']} />);
    assert.equal(instance.querySelector('.rs-picker-toggle-placeholder').innerText, 'test');
  });

  it('Should call `onChange` callback with 1 values', done => {
    const doneOp = values => {
      if (values.length === 1) {
        done();
      }
    };
    const instance = getInstance(<CheckTreePicker open onChange={doneOp} data={data} />);
    ReactTestUtils.Simulate.change(instance.overlay.querySelector('div[data-key="0-0"] input'));
  });

  it('Should call `onClean` callback', done => {
    const doneOp = () => {
      done();
    };
    const instance = getDOMNode(
      <CheckTreePicker defaultOpen data={data} defaultValue={['tester0']} onClean={doneOp} />
    );

    ReactTestUtils.Simulate.click(instance.querySelector('.rs-picker-toggle-clean'));
  });

  it('Should call `onOpen` callback', done => {
    const cb = () => {
      done();
    };

    const instance = getDOMNode(<CheckTreePicker onOpen={cb} data={data} />);
    ReactTestUtils.Simulate.click(instance.querySelector('.rs-picker-toggle'));
  });

  it('Should call `onClose` callback', done => {
    const cb = () => {
      done();
    };

    const instance = getDOMNode(<CheckTreePicker onClose={cb} data={data} />);
    ReactTestUtils.Simulate.click(instance.querySelector('.rs-picker-toggle'));
    ReactTestUtils.Simulate.click(instance.querySelector('.rs-picker-toggle'));
  });

  it('Should call `onOpen` callback', done => {
    const doneOp = () => {
      done();
    };
    const picker = getInstance(<CheckTreePicker onOpen={doneOp} data={data} />);
    picker.open();
  });

  it('Should call `onClose` callback', done => {
    const doneOp = () => {
      done();
    };
    const picker = getInstance(<CheckTreePicker defaultOpen onClose={doneOp} data={data} />);
    picker.close();
  });

  it('Should focus item by keyCode=40 ', () => {
    const tree = getInstance(<CheckTreePicker defaultOpen data={data} defaultExpandAll />);
    ReactTestUtils.Simulate.keyDown(tree.target, { key: KEY_VALUES.DOWN });

    assert.equal(tree.overlay.querySelector(itemFocusClassName).innerText, 'Master');
  });

  it('Should focus item by keyCode=38 ', () => {
    const tree = getInstance(<CheckTreePicker defaultOpen data={data} defaultExpandAll />);

    ReactTestUtils.Simulate.change(tree.overlay.querySelector('div[data-key="0-0-1"] input'));
    ReactTestUtils.Simulate.keyDown(tree.target, { key: KEY_VALUES.UP });

    assert.equal(tree.overlay.querySelector(itemFocusClassName).innerText, 'tester0');
  });

  it('Should focus item by keyCode=13 ', done => {
    const doneOp = () => {
      done();
    };
    const tree = getInstance(
      <CheckTreePicker defaultOpen data={data} defaultExpandAll onChange={doneOp} />
    );
    ReactTestUtils.Simulate.change(tree.overlay.querySelector('div[data-key="0-0-1"] input'));
  });

  /**
   * When focus is on an open node, closes the node.
   */
  it('Should fold children node by keyCode=37', () => {
    const tree = getInstance(<CheckTreePicker defaultOpen data={data} defaultExpandAll />);

    ReactTestUtils.Simulate.change(tree.overlay.querySelector('div[data-key="0-0"] input'));
    ReactTestUtils.Simulate.keyDown(tree.overlay, { key: KEY_VALUES.LEFT });
    assert.equal(
      tree.overlay.querySelectorAll(`div[data-ref="0-0"] > ${itemExpandedClassName}`).length,
      0
    );
  });

  /**
   * When focus is on a root node that is also either an end node or a closed node, does nothing.
   */
  it('Should change nothing when trigger on root node by keyCode=37', () => {
    const tree = getInstance(<CheckTreePicker defaultOpen data={data} defaultExpandAll />);

    ReactTestUtils.Simulate.change(tree.overlay.querySelector('div[data-key="0-0"] input'));
    ReactTestUtils.Simulate.keyDown(tree.overlay, { key: KEY_VALUES.LEFT });
    assert.equal(tree.overlay.querySelector(itemFocusClassName).innerText, 'Master');

    assert.equal(
      tree.overlay.querySelectorAll(`div[data-ref="0-0"] > ${itemExpandedClassName}`).length,
      0
    );
  });

  /**
   * When focus is on a child node that is also either an end node or a closed node, moves focus to its parent node.
   */
  it('Should focus on parentNode when trigger on leaf node by keyCode=37', () => {
    const tree = getInstance(<CheckTreePicker defaultOpen data={data} defaultExpandAll />);

    ReactTestUtils.Simulate.change(tree.overlay.querySelector('div[data-key="0-0-0"] input'));
    ReactTestUtils.Simulate.keyDown(tree.overlay, { key: KEY_VALUES.LEFT });
    assert.equal(tree.overlay.querySelector(itemFocusClassName).innerText, 'Master');
  });

  /**
   * When focus is on a closed node, opens the node; focus does not move.
   */
  it('Should fold children node by keyCode=39', () => {
    const tree = getInstance(<CheckTreePicker defaultOpen data={data} />);

    ReactTestUtils.Simulate.change(tree.overlay.querySelector('div[data-key="0-0"] input'));
    ReactTestUtils.Simulate.keyDown(tree.overlay, { key: KEY_VALUES.RIGHT });
    assert.equal(
      tree.overlay.querySelectorAll(`div[data-ref="0-0"] > ${itemExpandedClassName}`).length,
      1
    );
  });

  /**
   * When focus is on an end node, does nothing.
   */
  it('Should change nothing when trigger on leaf node by keyCode=39', () => {
    const tree = getInstance(<CheckTreePicker defaultOpen data={data} defaultExpandAll />);

    ReactTestUtils.Simulate.change(tree.overlay.querySelector('div[data-key="0-0-0"] input'));
    ReactTestUtils.Simulate.keyDown(tree.overlay, { key: KEY_VALUES.RIGHT });
    assert.equal(tree.overlay.querySelector(itemFocusClassName).innerText, 'tester0');
  });

  /**
   * When focus is on a open node, moves focus to the first child node.
   */
  it('Should focus on first child node when node expanded by keyCode=39', () => {
    const tree = getInstance(<CheckTreePicker defaultOpen data={data} defaultExpandAll />);

    ReactTestUtils.Simulate.change(tree.overlay.querySelector('div[data-key="0-0"] input'));
    ReactTestUtils.Simulate.keyDown(tree.overlay, { key: KEY_VALUES.RIGHT });
    assert.equal(tree.overlay.querySelector(itemFocusClassName).innerText, 'tester0');
  });

  it('Should have a custom className', () => {
    const instance = getDOMNode(<CheckTreePicker className="custom" data={data} />);
    assert.include(instance.className, 'custom');
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = getDOMNode(<CheckTreePicker style={{ fontSize }} data={data} />);
    assert.equal(instance.style.fontSize, fontSize);
  });

  it('Should have a custom menuStyle', () => {
    const fontSize = '12px';
    const instance = getInstance(<CheckTreePicker menuStyle={{ fontSize }} data={data} open />);
    assert.equal(getDOMNode(instance.overlay).style.fontSize, fontSize);
  });

  it('Should load data async', () => {
    const data = [
      {
        label: 'Master',
        value: 'Master'
      },
      {
        label: 'async',
        value: 'async',
        children: []
      }
    ];

    const ref = React.createRef();
    ReactTestUtils.act(() => {
      ReactDOM.render(
        <CheckTreePicker
          ref={ref}
          data={data}
          value={['Master']}
          open
          cascade={false}
          defaultExpandAll
          getChildren={() => [
            {
              label: 'children1',
              value: 'children1'
            }
          ]}
        />,
        container
      );
    });

    ReactTestUtils.act(() => {
      ReactTestUtils.Simulate.click(
        ref.current.overlay.querySelector('div[data-ref="0-1"]  > .rs-check-tree-node-expand-icon')
      );
    });

    assert.ok(ref.current.overlay.querySelector('[data-key="0-1-0"]'));
  });

  it('Should render empty tree when searchKeyword is `name`', () => {
    const instance = getInstance(<CheckTreePicker data={data} open searchKeyword="name" />);
    assert.equal(instance.overlay.querySelectorAll('.rs-check-tree-node').length, 0);
  });

  it('Should have a custom className prefix', () => {
    const instance = getDOMNode(<CheckTreePicker data={data} classPrefix="custom-prefix" />);
    assert.ok(instance.className.match(/\bcustom-prefix\b/));
  });

  it('Should render tree without checkbox', () => {
    const instance = getInstance(
      <CheckTreePicker
        data={data}
        open
        uncheckableItemValues={['tester0', 'disabled', 'tester1', 'tester2', 'Master']}
      />
    );

    assert.equal(instance.overlay.querySelectorAll('.rs-check-tree-node-input-wrapper').length, 0);
  });

  it('Should render tree node with custom dom', () => {
    const customData = [
      {
        value: '1',
        label: <span className="custom-label">1</span>
      }
    ];
    const instance = getInstance(<CheckTreePicker data={customData} open />);

    assert.equal(instance.overlay.querySelectorAll('.custom-label').length, 1);
  });

  it('Should render with expand master node', () => {
    const tree = getInstance(
      <CheckTreePicker defaultOpen data={data} expandItemValues={['Master']} />
    );

    const list = getDOMNode(tree.overlay).querySelectorAll('.rs-check-tree-node-expanded');
    assert.equal(list.length, 1);
  });

  it('Should fold all the node when toggle master node', () => {
    const TestApp = React.forwardRef((props, ref) => {
      const pickerRef = React.useRef();
      const [expandItemValues, setExpandItemValues] = React.useState(['Master']);
      React.useImperativeHandle(ref, () => {
        return {
          picker: pickerRef.current,
          setExpandItemValues
        };
      });
      return (
        <CheckTreePicker
          ref={pickerRef}
          {...props}
          data={data}
          open
          expandItemValues={expandItemValues}
        />
      );
    });

    TestApp.displayName = 'TestApp';

    let expandItemValues = [];
    const mockOnExpand = values => {
      expandItemValues = values;
    };
    const ref = React.createRef();
    ReactTestUtils.act(() => {
      ReactDOM.render(<TestApp ref={ref} onExpand={mockOnExpand} />, container);
    });

    assert.ok(ref.current.picker.overlay.querySelector('.rs-check-tree-node-expanded'));

    ReactTestUtils.act(() => {
      ReactTestUtils.Simulate.click(
        ref.current.picker.overlay.querySelector(
          'div[data-ref="0-0"]  > .rs-check-tree-node-expand-icon'
        )
      );
    });

    ReactTestUtils.act(() => {
      ref.current.setExpandItemValues(expandItemValues);
    });

    assert.ok(!ref.current.picker.overlay.querySelector('.rs-check-tree-node-expanded'));
  });

  it('Should render the specified menu content by `searchBy`', () => {
    const instance = getInstance(
      <CheckTreePicker
        defaultOpen
        defaultExpandAll
        data={data}
        searchBy={(a, b, c) => c.value === 'Master'}
      />
    );
    const list = getDOMNode(instance.overlay).querySelectorAll('.rs-check-tree-node');
    assert.equal(list.length, 1);
    assert.ok(list[0].innerText, 'Louisa');
  });

  it('Should only clean the searchKeyword', () => {
    const instance = getInstance(
      <CheckTreePicker defaultOpen defaultExpandAll data={data} defaultValue={['Master']} />
    );

    const searchBar = instance.overlay.querySelector('.rs-picker-search-bar-input');
    ReactTestUtils.Simulate.change(searchBar, {
      target: { value: 'Master' }
    });

    searchBar.focus();
    ReactTestUtils.Simulate.keyDown(searchBar, {
      key: KEY_VALUES.BACKSPACE
    });
    assert.equal(
      instance.root.querySelector('.rs-picker-toggle-value .rs-picker-value-item').innerText,
      'Master (All)'
    );

    ReactTestUtils.Simulate.keyDown(instance.overlay, {
      key: KEY_VALUES.BACKSPACE
    });

    assert.ok(!instance.root.querySelector('.rs-picker-toggle-value .rs-picker-value-item'));
  });
});
