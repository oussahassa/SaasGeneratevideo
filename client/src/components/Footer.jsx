import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Footer = () => {

    const navigate = useNavigate()
    const { t } = useTranslation()

  return (
    <footer className="w-full text-gray-800">
    <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">
        <div className="flex items-center space-x-3 mb-6">
            <img alt="logo" 
            className="h-11  cursor-pointer"
            src={assets.logo} 
            onClick={() => {
                navigate("/");
                window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            />
        </div>
        <p className="text-center max-w-xl text-sm font-normal leading-relaxed">
            {t('footer.description')}
        </p>
    </div>
    <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm font-normal">
            <a href="/">nexai</a> {t('footer.copyright')}
        </div>
    </div>
</footer>
  )
}

export default Footer
