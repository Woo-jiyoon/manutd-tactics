import Image from "next/image";

export default function Home() {
  return (
    // 배경: 완전 검정(black)보다는 눈이 편안한 짙은 회색(neutral-950) 사용
    // text-white: 글씨는 흰색으로
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-16 relative overflow-hidden">
      
      {/* 배경 장식 (선택): 맨유의 붉은색을 은은한 조명 효과(Glow)로 뒤에 깔아줌 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="flex flex-col items-center space-y-12 max-w-lg w-full z-10">
        
        {/* 엠블럼 영역 */}
        <div className="relative w-48 h-48 md:w-60 md:h-60 drop-shadow-2xl animate-fade-in-down">
          <Image
            src="/manutd-logo.png" 
            alt="Manchester United Crest"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        {/* 메인 타이틀: 흰색 텍스트로 깔끔하게 */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-center uppercase drop-shadow-xl leading-none">
          Manchester <br/>
          <span className="text-red-600">United</span>
        </h1>

        {/* 공지사항 박스: 다크모드에 어울리는 유리 효과 */}
        <div className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center shadow-2xl ring-1 ring-white/5 hover:ring-white/20 transition-all duration-300">
          <p className="text-red-500 font-bold mb-3 text-sm tracking-[0.2em] flex items-center justify-center gap-2 uppercase">
            Official Squad
          </p>
          <p className="text-gray-200 text-xl font-light leading-relaxed">
            전술 분석실 오픈 준비중...
          </p>
          <div className="mt-6 flex justify-center gap-2">
             <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
             <span className="w-1.5 h-1.5 bg-white rounded-full opacity-50"></span>
             <span className="w-1.5 h-1.5 bg-white rounded-full opacity-50"></span>
          </div>
        </div>
        
      </div>
      
    </main>
  );
}