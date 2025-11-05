"use client";

import axios from "axios";
import { useRouter } from "next/navigation";

// 1. axios '인스턴스(instance)' 생성
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include", // 명세서의 (CORS-credentials) 옵션 [cite: 374]
});

// 2. "요청(Request) 검문소" (모든 요청에 토큰 자동 삽입)
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

// 3. "응답(Response) 검문소" (자동 토큰 재발급)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 4. 401 에러(토큰 만료)이고, 아직 재시도 안 했으면
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 5. (★핵심 수정★) 명세서에 나온 URL로 수정
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
          {}, // 6. 명세서대로 Request Body는 없음 [cite: 376]
          { credentials: "include" } // 7. 명세서대로 credentials 포함 [cite: 374]
        );

        // 8. 명세서대로 새 'access' 토큰을 받음 [cite: 384, 386]
        const newAccessToken = refreshResponse.data.access;

        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // 9. 원래 요청을 새 토큰으로 다시 보냄
        return api(originalRequest);
      } catch (refreshError) {
        // 10. 'refresh'마저 실패하면 (401 등) [cite: 392]
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
