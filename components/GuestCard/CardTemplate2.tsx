import { Guest } from '@/types/guest';

interface CardTemplate2Props {
  guest: Guest;
}

export default function CardTemplate2({ guest }: CardTemplate2Props) {
  return (
    <div
      id="guest-card"
      className="w-full max-w-2xl relative overflow-hidden"
    >
      {/* 華麗漸層背景容器 */}
      <div className="relative rounded-3xl shadow-glow overflow-hidden">
        {/* 多層漸層背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-romantic-100 via-romantic-50 to-wedding-gold-light"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-romantic-200/30 via-transparent to-wedding-gold/20"></div>

        {/* 動態光暈效果 */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-10 left-10 w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 bg-romantic-300 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 bg-wedding-gold rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
        </div>

        {/* 浮動花卉裝飾 */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-8 left-8 text-5xl sm:text-6xl md:text-7xl opacity-15 animate-float">🌹</div>
          <div className="absolute top-8 right-8 text-5xl sm:text-6xl md:text-7xl opacity-15 animate-float animation-delay-1000">🌹</div>
          <div className="absolute bottom-8 left-8 text-4xl sm:text-5xl md:text-6xl opacity-12 animate-float animation-delay-2000">🌺</div>
          <div className="absolute bottom-8 right-8 text-4xl sm:text-5xl md:text-6xl opacity-12 animate-float animation-delay-3000">🌺</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-7xl sm:text-8xl md:text-9xl opacity-8 animate-heartbeat">
            💖
          </div>
          {/* 額外的小裝飾 */}
          <div className="absolute top-1/4 left-1/4 text-2xl sm:text-3xl opacity-10 animate-shimmer">✨</div>
          <div className="absolute top-1/4 right-1/4 text-2xl sm:text-3xl opacity-10 animate-shimmer animation-delay-1000">✨</div>
          <div className="absolute bottom-1/4 left-1/3 text-2xl sm:text-3xl opacity-10 animate-shimmer animation-delay-2000">💫</div>
          <div className="absolute bottom-1/4 right-1/3 text-2xl sm:text-3xl opacity-10 animate-shimmer animation-delay-3000">💫</div>
        </div>

        {/* 主要內容區域 */}
        <div className="relative z-10 p-8 sm:p-10 md:p-14">
          {/* 頂部金色裝飾 */}
          <div className="flex justify-center mb-8 sm:mb-10 animate-fadeInUp">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl md:text-4xl animate-shimmer">✨</span>
              <div className="relative">
                <span className="text-3xl sm:text-4xl md:text-5xl">💐</span>
                <div className="absolute inset-0 bg-wedding-gold blur-xl opacity-40 animate-pulse"></div>
              </div>
              <span className="text-2xl sm:text-3xl md:text-4xl animate-shimmer animation-delay-500">✨</span>
            </div>
          </div>

          {/* 標題區域 - 金色漸層 */}
          <div className="text-center mb-10 sm:mb-12 animate-fadeInUp animation-delay-200">
            <div className="inline-block relative mb-3 sm:mb-4">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient-gold mb-2 tracking-wider">
                {guest.name}
              </h2>
              {/* 標題底部金色光暈 */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-wedding-gold to-transparent opacity-60"></div>
            </div>
            <p className="text-romantic-500 text-sm sm:text-base md:text-lg font-serif italic">
              ~  為您精心準備的祝福  ~
            </p>
          </div>

          {/* 華麗裝飾框架 */}
          <div className="relative mb-8 sm:mb-10 animate-scaleIn animation-delay-400">
            {/* 外層金色邊框 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-wedding-gold via-romantic-400 to-wedding-gold rounded-2xl opacity-30 blur-sm"></div>

            {/* 訊息內容框 */}
            <div className="relative border-4 border-double border-romantic-300/60 rounded-2xl p-8 sm:p-10 md:p-12 glass-strong shadow-soft">
              {/* 四角裝飾 */}
              <div className="absolute top-2 left-2 text-wedding-gold text-sm sm:text-base opacity-60">◈</div>
              <div className="absolute top-2 right-2 text-wedding-gold text-sm sm:text-base opacity-60">◈</div>
              <div className="absolute bottom-2 left-2 text-wedding-gold text-sm sm:text-base opacity-60">◈</div>
              <div className="absolute bottom-2 right-2 text-wedding-gold text-sm sm:text-base opacity-60">◈</div>

              {/* 客製化訊息 */}
              <p className="text-base sm:text-xl md:text-2xl text-gray-800 leading-relaxed sm:leading-loose text-center whitespace-pre-wrap font-serif relative z-10">
                {guest.customization.message}
              </p>
            </div>
          </div>

          {/* 圖片區域 - 華麗金框 */}
          {guest.customization.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 md:gap-8 mb-8 sm:mb-10">
              {guest.customization.images.map((image, index) => (
                <div
                  key={index}
                  className="relative group animate-fadeIn"
                >
                  {/* 金色外光暈 */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-wedding-gold via-romantic-400 to-wedding-gold rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-500"></div>

                  {/* 圖片容器 */}
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-glow border-4 border-white/80 backdrop-blur-sm">
                    <img
                      src={image}
                      alt={`卡片圖片 ${index + 1}`}
                      className="w-full h-40 sm:h-48 md:h-56 object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* 懸停漸層遮罩 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-wedding-gold/20 to-romantic-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* 四角金色裝飾 */}
                    <div className="absolute top-1 left-1 text-wedding-gold text-xs opacity-70">✦</div>
                    <div className="absolute top-1 right-1 text-wedding-gold text-xs opacity-70">✦</div>
                    <div className="absolute bottom-1 left-1 text-wedding-gold text-xs opacity-70">✦</div>
                    <div className="absolute bottom-1 right-1 text-wedding-gold text-xs opacity-70">✦</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 底部金色簽名區 */}
          <div className="flex flex-col items-center gap-4 sm:gap-5 animate-fadeInUp animation-delay-800">
            {/* 裝飾線條 */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-px bg-gradient-to-r from-transparent via-wedding-gold to-transparent w-16 sm:w-20 md:w-24"></div>
              <div className="relative">
                <span className="text-3xl sm:text-4xl animate-heartbeat">💕</span>
                <div className="absolute inset-0 bg-romantic-400 blur-xl opacity-30 animate-pulse-slow"></div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-wedding-gold to-transparent w-16 sm:w-20 md:w-24"></div>
            </div>

            {/* 簽名文字 */}
            <div className="text-center">
              <p className="text-romantic-500 text-sm sm:text-base md:text-lg font-serif italic mb-1">
                祝福滿滿
              </p>
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <span className="text-wedding-gold text-xs sm:text-sm">✧</span>
                <span className="text-romantic-400 text-xs sm:text-sm font-serif">Eternal Love</span>
                <span className="text-wedding-gold text-xs sm:text-sm">✧</span>
              </div>
            </div>

            {/* 底部小裝飾 */}
            <div className="flex items-center gap-2 sm:gap-3 mt-2">
              <span className="text-xs sm:text-sm text-wedding-gold opacity-60 animate-shimmer">★</span>
              <span className="text-sm sm:text-base text-romantic-400 opacity-60">❖</span>
              <span className="text-xs sm:text-sm text-wedding-gold opacity-60 animate-shimmer animation-delay-500">★</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
