import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { getDOMNode, getInstance, createTestContainer } from '@test/testUtils';

import Whisper from '../Whisper';
import Tooltip from '../../Tooltip';

describe('Whisper', () => {
  it('Should create Whisper element', () => {
    const instance = getDOMNode(
      <Whisper speaker={<Tooltip>tooltip</Tooltip>}>
        <button type="button">button</button>
      </Whisper>
    );
    assert.equal(instance.nodeName, 'BUTTON');
  });

  it('Should maintain overlay classname when trigger click', () => {
    const whisper = getDOMNode(
      <Whisper trigger="click" speaker={<Tooltip className="test-whisper">test</Tooltip>}>
        <button>button</button>
      </Whisper>
    );
    ReactTestUtils.Simulate.click(whisper);
    assert.equal(document.getElementsByClassName('test-whisper').length, 1);
  });

  it('Should maintain overlay classname when trigger focus', () => {
    const whisper = getDOMNode(
      <Whisper trigger="focus" speaker={<Tooltip className="test-whisper">test</Tooltip>}>
        <button>button</button>
      </Whisper>
    );

    ReactTestUtils.Simulate.focus(whisper);
    assert.equal(document.getElementsByClassName('test-whisper').length, 1);
  });

  it('Should call onClick callback', done => {
    const doneOp = () => {
      done();
    };

    const whisper = getDOMNode(
      <Whisper onClick={doneOp} trigger="click" speaker={<Tooltip />}>
        <button>button</button>
      </Whisper>
    );

    ReactTestUtils.Simulate.click(whisper);
  });

  it('Should call onOpen callback', done => {
    const doneOp = () => {
      done();
    };

    const whisper = getDOMNode(
      <Whisper onOpen={doneOp} trigger="click" speaker={<Tooltip />}>
        <button>button</button>
      </Whisper>
    );

    ReactTestUtils.Simulate.click(whisper);
  });

  it('Should call onOpen callback by open()', done => {
    const doneOp = () => {
      done();
    };
    const instance = getInstance(
      <Whisper onOpen={doneOp} trigger="none" speaker={<Tooltip />}>
        <button>button</button>
      </Whisper>
    );

    instance.open();
  });

  it('Should call onOpen callback', done => {
    const doneOp = () => {
      done();
    };

    const whisper = getDOMNode(
      <Whisper onOpen={doneOp} trigger="click" speaker={<Tooltip />}>
        <button>button</button>
      </Whisper>
    );

    ReactTestUtils.Simulate.click(whisper);
  });

  it('Should call onEntered callback', done => {
    const doneOp = () => {
      done();
    };

    const whisper = getDOMNode(
      <Whisper onEntered={doneOp} trigger="click" speaker={<Tooltip />}>
        <button>button</button>
      </Whisper>
    );

    ReactTestUtils.Simulate.click(whisper);
  });

  it('Should call onClose callback', done => {
    const doneOp = () => {
      done();
    };

    const whisper = getDOMNode(
      <Whisper onClose={doneOp} trigger="click" speaker={<Tooltip />}>
        <button>button</button>
      </Whisper>
    );

    ReactTestUtils.Simulate.click(whisper);
    ReactTestUtils.Simulate.click(whisper);
  });

  it('Should call onExited callback', done => {
    const doneOp = () => {
      done();
    };

    const whisper = getDOMNode(
      <Whisper onExited={doneOp} trigger="click" speaker={<Tooltip />}>
        <button>button</button>
      </Whisper>
    );

    ReactTestUtils.Simulate.click(whisper);
    ReactTestUtils.Simulate.click(whisper);
  });

  it('Should pass transition callbacks to Transition', done => {
    let count = 0;
    const increment = () => {
      count += 1;
    };

    const whisper = getDOMNode(
      <Whisper
        trigger="click"
        speaker={<Tooltip>test</Tooltip>}
        onExit={increment}
        onExiting={increment}
        onExited={() => {
          increment();
          if (count === 6) {
            done();
          }
        }}
        onEnter={increment}
        onEntering={increment}
        onEntered={() => {
          increment();
          ReactTestUtils.Simulate.click(whisper);
        }}
      >
        <button>button</button>
      </Whisper>
    );

    ReactTestUtils.Simulate.click(whisper);
  });

  it('Should Overlay be closed, after call onClose', done => {
    const doneOp = () => {
      done();
    };
    const ref = React.createRef();
    const btnRef = React.createRef();
    // eslint-disable-next-line react/prop-types
    const Overlay = React.forwardRef(({ style, onClose, ...rest }, ref) => {
      return (
        <div {...rest} style={style} ref={ref}>
          <button onClick={onClose}>close</button>
        </div>
      );
    });

    Overlay.displayName = 'Overlay';

    ReactTestUtils.act(() => {
      ReactDOM.render(
        <Whisper
          ref={ref}
          onExited={doneOp}
          trigger="click"
          speaker={(props, ref) => {
            const { className, left, top, onClose } = props;
            return (
              <Overlay style={{ left, top }} onClose={onClose} className={className} ref={ref} />
            );
          }}
        >
          <button ref={btnRef}>button</button>
        </Whisper>,
        createTestContainer()
      );
    });
    ReactTestUtils.act(() => {
      ReactTestUtils.Simulate.click(ref.current.root);
    });

    ReactTestUtils.act(() => {
      ReactTestUtils.Simulate.click(ref.current.overlay.querySelector('button'));
    });
  });
});
