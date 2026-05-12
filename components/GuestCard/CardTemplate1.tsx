import { Guest } from '@/types/guest';

interface CardTemplate1Props {
  guest: Guest;
}

export default function CardTemplate1({ guest }: CardTemplate1Props) {
  return (
    <div
      id="guest-card"
      className="w-full max-w-2xl relative overflow-hidden"
    >
      {/* 外層玻璃擬態容器 */}
      <div className="glass-strong rounded-3xl shadow-soft p-8 sm:p-10 md:p-14 relative">
        {/* 柔和漸層背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-romantic-50 via-white to-romantic-100 opacity-60 rounded-3xl"></div>

        {/* 裝飾性邊框 */}
        <div className="absolute inset-4 border-2 border-romantic-200/40 rounded-2xl pointer-events-none"></div>
        <div className="absolute inset-6 border border-romantic-100/60 rounded-xl pointer-events-none"></div>

        {/* 浮動裝飾元素 */}
        <div className="absolute -top-4 -left-4 text-4xl sm:text-5xl md:text-6xl opacity-15 animate-float">🌸</div>
        <div className="absolute -top-4 -right-4 text-4xl sm:text-5xl md:text-6xl opacity-15 animate-float animation-delay-1000">🌸</div>
        <div className="absolute top-1/2 -left-6 text-3xl sm:text-4xl opacity-10 animate-float animation-delay-2000">💐</div>
        <div className="absolute top-1/2 -right-6 text-3xl sm:text-4xl opacity-10 animate-float animation-delay-3000">💐</div>
        <div className="absolute -bottom-4 left-1/4 text-3xl sm:text-4xl opacity-10 animate-bounce-slow">🦋</div>
        <div className="absolute -bottom-4 right-1/4 text-3xl sm:text-4xl opacity-10 animate-bounce-slow animation-delay-1500">🦋</div>

        {/* 主要內容區域 */}
        <div className="relative z-10">
          {/* 頂部裝飾線條 */}
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 sm:w-16 md:w-20 bg-gradient-to-r from-transparent to-romantic-300"></div>
              <span className="text-romantic-400 text-xs sm:text-sm">✦</span>
              <span className="text-romantic-500 text-sm sm:text-base">❖</span>
              <span className="text-romantic-400 text-xs sm:text-sm">✦</span>
              <div className="h-px w-12 sm:w-16 md:w-20 bg-gradient-to-l from-transparent to-romantic-300"></div>
            </div>
          </div>

          {/* 標題區域 */}
          <div className="text-center mb-8 sm:mb-10 animate-fadeInUp">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-pink mb-2 sm:mb-3 tracking-wide">
              {guest.name}
            </h2>
            <p className="text-romantic-400 text-xs sm:text-sm md:text-base font-serif italic">
              專屬於您的祝福卡片
            </p>
          </div>

          {/* 優雅分隔線 */}
          <div className="flex items-center justify-center mb-8 sm:mb-10 gap-3 sm:gap-4">
            <div className="h-px bg-gradient-to-r from-transparent via-romantic-300 to-transparent flex-1 max-w-[100px] sm:max-w-[150px]"></div>
            <div className="relative">
              <span className="text-2xl sm:text-3xl animate-heartbeat">💝</span>
              <div className="absolute inset-0 bg-romantic-200 blur-lg opacity-30 animate-pulse-slow"></div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-romantic-300 to-transparent flex-1 max-w-[100px] sm:max-w-[150px]"></div>
          </div>

          {/* 訊息內容框 */}
          <div className="glass rounded-2xl p-8 sm:p-10 mb-8 sm:mb-10 border-2 border-romantic-100/50 shadow-soft animate-scaleIn">
            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed sm:leading-loose whitespace-pre-wrap text-center font-serif">
              {guest.customization.message}
            </p>
          </div>

          {/* 圖片區域 */}
          {guest.customization.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
              {guest.customization.images.map((image, index) => (
                <div
                  key={index}
                  className="relative group overflow-hidden rounded-xl sm:rounded-2xl shadow-soft hover:shadow-glow transition-all duration-300 animate-fadeIn"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-romantic-100/20 to-romantic-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                  <img
                    src={image}
                    alt={`卡片圖片 ${index + 1}`}
                    className="w-full h-40 sm:h-48 md:h-56 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-romantic-200/30 rounded-xl sm:rounded-2xl pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}

          {/* 底部裝飾 */}
          <div className="flex justify-center items-center gap-3 sm:gap-4 mt-10 sm:mt-12">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl md:text-4xl animate-heartbeat">💕</span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-romantic-400 text-xs sm:text-sm">✦</span>
                <div className="h-8 sm:h-10 w-px bg-gradient-to-b from-romantic-200 via-romantic-300 to-romantic-200"></div>
                <span className="text-romantic-400 text-xs sm:text-sm">✦</span>
              </div>
              <span className="text-2xl sm:text-3xl md:text-4xl animate-heartbeat animation-delay-500">💕</span>
            </div>
          </div>

          {/* 底部簽名裝飾 */}
          <div className="mt-8 sm:mt-10 text-center">
            <p className="text-romantic-300 text-xs sm:text-sm font-serif italic">
              With Love & Best Wishes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
