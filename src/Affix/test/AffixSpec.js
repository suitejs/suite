import React from 'react';
import { getDOMNode } from '@test/testUtils';
import { getOffset } from 'dom-lib';
import Affix from '../Affix';

describe('Affix', () => {
  it('Should render a button', () => {
    const instance = getDOMNode(
      <Affix>
        <button>button</button>
      </Affix>
    );

    assert.equal(instance.children[0].children[0].tagName, 'BUTTON');
  });

  it('Should call onChange callback', () => {
    const buttonRef = React.createRef();
    const affixRef = React.createRef();

    const onChangeSpy = sinon.spy();

    getDOMNode(
      <div style={{ height: 3000 }} data-testid="div">
        <div style={{ height: 100 }}>--</div>
        <Affix top={10} ref={affixRef} onChange={onChangeSpy}>
          <button ref={buttonRef}>button</button>
        </Affix>
      </div>
    );

    const top = getOffset(buttonRef.current).top;

    window.scrollTo({ top });
    window.dispatchEvent(new UIEvent('scroll'));

    expect(onChangeSpy).to.have.been.called;
    const affixDOM = getDOMNode(affixRef.current);
    expect(
      affixDOM.children[0].className === 'rs-affix' &&
        affixDOM.children[0].style.position === 'fixed'
    ).to.be.true;
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = getDOMNode(<Affix style={{ fontSize }} />);
    assert.equal(instance.style.fontSize, fontSize);
  });
});
