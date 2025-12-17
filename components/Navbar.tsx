import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* 왼쪽: 로고와 팀 이름 (클릭하면 홈으로) */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
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

        {/* 오른쪽: 메뉴 리스트 */}
        <div className="flex items-center gap-8">
          <Link href="/tactics" className="text-gray-300 hover:text-white text-sm font-medium transition-colors hover:bg-white/10 px-3 py-2 rounded-lg">
            📺 전술 분석
          </Link>
          <Link href="/upload" className="text-gray-300 hover:text-white text-sm font-medium transition-colors hover:bg-white/10 px-3 py-2 rounded-lg flex items-center gap-1">
            <span>📤</span> 업로드
          </Link>
          {/* 업로드 버튼 아래에 추가 */}
          <Link href="/manage-squad" className="text-gray-300 hover:text-white text-sm font-medium transition-colors hover:bg-white/10 px-3 py-2 rounded-lg flex items-center gap-1">
            <span>✍️</span> 영입
          </Link>
          <Link href="/squad" className="text-gray-300 hover:text-white text-sm font-medium transition-colors hover:bg-white/10 px-3 py-2 rounded-lg">
            ⚽ 선수단
          
          </Link>
          <button className="bg-red-700 hover:bg-red-800 text-white text-xs px-4 py-2 rounded-full font-bold transition-colors">
            LOGIN
          </button>
        </div>

      </div>
    </nav>
  );
}