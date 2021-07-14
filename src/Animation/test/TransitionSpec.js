import React from 'react';
import Transition from '../Transition';
import { getDOMNode, getInstance } from '@test/testUtils';

describe('Animation', () => {
  it('Should output enteredClassName', () => {
    const instance = getDOMNode(
      <Transition in enteredClassName="class-in">
        <div>test</div>
      </Transition>
    );
    assert.equal(instance.className, 'class-in');
  });

  it('Should outout enteredClassName by function children', () => {
    const instance = getDOMNode(
      <Transition in enteredClassName="class-in">
        {props => <div {...props}>test</div>}
      </Transition>
    );
    assert.equal(instance.className, 'class-in');
  });

  it('Should outout exitedClassName by function children', () => {
    const instance = getDOMNode(
      <Transition exitedClassName="class-out">{props => <div {...props}>test</div>}</Transition>
    );
    assert.equal(instance.className, 'class-out');
  });

  it('Should be transitionAppear', done => {
    const instance = getDOMNode(
      <Transition
        transitionAppear
        in
        timeout={100}
        exitedClassName="class-out"
        enteredClassName="class-in"
        onEntered={() => {
          if (instance.className === 'class-in') {
            done();
          }
        }}
      >
        {props => <div {...props}>test</div>}
      </Transition>
    );
  });

  it('Should call onEnter/onEntering/onEntered callback', done => {
    const actions = {};
    const promises = [
      new Promise(resolve => {
        actions.onEnter = resolve;
      }),
      new Promise(resolve => {
        actions.onEntering = resolve;
      }),
      new Promise(resolve => {
        actions.onEntered = resolve;
      })
    ];

    getInstance(
      <Transition
        transitionAppear
        in
        timeout={100}
        exitedClassName="class-out"
        enteredClassName="class-in"
        onEnter={actions.onEnter}
        onEntering={actions.onEntering}
        onEntered={actions.onEntered}
      >
        {props => <div {...props}>test</div>}
      </Transition>
    );

    Promise.all(promises).then(() => {
      done();
    });
  });

  it('Should call onExit/onExiting/onExited callback', done => {
    const ref = React.createRef();
    const actions = {};
    const promises = [
      new Promise(resolve => {
        actions.onExit = resolve;
      }),
      new Promise(resolve => {
        actions.onExiting = resolve;
      }),
      new Promise(resolve => {
        actions.onExited = resolve;
      })
    ];

    getInstance(
      <Transition
        timeout={100}
        exitedClassName="class-out"
        enteredClassName="class-in"
        onExit={actions.onExit}
        onExiting={actions.onExiting}
        onExited={actions.onExited}
        ref={ref}
      >
        {props => <div {...props}>test</div>}
      </Transition>
    );

    ref.current.performExit();

    Promise.all(promises).then(() => {
      done();
    });
  });
});
