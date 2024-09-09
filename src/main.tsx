import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import TraceReport from './trace/report/index.ts';

// const options: IOptions = {
//   projectKey: 'test-project', // 项目的key
//   userId: 'digger', // 用户id
//   report: {
//     url: 'http://example.com/report', // 上报url
//     reportType: 'http', // 上报方式
//   },
//   switchs: {
//     // 上报数据开关
//     xhr: true, // xhr请求
//     fetch: true, // fetch请求
//     error: true, // 报错
//     hashchange: true, // hash变化
//     history: true, // history变化
//     whitescreen: true, // 白屏
//     performance: true, // 页面性能
//   },
// };
// Trace.init(options);

new TraceReport({
  id: 'askxbot',
});

createRoot(document.getElementById('root')!).render(<App />);
