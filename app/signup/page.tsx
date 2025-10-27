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
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("gmail.com");

  const [nicknameError, setNicknameError] = useState("");
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [passwordRuleError, setPasswordRuleError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  //닉네임 중복확인
  const handleNicknameCheck = () => {
    //닉네임 중복 확인 api 가져오기
    //실제로 데이터 가져오면 아래 함수도 바꿔야 함
    if (nickname === "admin") {
      setNicknameError("사용할 수 없는 닉네임입니다.");
      setIsNicknameChecked(false);
      alert("사용할 수 없는 닉네임입니다.");
    } else {
      setNicknameError("");
      setIsNicknameChecked(true);
      alert("사용 가능한 닉네임입니다.");
    }
  };

  // "입력 초기화" 버튼
  const handleReset = () => {
    setName("");
    setNickname("");
    setPassword("");
    setCheckPassword("");
    setEmailId("");
    setEmailDomain("gmail.com");
    setNicknameError("");
    setPasswordRuleError("");
    setPasswordMatchError("");
    // setIsPasswordChecked(false);
    setIsPasswordValid(false);
  };

  // "가입하기" 버튼
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    //최종 검사
    if (!isPasswordValid || password !== checkPassword) {
      alert("비밀번호를 올바르게 입력해주세요.");
      return;
    }
    if (!isNicknameChecked) {
      alert("닉네임 중복 확인을 해주세요.");
      return;
    }

    const fullEmail = `${emailId}@${emailDomain}`;
    //api 명세서 확인하기(userdata)
    const userData = { name, nickname, password, email: fullEmail };

    //추후 실제로 보내는 걸로 수정
    console.log("data to backEnd : ", userData);
    router.push("/signup/success");
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
          <label>닉네임</label>
          <div className="flex gap-2 mt-1">
            <Input
              type="text"
              placeholder="닉네임 입력"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setIsNicknameChecked(false);
              }}
              required
            />
            <Button
              type="button"
              onClick={handleNicknameCheck}
              className="flex-shrink-0"
            >
              중복 확인
            </Button>
          </div>
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
          <Button type="submit">가입하기</Button>
          <Button type="button" onClick={handleReset}>
            입력 초기화
          </Button>
        </div>
      </form>
    </>
  );
}
