// app/components/Navbar.tsx
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* 왼쪽: 로고와 팀 이름 (클릭하면 홈으로) */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            {/* 이미지가 없다면 에러가 날 수 있으니, 
               임시로 public 폴더에 manutd-logo.png가 있는지 확인해주세요.
               없다면 텍스트로 대체하거나 이미지를 넣어야 합니다.
            */}
            <Image 
              src="/manutd-logo.png" 
              alt="Logo" 
              fill 
              className="object-contain group-hover:scale-110 transition-transform"
            />
          </div>
          <span className="font-bold text-lg tracking-wider text-white group-hover:text-red-500 transition-colors">
            MAN UTD
          </span>
        </Link>

        {/* 오른쪽: 메뉴 리스트 (로그인 버튼 삭제됨) */}
        <div className="flex items-center gap-6">
          <Link href="/tactics" className="text-gray-300 hover:text-white text-sm font-medium transition-colors hover:bg-white/10 px-3 py-2 rounded-lg">
            📺 전술 분석
          </Link>
          
          <Link href="/squad" className="text-gray-300 hover:text-white text-sm font-medium transition-colors hover:bg-white/10 px-3 py-2 rounded-lg">
            ⚽ 선수단
          </Link>

          <Link href="/upload" className="text-gray-300 hover:text-white text-sm font-medium transition-colors hover:bg-white/10 px-3 py-2 rounded-lg flex items-center gap-1">
            <span>📤</span> 업로드
          </Link>
          
          {/* '영입' 메뉴는 일단 주석 처리해 둡니다. 나중에 관리자용으로 숨겨진 주소로 쓰거나 할 수 있습니다. */}
           <Link href="/manage-squad" className="text-gray-300 hover:text-white text-sm font-medium transition-colors hover:bg-white/10 px-3 py-2 rounded-lg flex items-center gap-1">
            <span>✍️</span> 영입
          </Link> 
        
        </div>

      </div>
    </nav>
  );
}