import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
  stages: [{ duration: '10s', target: 5 }, 
    { duration: '20s', target: 5 }, 
    { duration: '10s', target: 0 }],
  thresholds: {
        // System's non-Functional Requirements
        http_req_failed: [{ threshold: 'rate<0.001', abortOnFail: true }], 
        http_req_duration: [{ threshold: 'p(95)<500', abortOnFail: true }],
        http_req_duration: ['p(99)<1000'], 
        http_req_duration: ['max<2000'], 
        http_reqs: ['rate > 1'], 
    },
};
export default function () {
  const res = http.get('http://localhost:3000/v1/health');

  sleep(Math.random() * 5);
}