"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import { useAlert } from "@/lib/AlertContext";

// 비밀번호 - 8~20자, 문자, 숫자, 특수문자(@$!%*#?&) 각각 1개 이상 포함
const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;

export default function SignupPage() {
  const { showAlert } = useAlert();
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (password === "") {
      setPasswordRuleError("");
      setIsPasswordValid(false);
    } else if (PASSWORD_REGEX.test(password)) {
      setPasswordRuleError("");
      setIsPasswordValid(true);
    } else {
      setPasswordRuleError("문자, 숫자, 특수문자 포함 8~20자로 입력하세요.");
      setIsPasswordValid(false);
    }
  }, [password]);

  useEffect(() => {
    if (isPasswordValid && checkPassword && password !== checkPassword) {
      setPasswordMatchError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordMatchError("");
    }
  }, [password, checkPassword, isPasswordValid]);

  const handleReset = () => {
    setName("");
    setPassword("");
    setCheckPassword("");
    setEmailId("");
    setEmailDomain("");
    setPasswordRuleError("");
    setPasswordMatchError("");
    setServerError("");
    setIsPasswordValid(false);
  };

  const handleActualSubmit = async () => {
    setIsModalOpen(false);
    setServerError("");

    const fullEmail = `${emailId}@${emailDomain}`;
    const userData = {
      name: name,
      email: fullEmail,
      password: password,
      password2: checkPassword,
    };

    try {
      const response = await api.post("/auth/signup/", userData);
      if (response.status === 201) {
        //성공
        const data = response.data;
        console.log("회원가입 성공", data);
        router.push("/signup/success");
      } else {
        setServerError("회원가입에 성공했으나, 알 수 없는 응답입니다.");
      }
    } catch (error: any) {
      if (error.response) {
        const errorData = error.response.data;
        const errorMessage = Object.values(errorData).flat().join(" ");
        setServerError(errorMessage || "회원가입에 실패했습니다.");
        console.log("회원가입 실패", errorData);
      } else {
        console.log("네트워크 오류", error);
        setServerError(
          "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!isPasswordValid || password !== checkPassword) {
      showAlert("비밀번호를 올바르게 입력해주세요.");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <h1 className="text-[22px] text-ex-purple font-medium text-center mt-7">
        돌봄온
      </h1>
      <div className="mx-5 my-9">
        <h2 className="text-xl">회원가입</h2>
        <hr className="border-t border-bg-purple w-[350px]" />
      </div>
      <form onSubmit={handleSubmit} className="mx-5 flex flex-col gap-7">
        <div className="flex flex-col gap-1">
          <label>이름</label>
          <Input
            type="text"
            placeholder="이름 입력"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-white border border-bd-purple shadow-lg rounded-4xl w-40 text-gray-400"
          />
        </div>

        <div>
          <label>이메일</label>
          <div className="flex gap-4 items-center">
            <Input
              type="text"
              placeholder="이메일 입력"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              required
              className="bg-white border border-bd-purple shadow-lg rounded-4xl w-40 text-gray-400"
            />
            <p>@</p>
            <Input
              type="text"
              placeholder="gmail.com"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              required
              className="bg-white border border-bd-purple shadow-lg rounded-4xl w-36 text-gray-400"
            />
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
            className="bg-white border border-bd-purple shadow-lg rounded-4xl w-90 text-gray-400"
          />
          <div className="flex items-center pt-3">
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
            className={`mt-1 bg-white border border-bd-purple shadow-lg rounded-4xl w-90 text-gray-400 ${
              !isPasswordValid ? "cursor-not-allowed" : ""
            }`}
          />
        </div>

        <div className="flex flex-col gap-3 mt-[115px]">
          {serverError && <p className="text-red-500">{serverError}</p>}
          <Button type="submit">가입하기</Button>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <p>위의 정보로 회원가입하시겠습니까?</p>
            <div>
              <Button type="button" onClick={handleActualSubmit}>
                예
              </Button>
              <Button type="button" onClick={() => setIsModalOpen(false)}>
                아니오
              </Button>
            </div>
          </Modal>
          <Button type="button" onClick={handleReset} variant="secondary">
            입력 초기화
          </Button>
        </div>
      </form>
    </>
  );
}
