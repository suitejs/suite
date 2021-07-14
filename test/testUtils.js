/* eslint-disable react/no-find-dom-node */

import React from 'react';
import ReactDOM, { findDOMNode, unmountComponentAtNode } from 'react-dom';
import * as ReactTestUtils from 'react-dom/test-utils';
import getPalette from './getPalette';
import tinycolor from 'tinycolor2';
export { getStyle } from 'dom-lib';

export const globalKey = 'rs';
const DEFAULT_PRIMARY_COLOR = '#3498ff';
const DARK_PRIMARY_COLOR = '#34c3ff';

export const getDefaultPalette = () => getPalette(DEFAULT_PRIMARY_COLOR);
export const getDarkPalette = () => getPalette(DARK_PRIMARY_COLOR);

/**
 * Check whether it is a DOM object?
 * @param node
 * @return {boolean}
 */
function isDOMElement(node) {
  return (
    node && typeof node === 'object' && node.nodeType === 1 && typeof node.nodeName === 'string'
  );
}

// Record every container created for rendering
// Useful for doing a cleanup after each test case
// Ref: https://github.com/testing-library/react-testing-library/blob/main/src/pure.js
const mountedContainers = new Set();

export function render(children) {
  const container = createTestContainer();

  ReactDOM.render(children, container);

  return container;
}

export function cleanup() {
  mountedContainers.forEach(cleanupAtContainer);
}

afterEach(() => {
  cleanup();
});

// maybe one day we'll expose this (perhaps even as a utility returned by render).
// but let's wait until someone asks for it.
function cleanupAtContainer(container) {
  ReactTestUtils.act(() => {
    unmountComponentAtNode(container);
  });
  if (container.parentNode === document.body) {
    document.body.removeChild(container);
  }
  mountedContainers.delete(container);
}

export function getInstance(children, waitForDidMount = true) {
  // isReactComponent is only defined if children is of React.Component class
  // so we can test against this to verify this is a functional component
  if (!(children.type.prototype && children.type.prototype.isReactComponent)) {
    const instanceRef = React.createRef();

    if (waitForDidMount) {
      // Use act() to make sure componentDidMount/useEffect is done
      ReactTestUtils.act(() => {
        /**
         * https://stackoverflow.com/questions/36682241/testing-functional-components-with-renderintodocument
         */
        render(React.cloneElement(children, { ref: instanceRef }));
      });
    } else {
      render(React.cloneElement(children, { ref: instanceRef }));
    }
    return instanceRef.current;
  }

  let instance;

  // Only use renderIntoDocument on class components
  if (waitForDidMount) {
    ReactTestUtils.act(() => {
      instance = ReactTestUtils.renderIntoDocument(children);
    });
  } else {
    instance = ReactTestUtils.renderIntoDocument(children);
  }

  return instance;
}

/**
 * @return {HTMLElement}
 */
export function getDOMNode(children, waitForDidMount = true) {
  if (isDOMElement(children)) {
    return children;
  }

  if (isDOMElement(children.child)) {
    return children.child;
  }

  if (ReactTestUtils.isCompositeComponent(children)) {
    return findDOMNode(children);
  }

  const instance = getInstance(children, waitForDidMount);

  if (isDOMElement(instance)) {
    return instance;
  }

  if (instance && isDOMElement(instance.root)) {
    return instance.root;
  }

  if (instance && isDOMElement(instance.child)) {
    return instance.child;
  }

  return findDOMNode(instance);
}

/**
 * @param {HTMLElement} node
 * @return {String}
 */
export function innerText(node) {
  if (window.navigator.userAgent.toLowerCase().indexOf('firefox') !== -1) {
    return node.textContent;
  }
  return node.innerText;
}

/**
 * @return {HTMLDivElement}
 */
export function createTestContainer() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  // we'll add it to the mounted containers regardless of whether it's actually
  // added to document.body so the cleanup method works regardless of whether
  // they're passing us a custom container or not.
  mountedContainers.add(container);

  return container;
}

export const toRGB = color => tinycolor(color).toRgbString();

export const inChrome = window.navigator.userAgent.includes('Chrome');

export const itChrome = (...args) => {
  if (inChrome) {
    it(...args);
  }
};
