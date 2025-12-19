import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
  stages: [{ duration: '30s', target: 15 }, { duration: '1m', target: 15 }, { duration: '30s', target: 0 }],
  thresholds: { http_req_duration: ['p(95)<500'], http_req_failed: ['rate<0.01'] },
};
export default function () {
  let res = http.get('http://localhost:3000/v1/destinations');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(Math.random() * 5);
}