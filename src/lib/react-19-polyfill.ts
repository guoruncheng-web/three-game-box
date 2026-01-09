/**
 * React 18/19 Polyfill for antd-mobile
 * 为 antd-mobile 提供 React 17 遗留 API 的兼容性支持
 */

import * as ReactDOMNamespace from 'react-dom';

// 获取 ReactDOM 对象（可能是 default export 或 namespace）
const ReactDOM = (ReactDOMNamespace as any).default || ReactDOMNamespace;

// React 18+ 使用 createRoot API（从 react-dom/client）
let createRoot: any;
try {
  const ReactDOMClient = require('react-dom/client');
  createRoot = ReactDOMClient.createRoot;
} catch (e) {
  // 降级到 ReactDOM.createRoot（React 18）
  createRoot = ReactDOM.createRoot;
}

/**
 * unmountComponentAtNode polyfill
 * React 17: ReactDOM.unmountComponentAtNode(container)
 * React 18+: root.unmount()
 */
if (typeof ReactDOM.unmountComponentAtNode === 'undefined') {
  // @ts-ignore - 添加 polyfill
  ReactDOM.unmountComponentAtNode = function (container: Element | DocumentFragment) {
    if (!container) return false;

    try {
      // 尝试从容器上获取 root 实例
      // @ts-ignore - React 18+ 内部会在容器上存储 root
      const root = container._reactRootContainer;

      if (root) {
        root.unmount();
        // @ts-ignore
        delete container._reactRootContainer;
        return true;
      }

      // 如果没有找到 root，尝试清空内容（仅适用于 Element）
      if (container instanceof Element && container.childNodes.length > 0) {
        container.innerHTML = '';
        return true;
      }

      return false;
    } catch (error) {
      console.warn('[React Polyfill] Error during unmount:', error);
      return false;
    }
  };
}

/**
 * render polyfill (如果需要)
 * React 17: ReactDOM.render(element, container, callback)
 * React 18+: createRoot(container).render(element)
 */
if (createRoot && typeof ReactDOM.render === 'undefined') {
  // @ts-ignore - 添加 polyfill
  ReactDOM.render = function (
    element: React.ReactElement,
    container: Element | DocumentFragment,
    callback?: () => void
  ) {
    if (!container) {
      throw new Error('Target container is not a DOM element.');
    }

    try {
      // 检查是否已经有 root
      // @ts-ignore
      let root = container._reactRootContainer;

      if (!root) {
        // 创建新的 root
        // @ts-ignore - React 18+ API
        root = createRoot(container);
        // @ts-ignore - 保存 root 引用供 unmount 使用
        container._reactRootContainer = root;
      }

      // 渲染元素
      root.render(element);

      // 执行回调（模拟 React 17 行为）
      if (callback) {
        // 在下一个 tick 执行，模拟 React 17 的时机
        setTimeout(callback, 0);
      }

      return root;
    } catch (error) {
      console.error('[React Polyfill] Error during render:', error);
      throw error;
    }
  };
}

// 输出调试信息（开发和生产环境都输出，方便排查问题）
console.log('[React Polyfill] Initializing...');
console.log('[React Polyfill] unmountComponentAtNode exists:', typeof ReactDOM.unmountComponentAtNode);
console.log('[React Polyfill] render exists:', typeof ReactDOM.render);
console.log('[React Polyfill] createRoot exists:', typeof ReactDOM.createRoot);

if (process.env.NODE_ENV === 'development') {
  console.log('[React Polyfill] ✓ Legacy React APIs polyfilled for antd-mobile compatibility');
}

export {};
