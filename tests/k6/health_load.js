import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 6 }, 
    { duration: '40s', target: 6 }, 
    { duration: '20s', target: 0 }],
  thresholds: { 
    http_req_duration: ['p(95)<500'], 
    http_req_failed: [{ threshold: 'rate<0.05', abortOnFail: true }] 
  },
};

export default function () {
  let res = http.get('http://localhost:3000/v1/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(Math.random() * 5);
}