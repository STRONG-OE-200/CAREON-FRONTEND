"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";

// 비밀번호 - 8~20자, 문자, 숫자, 특수문자(@$!%*#?&) 각각 1개 이상 포함
const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("");

  const [passwordRuleError, setPasswordRuleError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  //비밀번호 조건 검사
  useEffect(() => {
    if (password === "") {
      setPasswordRuleError("");
      setIsPasswordValid(false);
    } else if (PASSWORD_REGEX.test(password)) {
      //조건 충족
      setPasswordRuleError("");
      setIsPasswordValid(true);
    } else {
      //조건 미충족
      setPasswordRuleError("문자, 숫자, 특수문자 포함 8~20자로 입력하세요.");
      setIsPasswordValid(false);
    }
  }, [password]);

  // 비밀번호 일치검사
  useEffect(() => {
    if (isPasswordValid && checkPassword && password !== checkPassword) {
      setPasswordMatchError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordMatchError("");
    }
  }, [password, checkPassword, isPasswordValid]);

  // "입력 초기화" 버튼
  const handleReset = () => {
    setName("");
    setPassword("");
    setCheckPassword("");
    setEmailId("");
    setEmailDomain("");
    setPasswordRuleError("");
    setPasswordMatchError("");
    setServerError("");
    // setIsPasswordChecked(false);
    setIsPasswordValid(false);
  };

  // "가입하기" 버튼
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    //최종 검사
    if (!isPasswordValid || password !== checkPassword) {
      alert("비밀번호를 올바르게 입력해주세요.");
      return;
    }

    const fullEmail = `${emailId}@${emailDomain}`;

    const userData = {
      name: name,
      email: fullEmail,
      password: password,
      password2: checkPassword,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      // 서버 응답 처리
      if (response.status === 201) {
        //성공
        const data = await response.json();
        console.log("회원가입 성공", data);
        router.push("/signup/success");
      } else {
        //실패
        const errorData = await response.json();
        //백엔드가 보내주는 에러메세지를 그대로 표시
        const errorMessage = Object.values(errorData).flat().join(" ");
        setServerError(errorMessage || "회원가입에 실패했습니다.");
        console.log("회원가입 실패", errorData);
      }
    } catch (error) {
      //네트워크 에러 등 fetch 자체가 실패한 경우
      console.log("네트워크 오류", error);
      setServerError(
        "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  return (
    <>
      <div>
        <h2>일반 회원가입</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>이름</label>
          <Input
            type="text"
            placeholder="이름을 입력해주세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <div>
            <label>비밀번호</label>
            {passwordRuleError && (
              <span className="text-sm text-red-500">{passwordRuleError}</span>
            )}
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호 입력(문자, 숫자, 특수문자 포함 8~20자)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex items-center">
            <input
              id="show-password-toggle"
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="show-password-toggle"
              className="ml-2 block text-sm text-gray-900"
            >
              비밀번호 표시
            </label>
          </div>
        </div>
        <div>
          <div>
            <label>비밀번호 확인</label>
            {passwordMatchError && (
              <span className="text-sm text-red-500">{passwordMatchError}</span>
            )}
          </div>
          <Input
            type="password"
            placeholder="비밀번호 재입력"
            value={checkPassword}
            onChange={(e) => setCheckPassword(e.target.value)}
            required
            //입력 비활성화
            disabled={!isPasswordValid}
            className={`mt-1 ${!isPasswordValid ? "cursor-not-allowed" : ""}`}
          />
        </div>
        <div>
          <label>이메일</label>
          <div className="flex gap-5 items-center">
            <Input
              type="text"
              placeholder="이메일 주소"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              required
            />
            <p>@</p>
            <Input
              type="text"
              placeholder="gmail.com"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          {serverError && <p className="text-red-500">{serverError}</p>}
          <Button type="submit">가입하기</Button>
          <Button type="button" onClick={handleReset}>
            입력 초기화
          </Button>
        </div>
      </form>
    </>
  );
}
