import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"
import { Sparkles, ArrowRight, Play } from "lucide-react"

const Hero = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isAuthenticated, user } = useSelector(state => state.auth)

  // Get user role from localStorage if not available in state
  const userRole = user?.role || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))?.role : null)
  const companyLogos = ["slack", "framer", "netflix", "google", "linkedin", "instagram", "facebook"]

  useEffect(() => {
    // Add animation class
    const style = document.createElement('style')
    style.textContent = `
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .marquee-inner {
        animation: marquee linear infinite;
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  return (
    <div className="relative w-full min-h-screen pt-24 pb-12 px-4 sm:px-8 lg:px-12 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {t('hero.badge')}
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white leading-tight mb-6">
            {t('hero.title.part1')}
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('hero.title.part2')}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            {t('hero.description')}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/signup')
              } else if (userRole === 'admin') {
                navigate('/admin-dashboard')
              } else {
                navigate('/ai')
              }
            }}
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/50 active:scale-95"
          >
            {t('hero.startBtn')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded-lg font-semibold transition-all backdrop-blur-sm">
            <Play className="w-5 h-5 fill-white" />
            {t('hero.watchBtn')}
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16 text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white/20 flex items-center justify-center text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white text-xs font-bold">
                  {i}
                </div>
              ))}
            </div>
            <span className="text-sm">{t('hero.trustedBy')}</span>
          </div>
        </div>

        {/* Company Logos - Marquee */}
        <div className="relative mb-20">
          <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none hidden dark:block bg-gradient-to-r dark:from-slate-900 dark:via-transparent dark:to-transparent" />
          <div className="overflow-hidden">
            <div className="marquee-inner flex will-change-transform" style={{ animationDuration: "30s" }}>
              {[...companyLogos, ...companyLogos].map((company, index) => (
                <div key={index} className="px-6 py-4 flex-shrink-0">
                  <img
                    src={`https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/companyLogo/${company}.svg`}
                    alt={company}
                    className="h-8 object-contain opacity-50 hover:opacity-100 transition-opacity"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-20 z-10 pointer-events-none hidden dark:block bg-gradient-to-l dark:from-slate-900 dark:via-transparent dark:to-transparent" />
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "✨", title: t('hero.features.ai'), desc: t('hero.features.aiDesc') },
            { icon: "⚡", title: t('hero.features.fast'), desc: t('hero.features.fastDesc') },
            { icon: "🔒", title: t('hero.features.secure'), desc: t('hero.features.secureDesc') },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-xl bg-white  /5 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all hover:bg-white/10">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Hero
