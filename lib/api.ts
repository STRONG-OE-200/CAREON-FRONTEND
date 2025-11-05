"use client";

import axios from "axios";
import { useRouter } from "next/navigation";

// 1. axios '인스턴스(instance)' 생성
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // 2. (★수정★) 'credentials: "include"' [cite: 7] 대신 'withCredentials: true'를 사용
});

// 3. "요청(Request) 검문소" (모든 요청에 토큰 자동 삽입)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. "응답(Response) 검문소" (자동 토큰 재발급)
api.interceptors.response.use(
  (response) => {
    return response; // 성공 응답은 통과
  },
  async (error) => {
    const originalRequest = error.config;

    // 5. 401 에러(토큰 만료)이고, 아직 재시도 안 했으면
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 6. (★핵심 수정★) 명세서에 나온 URL로 수정
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
          {}, // 7. 명세서대로 Request Body는 없음 [cite: 9]
          { withCredentials: true } // 8. 명세서대로 credentials 포함 [cite: 7]
        );

        // 9. 명세서대로 새 'access' 토큰을 받음 [cite: 16]
        const newAccessToken = refreshResponse.data.access;

        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // 10. 원래 요청을 새 토큰으로 다시 보냄
        return api(originalRequest);
      } catch (refreshError) {
        // 11. 'refresh'마저 실패하면 (401 등) [cite: 25, 26]
        console.error("토큰 재발급 실패", refreshError);
        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
